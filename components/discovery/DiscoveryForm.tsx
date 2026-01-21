'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Music2, Hash, MapPin, User, Loader2, Search } from 'lucide-react';
import type { DiscoveryPlatform, SearchType } from '@/types';

interface DiscoveryFormProps {
  onSubmit: (data: {
    platform: DiscoveryPlatform;
    search_type: SearchType;
    search_query: string;
    limit: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function DiscoveryForm({ onSubmit, isLoading = false }: DiscoveryFormProps) {
  const [platform, setPlatform] = useState<DiscoveryPlatform>('instagram');
  const [searchType, setSearchType] = useState<SearchType>('hashtag');
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(50);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    await onSubmit({
      platform,
      search_type: searchType,
      search_query: searchQuery.trim(),
      limit,
    });
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'hashtag':
        return platform === 'instagram' ? 'model, nyfw, streetstyle' : 'fyp, fashion, model';
      case 'location':
        return 'New York, Los Angeles, Miami';
      case 'profile':
        return '@username1, @username2';
      default:
        return 'Enter search query...';
    }
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case 'hashtag':
        return <Hash className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'profile':
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-accent" />
          Start Discovery
        </CardTitle>
        <CardDescription>
          Search social media platforms to discover potential modeling talent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPlatform('instagram')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  platform === 'instagram'
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Instagram className="h-5 w-5" />
                <span className="font-medium">Instagram</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform('tiktok')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  platform === 'tiktok'
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Music2 className="h-5 w-5" />
                <span className="font-medium">TikTok</span>
              </button>
            </div>
          </div>

          {/* Search Type */}
          <div className="space-y-2">
            <Label>Search Type</Label>
            <Select
              value={searchType}
              onValueChange={(value: SearchType) => setSearchType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hashtag">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Hashtag Search
                  </div>
                </SelectItem>
                <SelectItem value="location">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Search
                  </div>
                </SelectItem>
                <SelectItem value="profile">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile Search
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Query */}
          <div className="space-y-2">
            <Label>Search Query</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                {getSearchIcon()}
              </div>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getPlaceholder()}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-zinc-500">
              {searchType === 'hashtag' && 'Enter hashtags without the # symbol'}
              {searchType === 'location' && 'Enter city names or location tags'}
              {searchType === 'profile' && 'Enter usernames without the @ symbol'}
            </p>
          </div>

          {/* Result Limit */}
          <div className="space-y-2">
            <Label>Maximum Results</Label>
            <Select
              value={String(limit)}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 profiles</SelectItem>
                <SelectItem value="50">50 profiles</SelectItem>
                <SelectItem value="100">100 profiles</SelectItem>
                <SelectItem value="200">200 profiles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isLoading || !searchQuery.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Discovery...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start Discovery
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
