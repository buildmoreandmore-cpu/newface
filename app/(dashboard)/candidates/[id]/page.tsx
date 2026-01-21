import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Instagram,
  Users,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { CandidateStatusBadge } from './CandidateStatusBadge';
import { CandidateNotes } from './CandidateNotes';
import { ScoreDimensions } from '@/components/candidates/ScoreDimensions';

// Extended demo data matching the dashboard with 4-dimension scores
const demoCandidates = [
  {
    id: '1',
    name: 'Sofia Andersson',
    handle: 'sofia.model',
    platform: 'instagram',
    status: 'discovered',
    ai_score: 94,
    location: 'Stockholm',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop',
    followers: 245000,
    engagement_rate: 4.8,
    bio: 'Swedish model based in Stockholm. Specializing in high fashion editorials and luxury brand campaigns. Featured in Vogue Scandinavia and Elle Sweden.',
    vision_analyzed: true,
    physical_potential: { score: 96, confidence: 92, factors: ['Excellent facial symmetry', 'High fashion aesthetic', 'Professional styling'], notes: 'Strong high fashion potential' },
    unsigned_probability: { score: 85, confidence: 78, factors: ['No agency mentions', 'Personal email listed'], notes: 'Likely freelance' },
    reachability: { score: 92, confidence: 88, factors: ['Public contact info', 'Active engagement'], notes: 'Highly reachable' },
    engagement_health: { score: 89, confidence: 85, factors: ['Healthy engagement rate', 'Authentic comments'], notes: 'Strong organic following' },
  },
  {
    id: '2',
    name: 'Kai Chen',
    handle: 'kaichen_',
    platform: 'tiktok',
    status: 'contacted',
    ai_score: 91,
    location: 'Shanghai',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop',
    followers: 520000,
    engagement_rate: 6.2,
    bio: 'Shanghai-based model and content creator. Known for contemporary streetwear campaigns and commercial work with leading Asian brands.',
    vision_analyzed: true,
    physical_potential: { score: 92, confidence: 90, factors: ['Strong jawline', 'Versatile look', 'Commercial appeal'], notes: 'Great for streetwear' },
    unsigned_probability: { score: 78, confidence: 72, factors: ['Growing account', 'Independent creator'], notes: 'Possibly has local representation' },
    reachability: { score: 88, confidence: 82, factors: ['Business email available', 'Active DMs'], notes: 'Open to collaborations' },
    engagement_health: { score: 94, confidence: 91, factors: ['Viral content', 'High engagement'], notes: 'Excellent audience quality' },
  },
  {
    id: '3',
    name: 'Amara Okonkwo',
    handle: 'amarao',
    platform: 'instagram',
    status: 'meeting',
    ai_score: 89,
    location: 'Lagos',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop',
    followers: 178000,
    engagement_rate: 5.4,
    bio: 'Nigerian model and fashion influencer. Passionate about showcasing African fashion on the global stage. Ambassador for sustainable fashion initiatives.',
    vision_analyzed: true,
    physical_potential: { score: 90, confidence: 87, factors: ['Striking features', 'Unique look', 'Editorial presence'], notes: 'High fashion editorial potential' },
    unsigned_probability: { score: 82, confidence: 75, factors: ['No management listed', 'Independent content'], notes: 'Self-represented' },
    reachability: { score: 85, confidence: 80, factors: ['Website contact form', 'Responds to comments'], notes: 'Moderately accessible' },
    engagement_health: { score: 88, confidence: 84, factors: ['Authentic engagement', 'Niche audience'], notes: 'Loyal following' },
  },
  {
    id: '4',
    name: 'Lucas Moreau',
    handle: 'lucasm',
    platform: 'instagram',
    status: 'signed',
    ai_score: 87,
    location: 'Paris',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop',
    followers: 312000,
    engagement_rate: 3.9,
    bio: 'French model represented by Elite Paris. Runway experience with major fashion houses including Dior, Louis Vuitton, and Givenchy.',
    vision_analyzed: true,
    physical_potential: { score: 94, confidence: 95, factors: ['Runway proportions', 'High fashion face', 'Professional portfolio'], notes: 'Established model' },
    unsigned_probability: { score: 15, confidence: 95, factors: ['Agency mentioned', 'Professional management'], notes: 'Already signed to Elite Paris' },
    reachability: { score: 45, confidence: 90, factors: ['Through agency only', 'No direct contact'], notes: 'Requires agency contact' },
    engagement_health: { score: 82, confidence: 88, factors: ['Consistent posting', 'Brand collaborations'], notes: 'Professional account' },
  },
  {
    id: '5',
    name: 'Emma Williams',
    handle: 'emmaw_model',
    platform: 'tiktok',
    status: 'discovered',
    ai_score: 85,
    location: 'London',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop',
    followers: 428000,
    engagement_rate: 7.1,
    bio: 'London-based model and TikTok creator. Combines modeling with beauty content creation. Featured in British Vogue digital campaigns.',
    vision_analyzed: true,
    physical_potential: { score: 86, confidence: 83, factors: ['Natural beauty', 'Commercial look', 'Beauty focus'], notes: 'Strong beauty/commercial potential' },
    unsigned_probability: { score: 88, confidence: 82, factors: ['Creator-focused', 'No agency tags'], notes: 'Likely unsigned' },
    reachability: { score: 90, confidence: 86, factors: ['Email in bio', 'Collaborates often'], notes: 'Very approachable' },
    engagement_health: { score: 95, confidence: 92, factors: ['Viral reach', 'Active community'], notes: 'Exceptional engagement' },
  },
  {
    id: '6',
    name: 'Yuki Tanaka',
    handle: 'yukitanaka',
    platform: 'instagram',
    status: 'contacted',
    ai_score: 92,
    location: 'Tokyo',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop',
    followers: 289000,
    engagement_rate: 5.8,
    bio: 'Tokyo-based model with a unique aesthetic blending traditional and contemporary Japanese fashion. Featured in numerous Japanese fashion magazines.',
    vision_analyzed: true,
    physical_potential: { score: 94, confidence: 91, factors: ['Distinctive style', 'Editorial features', 'Unique aesthetic'], notes: 'High editorial potential' },
    unsigned_probability: { score: 72, confidence: 68, factors: ['Magazine features', 'Professional shots'], notes: 'May have local representation' },
    reachability: { score: 80, confidence: 75, factors: ['Management email', 'Professional inquiries'], notes: 'Through management' },
    engagement_health: { score: 91, confidence: 88, factors: ['Quality audience', 'Strong local following'], notes: 'Healthy engagement' },
  },
  {
    id: '7',
    name: 'Marcus Johnson',
    handle: 'marcusj',
    platform: 'instagram',
    status: 'discovered',
    ai_score: 88,
    location: 'New York',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop',
    followers: 195000,
    engagement_rate: 4.2,
    bio: 'New York model and fitness enthusiast. Specializing in athletic wear and lifestyle campaigns. Former college athlete turned full-time model.',
    vision_analyzed: true,
    physical_potential: { score: 88, confidence: 86, factors: ['Athletic build', 'Commercial appeal', 'Fitness focused'], notes: 'Strong fitness/athletic market' },
    unsigned_probability: { score: 90, confidence: 85, factors: ['Personal branding', 'No agency'], notes: 'Self-managed' },
    reachability: { score: 92, confidence: 88, factors: ['Email visible', 'Responds quickly'], notes: 'Highly accessible' },
    engagement_health: { score: 84, confidence: 80, factors: ['Fitness community', 'Steady growth'], notes: 'Solid engagement' },
  },
  {
    id: '8',
    name: 'Isabella Costa',
    handle: 'bellacosta',
    platform: 'tiktok',
    status: 'meeting',
    ai_score: 90,
    location: 'São Paulo',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop',
    followers: 682000,
    engagement_rate: 8.3,
    bio: 'Brazilian model and social media personality. Known for vibrant content and high-energy campaigns. Brand ambassador for major beauty and fashion brands in Latin America.',
    vision_analyzed: true,
    physical_potential: { score: 92, confidence: 89, factors: ['Vibrant presence', 'Camera natural', 'Commercial star'], notes: 'Excellent commercial potential' },
    unsigned_probability: { score: 65, confidence: 70, factors: ['Brand ambassador', 'Professional content'], notes: 'May have local deals' },
    reachability: { score: 82, confidence: 78, factors: ['Management contact', 'Busy schedule'], notes: 'Through management' },
    engagement_health: { score: 96, confidence: 94, factors: ['Exceptional engagement', 'Viral content'], notes: 'Top-tier engagement' },
  },
];

