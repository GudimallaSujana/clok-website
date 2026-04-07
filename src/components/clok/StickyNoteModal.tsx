import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useCalendarStore } from '@/store/calendarStore';
import dayjs from 'dayjs';
import type { useCalendarData } from '@/hooks/useCalendarData';

const COLORS = [
  { name: 'Yellow', value: 'hsl(48, 95%, 76%)' },
  { name: 'Pink', value: 'hsl(340, 80%, 85%)' },
  { name: 'Blue', value: 'hsl(210, 80%, 85%)' },
  { name: 'Green', value: 'hsl(140, 60%, 80%)' },
  { name: 'Purple', value: 'hsl(270, 60%, 85%)' },
];

interface Props {
  date: string;
  open: boolean;
  onClose: () => void;
  calendarData: ReturnType<typeof useCalendarData>;
}

export function StickyNoteModal({ date, open, onClose, calendarData }: Props) {
  const [text, setText] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  const [saving, setSaving] = useState(false);
  const { addNote } = useCalendarStore();

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    const data = await calendarData.addNoteDB(date, text.trim(), color);
    if (data) {
      addNote({ id: data.id, date, text: text.trim(), color });
    }
    setText('');
    setColor(COLORS[0].value);
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 3 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm"
          >
            <div className="rounded-2xl p-6 shadow-elevated" style={{ backgroundColor: color }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {dayjs(date).format('MMM D, YYYY')}
                </h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-foreground/10">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your note..."
                rows={4}
                className="w-full bg-transparent border-none resize-none text-foreground placeholder:text-foreground/40 focus:outline-none font-body"
                autoFocus
              />

              <div className="flex items-center gap-2 mt-4">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c.value ? 'scale-110 border-foreground/40' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 w-full py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Note
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
