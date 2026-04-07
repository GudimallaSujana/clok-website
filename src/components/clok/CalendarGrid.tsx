import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import { useCalendarStore } from '@/store/calendarStore';
import { HeroImage } from './HeroImage';
import { DayTile } from './DayTile';
import { StickyNoteModal } from './StickyNoteModal';
import { useHolidays } from '@/hooks/useHolidays';
import { toast } from 'sonner';
import type { useCalendarData } from '@/hooks/useCalendarData';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  calendarData: ReturnType<typeof useCalendarData>;
}

export function CalendarGrid({ calendarData }: Props) {
  const { currentMonth, nextMonth, prevMonth, setDayImage, setHeroImage } = useCalendarStore();
  const [noteDate, setNoteDate] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);

  const holidays = useHolidays(currentMonth.year(), currentMonth.month() + 1);

  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const startDay = startOfMonth.day();
  const daysInMonth = endOfMonth.date();

  const days: dayjs.Dayjs[] = [];
  for (let i = startDay - 1; i >= 0; i--) days.push(startOfMonth.subtract(i + 1, 'day'));
  for (let i = 1; i <= daysInMonth; i++) days.push(currentMonth.date(i));
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push(endOfMonth.add(i, 'day'));

  const handlePrev = () => { setDirection(-1); prevMonth(); };
  const handleNext = () => { setDirection(1); nextMonth(); };

  const handleImageUpload = async (date: string, file: File) => {
    const url = await calendarData.uploadDayImage(date, file);
    if (url) {
      setDayImage(date, url);
      toast.success('Image uploaded!');
    }
  };

  const handleHeroUpload = async (file: File) => {
    const monthKey = currentMonth.format('YYYY-MM');
    const url = await calendarData.uploadHeroImage(file, monthKey);
    if (url) {
      setHeroImage(monthKey, url);
      toast.success('Header image updated!');
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, rotateY: d > 0 ? -15 : 15 }),
    center: { x: 0, opacity: 1, rotateY: 0 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0, rotateY: d > 0 ? 15 : -15 }),
  };

  return (
    <div className="bg-card rounded-2xl shadow-elevated overflow-hidden">
      <HeroImage onHeroUpload={handleHeroUpload} />

      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <button onClick={handlePrev} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground">
          {currentMonth.format('MMMM YYYY')}
        </h3>
        <button onClick={handleNext} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 px-3 md:px-6">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      <div className="px-3 md:px-6 pb-4 md:pb-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentMonth.format('YYYY-MM')}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200, duration: 0.4 }}
            className="grid grid-cols-7 gap-1"
          >
            {days.map((day) => (
              <DayTile
                key={day.format('YYYY-MM-DD')}
                date={day}
                isCurrentMonth={day.month() === currentMonth.month()}
                onNoteClick={(d) => setNoteDate(d)}
                onImageUpload={handleImageUpload}
                holidays={holidays}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <StickyNoteModal
        date={noteDate || ''}
        open={!!noteDate}
        onClose={() => setNoteDate(null)}
        calendarData={calendarData}
      />
    </div>
  );
}
