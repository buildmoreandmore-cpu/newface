import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Candidate } from '@/types';

// Demo data with model images
const demoCandidates: (Partial<Candidate> & { image: string })[] = [
  {
    id: '1',
    name: 'Sofia Andersson',
    handle: 'sofia.model',
    platform: 'instagram',
    status: 'discovered',
    ai_score: 94,
    location: 'Stockholm',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop',
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
  },
];

const stats = [
  { label: 'Discovered', value: 28, color: 'bg-blue-500' },
  { label: 'Contacted', value: 12, color: 'bg-amber-500' },
  { label: 'In Meeting', value: 5, color: 'bg-purple-500' },
  { label: 'Signed', value: 7, color: 'bg-emerald-500' },
];

const statusColors: Record<string, string> = {
  discovered: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  meeting: 'bg-purple-100 text-purple-700',
  signed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-4xl md:text-5xl italic tracking-tight text-zinc-900">
            Discover
          </h1>
          <p className="text-zinc-500 mt-1">
            Your talent discovery pipeline
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex flex-wrap gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-zinc-100"
            >
              <div className={`w-2 h-2 rounded-full ${stat.color}`} />
              <span className="text-sm font-medium text-zinc-900">{stat.value}</span>
              <span className="text-sm text-zinc-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {demoCandidates.map((candidate) => (
          <Link
            key={candidate.id}
            href={`/candidates/${candidate.id}`}
            className="group relative block"
          >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100">
              <Image
                src={candidate.image}
                alt={candidate.name || ''}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Score Badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                  <span className="text-sm font-bold text-zinc-900">{candidate.ai_score}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <Badge className={`${statusColors[candidate.status || 'discovered']} border-0 font-medium`}>
                  {candidate.status}
                </Badge>
              </div>

              {/* Info Overlay on Hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white/70 text-xs uppercase tracking-wider">
                  @{candidate.handle}
                </p>
              </div>
            </div>

            {/* Info Below Image */}
            <div className="mt-3 space-y-1">
              <h3 className="font-medium text-zinc-900 group-hover:text-accent transition-colors">
                {candidate.name}
              </h3>
              <p className="text-sm text-zinc-500">
                {candidate.location}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-4">
        <button className="px-8 py-3 rounded-full border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
          Load More Candidates
        </button>
      </div>
    </div>
  );
}
