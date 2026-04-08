import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus } from 'lucide-react';
import heroImg from '@/assets/hero-january.jpg';
import { useCalendarStore } from '@/store/calendarStore';

interface Props {
  onHeroUpload: (file: File) => void;
  onDeleteHero: () => void;
}

export function HeroImage({ onHeroUpload, onDeleteHero }: Props) {
  const { currentMonth, heroImages } = useCalendarStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const monthKey = currentMonth.format('YYYY-MM');
  const customHero = heroImages[monthKey];
  const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (customHero) {
      e.preventDefault();
      setShowContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-t-2xl group"
      style={{ height: 'clamp(180px, 30vw, 320px)' }}
      onContextMenu={handleContextMenu}
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
        <h2 className="font-display text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
          {currentMonth.format('MMMM')}
        </h2>
        <p className="font-body text-lg md:text-xl text-white/80 drop-shadow">
          {currentMonth.format('YYYY')}
        </p>
      </motion.div>

      {/* Context menu for hero image deletion */}
      {showContextMenu && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setShowContextMenu(null)} />
          <div
            className="fixed z-[70] bg-popover border border-border rounded-lg shadow-elevated py-1 min-w-[140px]"
            style={{ left: showContextMenu.x, top: showContextMenu.y }}
          >
            <button
              onClick={() => { onDeleteHero(); setShowContextMenu(null); }}
              className="w-full px-3 py-2 text-sm text-destructive hover:bg-accent text-left"
            >
              🗑️ Delete Image
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
