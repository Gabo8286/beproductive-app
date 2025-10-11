import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Common color presets
  const presets = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
    '#64748b', '#1e293b', '#374151', '#ffffff', '#000000'
  ];

  return (
    <div className="flex items-center space-x-2">
      <Label className="text-xs w-20 flex-shrink-0">{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 border"
            style={{ backgroundColor: value }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Color Value</Label>
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block">Presets</Label>
              <div className="grid grid-cols-5 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 border"
                    style={{ backgroundColor: preset }}
                    onClick={() => {
                      onChange(preset);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm">Native Color Picker</Label>
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-8 rounded border cursor-pointer mt-1"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-xs font-mono"
      />
    </div>
  );
}