import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { RecurrencePattern } from '@/hooks/useRecurringTasks';

interface RecurrencePatternEditorProps {
  value: RecurrencePattern;
  onChange: (pattern: RecurrencePattern) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function RecurrencePatternEditor({ value, onChange }: RecurrencePatternEditorProps) {
  const [endType, setEndType] = useState<'never' | 'date' | 'count'>(
    value.endDate ? 'date' : value.maxOccurrences ? 'count' : 'never'
  );

  const updatePattern = (updates: Partial<RecurrencePattern>) => {
    onChange({ ...value, ...updates });
  };

  const toggleDayOfWeek = (day: number) => {
    const currentDays = value.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort((a, b) => a - b);
    updatePattern({ daysOfWeek: newDays });
  };

  return (
    <div className="space-y-6">
      {/* Frequency Selection */}
      <div className="space-y-3">
        <Label>Repeat</Label>
        <RadioGroup
          value={value.frequency}
          onValueChange={(freq) => updatePattern({ frequency: freq as RecurrencePattern['frequency'] })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily" className="font-normal cursor-pointer">Daily</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekly" id="weekly" />
            <Label htmlFor="weekly" className="font-normal cursor-pointer">Weekly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly" className="font-normal cursor-pointer">Monthly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yearly" id="yearly" />
            <Label htmlFor="yearly" className="font-normal cursor-pointer">Yearly</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Interval */}
      <div className="space-y-2">
        <Label htmlFor="interval">
          Every {value.interval > 1 ? value.interval : ''} {value.frequency === 'daily' ? 'day(s)' : value.frequency === 'weekly' ? 'week(s)' : value.frequency === 'monthly' ? 'month(s)' : 'year(s)'}
        </Label>
        <Input
          id="interval"
          type="number"
          min={1}
          value={value.interval}
          onChange={(e) => updatePattern({ interval: parseInt(e.target.value) || 1 })}
          className="w-24"
        />
      </div>

      {/* Days of Week (for weekly) */}
      {value.frequency === 'weekly' && (
        <div className="space-y-2">
          <Label>Repeat on</Label>
          <div className="flex gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="flex flex-col items-center">
                <Checkbox
                  id={`day-${day.value}`}
                  checked={value.daysOfWeek?.includes(day.value) || false}
                  onCheckedChange={() => toggleDayOfWeek(day.value)}
                />
                <Label
                  htmlFor={`day-${day.value}`}
                  className="text-xs mt-1 cursor-pointer"
                >
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day of Month (for monthly) */}
      {value.frequency === 'monthly' && (
        <div className="space-y-2">
          <Label htmlFor="dayOfMonth">Day of month</Label>
          <Input
            id="dayOfMonth"
            type="number"
            min={1}
            max={31}
            value={value.dayOfMonth || 1}
            onChange={(e) => updatePattern({ dayOfMonth: parseInt(e.target.value) || 1 })}
            className="w-24"
          />
        </div>
      )}

      {/* End Condition */}
      <div className="space-y-3">
        <Label>Ends</Label>
        <RadioGroup value={endType} onValueChange={(type) => setEndType(type as typeof endType)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="never" id="never" />
            <Label htmlFor="never" className="font-normal cursor-pointer">Never</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="date" id="endDate" />
            <Label htmlFor="endDate" className="font-normal cursor-pointer">On date</Label>
          </div>
          {endType === 'date' && (
            <div className="ml-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value.endDate ? format(new Date(value.endDate), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value.endDate ? new Date(value.endDate) : undefined}
                    onSelect={(date) => updatePattern({ 
                      endDate: date ? format(date, 'yyyy-MM-dd') : undefined,
                      maxOccurrences: undefined 
                    })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="count" id="count" />
            <Label htmlFor="count" className="font-normal cursor-pointer">After</Label>
          </div>
          {endType === 'count' && (
            <div className="ml-6 flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={value.maxOccurrences || 10}
                onChange={(e) => updatePattern({ 
                  maxOccurrences: parseInt(e.target.value) || 10,
                  endDate: undefined 
                })}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">occurrences</span>
            </div>
          )}
        </RadioGroup>

        {endType === 'never' && (
          <p className="text-xs text-muted-foreground mt-2">
            Instances will be generated indefinitely
          </p>
        )}
      </div>
    </div>
  );
}
