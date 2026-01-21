import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getGeminiModel(modelName = 'gemini-1.5-flash'): GenerativeModel {
  const client = getGeminiClient();
  return client.getGenerativeModel({ model: modelName });
}

// Fetch an image and convert to base64 for vision analysis
export async function fetchImageAsBase64(url: string): Promise<{
  data: string;
  mimeType: string;
} | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewfaceBot/1.0)',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch image from ${url}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      data: base64,
      mimeType: contentType,
    };
  } catch (error) {
    console.error(`Error fetching image from ${url}:`, error);
    return null;
  }
}

// Create image part for Gemini vision
export function createImagePart(base64Data: string, mimeType: string): Part {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

// Generate content with optional images
export async function generateWithVision(
  prompt: string,
  images: { data: string; mimeType: string }[] = []
): Promise<string> {
  const model = getGeminiModel('gemini-1.5-flash');

  const parts: Part[] = [];

  // Add images first
  for (const image of images) {
    parts.push(createImagePart(image.data, image.mimeType));
  }

  // Add text prompt
  parts.push({ text: prompt });

  const result = await model.generateContent(parts);
  const response = result.response;
  return response.text();
}

// Generate content with text only
export async function generateText(prompt: string): Promise<string> {
  const model = getGeminiModel('gemini-1.5-flash');
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}
