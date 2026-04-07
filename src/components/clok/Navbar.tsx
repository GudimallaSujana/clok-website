import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Menu, Clock } from 'lucide-react';
import { useCalendarStore } from '@/store/calendarStore';
import dayjs from 'dayjs';

export function Navbar() {
  const { isDark, toggleDark, setSidebarOpen, sidebarOpen } = useCalendarStore();
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-panel border-b border-border"
    >
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-accent transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            CL<span className="text-primary">O</span>K
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-sm font-body">
            <Clock className="w-4 h-4" />
            <span>{time.format('ddd, MMM D')}</span>
            <span className="font-medium text-foreground">{time.format('h:mm:ss A')}</span>
          </div>

          <button
            onClick={toggleDark}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>

          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-semibold">U</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
