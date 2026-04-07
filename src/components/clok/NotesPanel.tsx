import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { useCalendarStore } from '@/store/calendarStore';

export function NotesPanel() {
  const { notes, deleteNote, selectedRange } = useCalendarStore();

  const filtered = selectedRange.start
    ? notes.filter((n) => {
        const d = dayjs(n.date);
        const s = dayjs(selectedRange.start);
        const e = selectedRange.end ? dayjs(selectedRange.end) : s;
        return (d.isSame(s, 'day') || d.isAfter(s)) && (d.isSame(e, 'day') || d.isBefore(e));
      })
    : notes;

  if (filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-elevated p-4 md:p-6"
    >
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        📝 Notes {selectedRange.start && `for selected dates`}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((note) => (
          <motion.div
            key={note.id}
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="sticky-note group"
            style={{ backgroundColor: note.color }}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-foreground/60">
                {dayjs(note.date).format('MMM D')}
              </p>
              <button
                onClick={() => deleteNote(note.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-destructive transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm text-foreground mt-1">{note.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
