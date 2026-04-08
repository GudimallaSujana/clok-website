import { useState, useCallback } from 'react';
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

const tearSound = new Audio('/tear.wav');
const addSound = new Audio('/page-add.wav');
tearSound.volume = 0.5;
addSound.volume = 0.5;

interface Props {
  calendarData: ReturnType<typeof useCalendarData>;
}

export function CalendarGrid({ calendarData }: Props) {
  const { currentMonth, nextMonth, prevMonth, setDayImage, setHeroImage, removeDayImage, removeHeroImage } = useCalendarStore();
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

  const handlePrev = () => {
    setDirection(-1);
    addSound.currentTime = 0;
    addSound.play().catch(() => {});
    prevMonth();
  };

  const handleNext = () => {
    setDirection(1);
    tearSound.currentTime = 0;
    tearSound.play().catch(() => {});
    nextMonth();
  };

  const handleImageUpload = async (date: string, file: File) => {
    const url = await calendarData.uploadDayImage(date, file);
    if (url) {
      setDayImage(date, url);
      toast.success('Image uploaded!');
    }
  };

  const handleDeleteDayImage = useCallback(async (date: string) => {
    removeDayImage(date);
    await calendarData.deleteDayImageDB(date);
    toast.success('Day image removed');
  }, [calendarData, removeDayImage]);

  const handleHeroUpload = async (file: File) => {
    const monthKey = currentMonth.format('YYYY-MM');
    const url = await calendarData.uploadHeroImage(file, monthKey);
    if (url) {
      setHeroImage(monthKey, url);
      toast.success('Header image updated!');
    }
  };

  const handleDeleteHero = useCallback(async () => {
    const monthKey = currentMonth.format('YYYY-MM');
    removeHeroImage(monthKey);
    await calendarData.deleteHeroImageDB(monthKey);
    toast.success('Header image removed');
  }, [calendarData, currentMonth, removeHeroImage]);

  // Page tear animation variants
  const tearVariants = {
    enter: (d: number) => ({
      x: d > 0 ? '100%' : '-100%',
      opacity: 0,
      rotateY: d > 0 ? -25 : 25,
      rotateZ: d > 0 ? 3 : -3,
      scale: 0.9,
      transformOrigin: d > 0 ? 'left center' : 'right center',
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      transformOrigin: 'center center',
    },
    exit: (d: number) => ({
      x: d > 0 ? '-60%' : '60%',
      opacity: 0,
      rotateY: d > 0 ? 30 : -30,
      rotateZ: d > 0 ? -5 : 5,
      scale: 0.85,
      transformOrigin: d > 0 ? 'right top' : 'left top',
      filter: 'brightness(0.8)',
    }),
  };

  return (
    <div className="bg-card rounded-2xl shadow-elevated overflow-hidden">
      <HeroImage onHeroUpload={handleHeroUpload} onDeleteHero={handleDeleteHero} />

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

      <div className="px-3 md:px-6 pb-4 md:pb-6 overflow-hidden" style={{ perspective: '1200px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentMonth.format('YYYY-MM')}
            custom={direction}
            variants={tearVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 22, stiffness: 180, duration: 0.5 }}
            className="grid grid-cols-7 gap-1"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {days.map((day) => (
              <DayTile
                key={day.format('YYYY-MM-DD')}
                date={day}
                isCurrentMonth={day.month() === currentMonth.month()}
                onNoteClick={(d) => setNoteDate(d)}
                onImageUpload={handleImageUpload}
                onDeleteImage={handleDeleteDayImage}
                holidays={holidays}
                calendarData={calendarData}
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