const statusColors: Record<string, string> = {
  discovered: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  meeting: 'bg-purple-100 text-purple-700',
  signed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  responded: 'bg-cyan-100 text-cyan-700',
};

function getScoreColor(score: number) {
  if (score >= 90) return 'text-emerald-600 bg-emerald-50';
  if (score >= 80) return 'text-blue-600 bg-blue-50';
  if (score >= 70) return 'text-amber-600 bg-amber-50';
  return 'text-zinc-600 bg-zinc-100';
}

function getScoreLabel(score: number) {
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  return 'Average';
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = demoCandidates.find((c) => c.id === id);

  if (!candidate) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discover
        </Link>

        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Photo */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-zinc-100 shadow-xl">
            <Image
              src={candidate.image}
              alt={candidate.name}
              fill
              priority
              className="object-cover"
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Name and Handle */}
            <div>
              <h1 className="font-editorial text-4xl md:text-5xl italic tracking-tight text-zinc-900">
                {candidate.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-zinc-500">
                {candidate.platform === 'instagram' ? (
                  <Instagram className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>@{candidate.handle}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-zinc-500">
                <MapPin className="h-4 w-4" />
                <span>{candidate.location}</span>
              </div>
            </div>

            {/* Status and Score */}
            <div className="flex flex-wrap items-center gap-3">
              <CandidateStatusBadge
                currentStatus={candidate.status}
                statusColors={statusColors}
              />
              <div className={`px-4 py-2 rounded-full font-semibold ${getScoreColor(candidate.ai_score)}`}>
                <span className="text-lg">{candidate.ai_score}</span>
                <span className="text-sm ml-1 opacity-70">/ 100</span>
              </div>
              <span className="text-sm text-zinc-500">
                {getScoreLabel(candidate.ai_score)} Match
              </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Followers</p>
                    <p className="text-lg font-semibold text-zinc-900">
                      {(candidate.followers / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Engagement</p>
                    <p className="text-lg font-semibold text-zinc-900">
                      {candidate.engagement_rate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
              <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
                About
              </h2>
              <p className="text-zinc-700 leading-relaxed">
                {candidate.bio}
              </p>
            </div>

            {/* Platform Badge */}
            <div className="flex items-center gap-2">
              <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-0 capitalize">
                {candidate.platform}
              </Badge>
              <span className="text-sm text-zinc-400">Primary Platform</span>
            </div>

            {/* AI Analysis Dimensions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
              <ScoreDimensions
                physical_potential={candidate.physical_potential}
                unsigned_probability={candidate.unsigned_probability}
                reachability={candidate.reachability}
                engagement_health={candidate.engagement_health}
                vision_analyzed={candidate.vision_analyzed}
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="max-w-xl">
          <CandidateNotes
            candidateId={candidate.id}
            initialNotes=""
          />
        </div>
      </div>
    </div>
  );
}
