import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, ImagePlus, Smile, CheckSquare } from 'lucide-react';
import dayjs from 'dayjs';
import { useCalendarStore } from '@/store/calendarStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Holiday } from '@/hooks/useHolidays';
import type { useCalendarData } from '@/hooks/useCalendarData';

const EMOJI_CATEGORIES = [
  { label: 'Smileys', emojis: ['😊', '😂', '🥰', '😍', '😘', '😎', '🤩', '😇', '🥳', '😜', '🤗', '😏', '🤔', '😴', '🤯', '😱'] },
  { label: 'Gestures', emojis: ['👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '💪', '👋', '🫡', '🫶', '👊'] },
  { label: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💝', '💔', '❣️'] },
  { label: 'Symbols', emojis: ['⭐', '🌟', '✨', '🔥', '💯', '🎯', '🏆', '🎉', '🎊', '🎁', '🎵', '💡'] },
  { label: 'Nature', emojis: ['🌸', '🌺', '🌻', '🌹', '🍀', '🌈', '☀️', '🌙', '⛅', '❄️', '🦋', '🐱'] },
  { label: 'Food', emojis: ['🍕', '🍔', '🍰', '🧁', '🍩', '☕', '🍺', '🥂', '🍎', '🍓', '🥑', '🌮'] },
];

interface Props {
  date: dayjs.Dayjs;
  isCurrentMonth: boolean;
  onNoteClick: (date: string) => void;
  onImageUpload: (date: string, file: File) => void;
  onDeleteImage: (date: string) => void;
  holidays?: Holiday[];
  calendarData: ReturnType<typeof useCalendarData>;
}

export function DayTile({ date, isCurrentMonth, onNoteClick, onImageUpload, onDeleteImage, holidays = [], calendarData }: Props) {
  const { selectedRange, selectDate, notes, tileColors, birthdays, dayImages, tasks, emojiReactions, setEmojiReaction } = useCalendarStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number } | null>(null);
  const dateStr = date.format('YYYY-MM-DD');
  const isToday = date.isSame(dayjs(), 'day');
  const hasNote = notes.some((n) => n.date === dateStr);
  const hasBirthday = birthdays.some((b) => dayjs(b.date).format('MM-DD') === date.format('MM-DD'));
  const hasTask = tasks.some((t) => t.date === dateStr && !t.completed);
  const customColor = tileColors[dateStr];
  const dayImage = dayImages[dateStr];
  const dayHolidays = holidays.filter((h) => h.date === dateStr);
  const hasHoliday = dayHolidays.length > 0;
  const reactions = emojiReactions[dateStr] || [];

  const { start, end } = selectedRange;
  const isStart = start === dateStr;
  const isEnd = end === dateStr;
  const isInRange = start && end && date.isAfter(dayjs(start)) && date.isBefore(dayjs(end));

  let rangeClass = '';
  if (isStart && isEnd) rangeClass = 'calendar-today';
  else if (isStart) rangeClass = 'calendar-range-start';
  else if (isEnd) rangeClass = 'calendar-range-end';
  else if (isInRange) rangeClass = 'calendar-range';

  // Close emoji picker on click outside
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = () => setShowEmojiPicker(false);
    const timer = setTimeout(() => document.addEventListener('click', handler), 0);
    return () => { clearTimeout(timer); document.removeEventListener('click', handler); };
  }, [showEmojiPicker]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (dayImage) {
      e.preventDefault();
      e.stopPropagation();
      setShowContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDeleteImage = () => {
    onDeleteImage(dateStr);
    setShowContextMenu(null);
  };

  const handleEmojiSelect = async (emoji: string) => {
    const current = [...reactions];
    const idx = current.indexOf(emoji);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(emoji);
    setEmojiReaction(dateStr, current);
    // Don't close picker on select - let user add multiple
    await calendarData.setEmojiReactionDB(dateStr, current);
  };

  const handleEmojiRemove = async (emoji: string) => {
    const current = reactions.filter(e => e !== emoji);
    setEmojiReaction(dateStr, current);
    await calendarData.setEmojiReactionDB(dateStr, current);
  };

  const tileContent = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => selectDate(dateStr)}
      onContextMenu={handleContextMenu}
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

      <div className="relative z-10 flex items-center gap-0.5 mt-auto flex-wrap justify-center">
        {hasNote && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
        {hasBirthday && <span className="text-base md:text-lg leading-none">🎂</span>}
        {hasTask && <CheckSquare className="w-3 h-3 text-primary" />}
        {hasHoliday && <span className="text-xs md:text-sm">🎉</span>}
        {reactions.length > 0 && (
          <div className="flex gap-0.5 flex-wrap justify-center">
            {reactions.slice(0, 4).map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={(e) => { e.stopPropagation(); handleEmojiRemove(emoji); }}
                className="text-[10px] md:text-xs leading-none hover:scale-125 transition-transform cursor-pointer"
                title="Tap to remove"
              >
                {emoji}
              </button>
            ))}
            {reactions.length > 4 && (
              <span className="text-[8px] text-muted-foreground">+{reactions.length - 4}</span>
            )}
          </div>
        )}
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

      {/* Emoji reaction button - bottom left on hover */}
      <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}
          className="p-0.5 rounded bg-foreground/10"
          title="React"
        >
          <Smile className="w-3 h-3 text-foreground/60" />
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

  return (
    <div className="relative">
      {hasHoliday && isCurrentMonth ? (
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
      ) : tileContent}

      {/* Emoji picker popup - WhatsApp style */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full left-0 mb-1 z-50 bg-popover border border-border rounded-xl p-2 shadow-elevated w-52 max-h-48 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {EMOJI_CATEGORIES.map((cat) => (
              <div key={cat.label} className="mb-1.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5 px-0.5">{cat.label}</p>
                <div className="flex flex-wrap gap-0.5">
                  {cat.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className={`text-sm hover:scale-125 transition-transform p-0.5 rounded ${
                        reactions.includes(emoji) ? 'bg-primary/20 ring-1 ring-primary/40' : 'hover:bg-accent'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context menu for image deletion */}
      {showContextMenu && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setShowContextMenu(null)} />
          <div
            className="fixed z-[70] bg-popover border border-border rounded-lg shadow-elevated py-1 min-w-[140px]"
            style={{ left: showContextMenu.x, top: showContextMenu.y }}
          >
            <button
              onClick={handleDeleteImage}
              className="w-full px-3 py-2 text-sm text-destructive hover:bg-accent text-left"
            >
              🗑️ Delete Image
            </button>
          </div>
        </>
      )}
    </div>
  );
}
