import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus } from 'lucide-react';
import heroImg from '@/assets/hero-january.jpg';
import { useCalendarStore } from '@/store/calendarStore';

interface Props {
  onHeroUpload: (file: File) => void;
}

export function HeroImage({ onHeroUpload }: Props) {
  const { currentMonth, heroImages } = useCalendarStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const monthKey = currentMonth.format('YYYY-MM');
  const customHero = heroImages[monthKey];

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-t-2xl group"
      style={{ height: 'clamp(180px, 30vw, 320px)' }}
    >
      <motion.img
        key={customHero || monthKey}
        src={customHero || heroImg}
        alt="Calendar hero"
        className="w-full h-full object-cover"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        width={1920}
        height={768}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

      {/* Upload hero image button on hover */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2.5 rounded-xl bg-foreground/20 backdrop-blur-sm hover:bg-foreground/30 transition-all z-20"
        title="Change header image"
      >
        <ImagePlus className="w-5 h-5 text-white" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onHeroUpload(file);
          e.target.value = '';
        }}
      />

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
