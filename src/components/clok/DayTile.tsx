import { motion } from 'framer-motion';
import { StickyNote } from 'lucide-react';
import dayjs from 'dayjs';
import { useCalendarStore } from '@/store/calendarStore';

interface Props {
  date: dayjs.Dayjs;
  isCurrentMonth: boolean;
  onNoteClick: (date: string) => void;
}

export function DayTile({ date, isCurrentMonth, onNoteClick }: Props) {
  const { selectedRange, selectDate, notes, tileColors, birthdays } = useCalendarStore();
  const dateStr = date.format('YYYY-MM-DD');
  const isToday = date.isSame(dayjs(), 'day');
  const hasNote = notes.some((n) => n.date === dateStr);
  const hasBirthday = birthdays.some((b) => dayjs(b.date).format('MM-DD') === date.format('MM-DD'));
  const customColor = tileColors[dateStr];

  const { start, end } = selectedRange;
  const isStart = start === dateStr;
  const isEnd = end === dateStr;
  const isInRange =
    start && end && date.isAfter(dayjs(start)) && date.isBefore(dayjs(end));

  let rangeClass = '';
  if (isStart && isEnd) rangeClass = 'calendar-today';
  else if (isStart) rangeClass = 'calendar-range-start';
  else if (isEnd) rangeClass = 'calendar-range-end';
  else if (isInRange) rangeClass = 'calendar-range';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => selectDate(dateStr)}
      className={`relative group flex flex-col items-center justify-start p-1.5 md:p-2 min-h-[48px] md:min-h-[72px] rounded-lg cursor-pointer transition-all duration-200 ${
        !isCurrentMonth ? 'opacity-30' : ''
      } ${isToday && !rangeClass ? 'calendar-today' : ''} ${rangeClass} ${
        !rangeClass && !isToday ? 'calendar-tile' : ''
      }`}
      style={customColor ? { backgroundColor: customColor } : undefined}
    >
      <span
        className={`text-sm md:text-base font-medium ${
          isToday || isStart || isEnd ? 'text-primary-foreground' : 'text-foreground'
        }`}
      >
        {date.date()}
      </span>

      <div className="flex items-center gap-0.5 mt-auto">
        {hasNote && (
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        )}
        {hasBirthday && (
          <span className="text-[10px]">🎂</span>
        )}
      </div>

      {/* Hover action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNoteClick(dateStr);
        }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded bg-foreground/10 transition-opacity"
        title="Add note"
      >
        <StickyNote className="w-3 h-3 text-foreground/60" />
      </button>
    </motion.div>
  );
}
