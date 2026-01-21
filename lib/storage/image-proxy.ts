import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create a service role client for storage operations (bypasses RLS)
function getServiceClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for storage operations');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Downloads an image from an external URL and uploads it to Supabase Storage
 * Returns the public URL of the stored image, or null if failed
 */
export async function proxyImageToStorage(
  imageUrl: string,
  username: string,
  platform: string
): Promise<string | null> {
  if (!imageUrl) return null;

  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const extension = getImageExtension(imageUrl);
    const filename = `${platform}/${username}_${timestamp}${extension}`;

    // Download the image with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': platform === 'instagram' ? 'https://www.instagram.com/' : 'https://www.tiktok.com/',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status}`);
      return null;
    }

    // Get the image data as ArrayBuffer
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Upload to Supabase Storage using service role client
    const supabase = getServiceClient();
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filename, imageBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Failed to upload to storage:', error);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    // Silently fail for image proxy errors - not critical
    console.error(`Image proxy failed for ${username}:`, err instanceof Error ? err.message : 'Unknown error');
    return null;
  }
}

/**
 * Extract file extension from URL or default to .jpg
 */
function getImageExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i);
    return match ? `.${match[1].toLowerCase()}` : '.jpg';
  } catch {
    return '.jpg';
  }
}

/**
 * Batch proxy multiple images (with concurrency limit)
 */
export async function proxyImagesInBatch(
  items: Array<{ imageUrl: string; username: string; platform: string }>
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  const concurrencyLimit = 3; // Process 3 at a time to avoid rate limits

  for (let i = 0; i < items.length; i += concurrencyLimit) {
    const batch = items.slice(i, i + concurrencyLimit);
    const promises = batch.map(async (item) => {
      const proxiedUrl = await proxyImageToStorage(
        item.imageUrl,
        item.username,
        item.platform
      );
      results.set(item.username, proxiedUrl);
    });
    await Promise.all(promises);
  }

  return results;
}
