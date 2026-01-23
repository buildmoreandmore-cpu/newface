'use client';

import { useState, KeyboardEvent } from 'react';
import { X, Hash, AtSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HashtagInputProps {
  hashtags: string[];
  onChange: (hashtags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  mode?: 'hashtag' | 'username';
}

export function HashtagInput({
  hashtags,
  onChange,
  placeholder = 'Type hashtag and press Enter',
  maxTags = 10,
  mode = 'hashtag',
}: HashtagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const isUsername = mode === 'username';
  const Icon = isUsername ? AtSign : Hash;

  const addHashtag = (tag: string) => {
    const cleaned = tag.toLowerCase().replace(/^[#@]/, '').trim();
    if (cleaned && !hashtags.includes(cleaned) && hashtags.length < maxTags) {
      onChange([...hashtags, cleaned]);
    }
    setInputValue('');
  };

  const removeHashtag = (tagToRemove: string) => {
    onChange(hashtags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && hashtags.length > 0) {
      removeHashtag(hashtags[hashtags.length - 1]);
    } else if (e.key === ',' || e.key === ' ') {
      e.preventDefault();
      if (inputValue.trim()) {
        addHashtag(inputValue);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {hashtags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className={`flex items-center gap-1 px-2 py-1 ${
              isUsername
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-accent/10 text-accent border-accent/20'
            }`}
          >
            <Icon className="h-3 w-3" />
            {tag}
            <button
              type="button"
              onClick={() => removeHashtag(tag)}
              className={`ml-1 rounded-full p-0.5 ${
                isUsername ? 'hover:bg-purple-200' : 'hover:bg-accent/20'
              }`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
          <Icon className="h-4 w-4" />
        </div>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hashtags.length >= maxTags ? 'Max tags reached' : placeholder}
          disabled={hashtags.length >= maxTags}
          className="pl-10"
        />
      </div>
      <p className="text-xs text-zinc-500">
        Press Enter, comma, or space to add. {hashtags.length}/{maxTags} {isUsername ? 'accounts' : 'tags'}.
      </p>
    </div>
  );
}
