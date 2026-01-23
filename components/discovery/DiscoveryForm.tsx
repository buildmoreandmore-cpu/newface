'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Instagram,
  Music2,
  Hash,
  MapPin,
  User,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  UserPlus,
} from 'lucide-react';
import { HashtagInput } from './HashtagInput';
import { RangeFilter, SingleValueFilter } from './RangeFilter';
import type {
  DiscoveryPlatformOption,
  SearchType,
  TargetCity,
  StreetCastingFilters,
  EnhancedDiscoveryRequest,
} from '@/types';
import { STREET_CASTING_PRESETS, STREET_CASTING_HASHTAGS } from '@/types';

interface DiscoveryFormProps {
  onSubmit: (data: EnhancedDiscoveryRequest) => Promise<void>;
  isLoading?: boolean;
}

const TARGET_CITIES: { value: TargetCity; label: string }[] = [
  { value: 'NYC', label: 'New York City' },
  { value: 'LA', label: 'Los Angeles' },
  { value: 'Chicago', label: 'Chicago' },
  { value: 'Atlanta', label: 'Atlanta' },
];

export function DiscoveryForm({ onSubmit, isLoading = false }: DiscoveryFormProps) {
  const [platforms, setPlatforms] = useState<DiscoveryPlatformOption>('instagram');
  const [searchType, setSearchType] = useState<SearchType>('hashtag');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [limit, setLimit] = useState(50);
  const [streetCastingMode, setStreetCastingMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filters
  const [filters, setFilters] = useState<StreetCastingFilters>({
    followerRange: [1000, 50000],
    maxEngagementRate: 10,
    cities: [],
    ageRange: [18, 35],
    preferUnpolished: false,
  });

  // Apply Street Casting presets when toggled on
  useEffect(() => {
    if (streetCastingMode) {
      setPlatforms('both');
      setHashtags([...STREET_CASTING_HASHTAGS]);
      setFilters({ ...STREET_CASTING_PRESETS });
      setShowAdvanced(true);
    }
  }, [streetCastingMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hashtags.length === 0) return;

    await onSubmit({
      platforms,
      search_type: searchType,
      hashtags,
      limit,
      street_casting_mode: streetCastingMode,
      filters: showAdvanced ? filters : undefined,
    });
  };

  const updateFilter = <K extends keyof StreetCastingFilters>(
    key: K,
    value: StreetCastingFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCity = (city: TargetCity) => {
    setFilters((prev) => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter((c) => c !== city)
        : [...prev.cities, city],
    }));
  };

  const formatFollowers = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
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
          {/* Street Casting Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/5 to-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <div>
                <Label htmlFor="street-casting" className="font-semibold">
                  Street Casting Mode
                </Label>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Optimized for finding raw, undiscovered talent
                </p>
              </div>
            </div>
            <Switch
              id="street-casting"
              checked={streetCastingMode}
              onCheckedChange={setStreetCastingMode}
            />
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPlatforms('instagram')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  platforms === 'instagram'
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Instagram className="h-5 w-5" />
                <span className="font-medium">Instagram</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatforms('tiktok')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  platforms === 'tiktok'
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Music2 className="h-5 w-5" />
                <span className="font-medium">TikTok</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatforms('both')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  platforms === 'both'
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Both</span>
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
                <SelectItem value="followers">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Followers Search
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hashtag/Account Input */}
          <div className="space-y-2">
            <Label>
              {searchType === 'followers' ? 'Accounts to Scrape Followers From' : 'Hashtags to Search'}
            </Label>
            <HashtagInput
              hashtags={hashtags}
              onChange={setHashtags}
              placeholder={
                searchType === 'followers'
                  ? 'Enter usernames without @'
                  : 'Enter hashtags without #'
              }
              maxTags={10}
              mode={searchType === 'followers' ? 'username' : 'hashtag'}
            />
            {searchType === 'followers' && (
              <p className="text-xs text-zinc-500">
                Scrape followers of street casting accounts, small agencies, or photography pages
              </p>
            )}
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

          {/* Advanced Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Advanced Filters
          </button>

          {/* Advanced Filters Section */}
          {showAdvanced && (
            <div className="space-y-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
              {/* Target Cities */}
              <div className="space-y-3">
                <Label>Target Cities</Label>
                <div className="flex flex-wrap gap-2">
                  {TARGET_CITIES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleCity(value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filters.cities.includes(value)
                          ? 'bg-accent text-white'
                          : 'bg-white border border-zinc-200 hover:border-accent/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-500">
                  Filter candidates by location (optional)
                </p>
              </div>

              {/* Follower Range */}
              <RangeFilter
                label="Follower Range"
                value={filters.followerRange}
                onChange={(value) => updateFilter('followerRange', value)}
                min={0}
                max={100000}
                step={500}
                formatValue={formatFollowers}
                description="Filter by follower count to find truly undiscovered talent"
              />

              {/* Max Engagement Rate */}
              <SingleValueFilter
                label="Max Engagement Rate"
                value={filters.maxEngagementRate}
                onChange={(value) => updateFilter('maxEngagementRate', value)}
                min={0.5}
                max={20}
                step={0.5}
                formatValue={(v) => `${v}%`}
                description="Lower engagement often indicates authentic, non-influencer accounts"
              />

              {/* Age Range */}
              <RangeFilter
                label="Target Age Range"
                value={filters.ageRange}
                onChange={(value) => updateFilter('ageRange', value)}
                min={16}
                max={45}
                step={1}
                formatValue={(v) => `${v}`}
                description="AI will estimate age from profile images"
              />

              {/* Prefer Unpolished Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="prefer-unpolished">Prefer Unpolished Content</Label>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Score iPhone/candid shots higher than professional photos
                  </p>
                </div>
                <Switch
                  id="prefer-unpolished"
                  checked={filters.preferUnpolished}
                  onCheckedChange={(checked) =>
                    updateFilter('preferUnpolished', checked)
                  }
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isLoading || hashtags.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {platforms === 'both' ? 'Searching Both Platforms...' : 'Starting Discovery...'}
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                {streetCastingMode ? 'Start Street Casting' : 'Start Discovery'}
              </>
            )}
          </Button>

          {/* Helper Text */}
          {hashtags.length === 0 && (
            <p className="text-center text-sm text-amber-600">
              Add at least one hashtag to start discovery
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
