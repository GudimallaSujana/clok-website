import { useRef } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, ImagePlus } from 'lucide-react';
import dayjs from 'dayjs';
import { useCalendarStore } from '@/store/calendarStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Holiday } from '@/hooks/useHolidays';

interface Props {
  date: dayjs.Dayjs;
  isCurrentMonth: boolean;
  onNoteClick: (date: string) => void;
  onImageUpload: (date: string, file: File) => void;
  holidays?: Holiday[];
}

export function DayTile({ date, isCurrentMonth, onNoteClick, onImageUpload, holidays = [] }: Props) {
  const { selectedRange, selectDate, notes, tileColors, birthdays, dayImages } = useCalendarStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateStr = date.format('YYYY-MM-DD');
  const isToday = date.isSame(dayjs(), 'day');
  const hasNote = notes.some((n) => n.date === dateStr);
  const hasBirthday = birthdays.some((b) => dayjs(b.date).format('MM-DD') === date.format('MM-DD'));
  const customColor = tileColors[dateStr];
  const dayImage = dayImages[dateStr];
  const dayHolidays = holidays.filter((h) => h.date === dateStr);
  const hasHoliday = dayHolidays.length > 0;

  const { start, end } = selectedRange;
  const isStart = start === dateStr;
  const isEnd = end === dateStr;
  const isInRange = start && end && date.isAfter(dayjs(start)) && date.isBefore(dayjs(end));

  let rangeClass = '';
  if (isStart && isEnd) rangeClass = 'calendar-today';
  else if (isStart) rangeClass = 'calendar-range-start';
  else if (isEnd) rangeClass = 'calendar-range-end';
  else if (isInRange) rangeClass = 'calendar-range';

  const tileContent = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => selectDate(dateStr)}
      className={`relative group flex flex-col items-center justify-start p-1.5 md:p-2 min-h-[48px] md:min-h-[72px] rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${
        !isCurrentMonth ? 'opacity-30' : ''
      } ${isToday && !rangeClass ? 'calendar-today' : ''} ${rangeClass} ${
        !rangeClass && !isToday ? 'calendar-tile' : ''
      } ${hasHoliday ? 'ring-2 ring-primary/40' : ''}`}
      style={customColor && !dayImage ? { backgroundColor: customColor } : undefined}
    >
      {dayImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${dayImage})` }}
        >
          <div className="absolute inset-0 bg-foreground/30" />
        </div>
      )}

      <span
        className={`relative z-10 text-sm md:text-base font-medium ${
          isToday || isStart || isEnd || dayImage ? 'text-primary-foreground' : 'text-foreground'
        }`}
      >
        {date.date()}
      </span>

      <div className="relative z-10 flex items-center gap-0.5 mt-auto">
        {hasNote && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
        {hasBirthday && <span className="text-sm md:text-base">🎂</span>}
        {hasHoliday && <span className="text-[10px] md:text-xs">🎉</span>}
      </div>

      {/* Hover actions */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity z-20">
        <button
          onClick={(e) => { e.stopPropagation(); onNoteClick(dateStr); }}
          className="p-0.5 rounded bg-foreground/10"
          title="Add note"
        >
          <StickyNote className="w-3 h-3 text-foreground/60" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="p-0.5 rounded bg-foreground/10"
          title="Upload image"
        >
          <ImagePlus className="w-3 h-3 text-foreground/60" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(dateStr, file);
          e.target.value = '';
        }}
      />
    </motion.div>
  );

  if (hasHoliday && isCurrentMonth) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{tileContent}</TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-0.5">
            {dayHolidays.map((h, i) => (
              <p key={i} className="font-medium">🎉 {h.name}</p>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return tileContent;
}
