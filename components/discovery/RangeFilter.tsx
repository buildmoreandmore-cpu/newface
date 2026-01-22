'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface RangeFilterProps {
  label: string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  description?: string;
}

export function RangeFilter({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue = (v) => v.toString(),
  description,
}: RangeFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-medium text-zinc-700">
          {formatValue(value[0])} - {formatValue(value[1])}
        </span>
      </div>
      <Slider
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
        min={min}
        max={max}
        step={step}
        defaultValue={value}
      />
      {description && (
        <p className="text-xs text-zinc-500">{description}</p>
      )}
    </div>
  );
}

interface SingleValueFilterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  description?: string;
}

export function SingleValueFilter({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue = (v) => v.toString(),
  description,
}: SingleValueFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-medium text-zinc-700">
          {formatValue(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
        defaultValue={[value]}
      />
      {description && (
        <p className="text-xs text-zinc-500">{description}</p>
      )}
    </div>
  );
}
