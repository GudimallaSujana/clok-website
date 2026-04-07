import { motion } from 'framer-motion';
import heroImg from '@/assets/hero-january.jpg';
import { useCalendarStore } from '@/store/calendarStore';

export function HeroImage() {
  const { currentMonth } = useCalendarStore();

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-t-2xl"
      style={{ height: 'clamp(180px, 30vw, 320px)' }}
    >
      <motion.img
        key={currentMonth.format('YYYY-MM')}
        src={heroImg}
        alt="Calendar hero"
        className="w-full h-full object-cover"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        width={1920}
        height={768}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
      <motion.div
        className="absolute bottom-4 left-6 md:bottom-6 md:left-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="font-display text-3xl md:text-5xl font-bold text-card drop-shadow-lg">
          {currentMonth.format('MMMM')}
        </h2>
        <p className="font-body text-lg md:text-xl text-card/80 drop-shadow">
          {currentMonth.format('YYYY')}
        </p>
      </motion.div>
    </motion.div>
  );
}
