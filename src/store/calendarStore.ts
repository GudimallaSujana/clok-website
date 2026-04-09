import { create } from 'zustand';
import dayjs, { Dayjs } from 'dayjs';

export interface Note {
  id: string;
  date: string;
  text: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date?: string;
}

export interface Birthday {
  id: string;
  name: string;
  date: string;
}

export interface Schedule {
  id: string;
  title: string;
  start_date: string;
  end_date?: string;
}

interface CalendarState {
  currentMonth: Dayjs;
  selectedRange: { start: string | null; end: string | null };
  notes: Note[];
  tasks: Task[];
  schedules: Schedule[];
  birthdays: Birthday[];
  tileColors: Record<string, string>;
  dayImages: Record<string, string>;
  heroImages: Record<string, string>;
  emojiReactions: Record<string, string[]>;
  isDark: boolean;
  sidebarOpen: boolean;
  sidebarTab: 'schedule' | 'tasks' | 'birthdays' | 'notes' | 'notifications';
  loading: boolean;

  setCurrentMonth: (month: Dayjs) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  selectDate: (date: string) => void;
  clearSelection: () => void;
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setBirthdays: (birthdays: Birthday[]) => void;
  addBirthday: (birthday: Birthday) => void;
  deleteBirthday: (id: string) => void;
  setSchedules: (schedules: Schedule[]) => void;
  addSchedule: (schedule: Schedule) => void;
  deleteSchedule: (id: string) => void;
  setTileColors: (colors: Record<string, string>) => void;
  setTileColor: (date: string, color: string) => void;
  setDayImages: (images: Record<string, string>) => void;
  setDayImage: (date: string, url: string) => void;
  removeDayImage: (date: string) => void;
  setHeroImage: (month: string, url: string) => void;
  removeHeroImage: (month: string) => void;
  setEmojiReactions: (reactions: Record<string, string[]>) => void;
  setEmojiReaction: (date: string, emojis: string[]) => void;
  toggleDark: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarTab: (tab: CalendarState['sidebarTab']) => void;
  setLoading: (loading: boolean) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  currentMonth: dayjs(),
  selectedRange: { start: null, end: null },
  notes: [],
  tasks: [],
  birthdays: [],
  tileColors: {},
  dayImages: {},
  heroImages: {},
  emojiReactions: {},
  isDark: false,
  sidebarOpen: false,
  sidebarTab: 'schedule',
  loading: false,

  setCurrentMonth: (month) => set({ currentMonth: month }),
  nextMonth: () => set((s) => ({ currentMonth: s.currentMonth.add(1, 'month') })),
  prevMonth: () => set((s) => ({ currentMonth: s.currentMonth.subtract(1, 'month') })),

  selectDate: (date) =>
    set((s) => {
      const { start, end } = s.selectedRange;
      if (!start || (start && end)) return { selectedRange: { start: date, end: null } };
      if (dayjs(date).isBefore(dayjs(start))) return { selectedRange: { start: date, end: start } };
      return { selectedRange: { start, end: date } };
    }),

  clearSelection: () => set({ selectedRange: { start: null, end: null } }),

  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((s) => ({ notes: [...s.notes, note] })),
  deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  toggleTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)) })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  setBirthdays: (birthdays) => set({ birthdays }),
  addBirthday: (b) => set((s) => ({ birthdays: [...s.birthdays, b] })),
  deleteBirthday: (id) => set((s) => ({ birthdays: s.birthdays.filter((b) => b.id !== id) })),

  setTileColors: (colors) => set({ tileColors: colors }),
  setTileColor: (date, color) => set((s) => ({ tileColors: { ...s.tileColors, [date]: color } })),

  setDayImages: (images) => set({ dayImages: images }),
  setDayImage: (date, url) => set((s) => ({ dayImages: { ...s.dayImages, [date]: url } })),
  removeDayImage: (date) => set((s) => {
    const next = { ...s.dayImages };
    delete next[date];
    return { dayImages: next };
  }),

  setHeroImage: (month, url) => set((s) => ({ heroImages: { ...s.heroImages, [month]: url } })),
  removeHeroImage: (month) => set((s) => {
    const next = { ...s.heroImages };
    delete next[month];
    return { heroImages: next };
  }),

  setEmojiReactions: (reactions) => set({ emojiReactions: reactions }),
  setEmojiReaction: (date, emojis) => set((s) => ({ emojiReactions: { ...s.emojiReactions, [date]: emojis } })),

  toggleDark: () =>
    set((s) => {
      const next = !s.isDark;
      document.documentElement.classList.toggle('dark', next);
      return { isDark: next };
    }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setLoading: (loading) => set({ loading }),
}));
