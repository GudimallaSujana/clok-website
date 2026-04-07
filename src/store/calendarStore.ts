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

interface CalendarState {
  currentMonth: Dayjs;
  selectedRange: { start: string | null; end: string | null };
  notes: Note[];
  tasks: Task[];
  birthdays: Birthday[];
  tileColors: Record<string, string>;
  isDark: boolean;
  sidebarOpen: boolean;
  sidebarTab: 'schedule' | 'tasks' | 'birthdays' | 'notes';

  setCurrentMonth: (month: Dayjs) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  selectDate: (date: string) => void;
  clearSelection: () => void;
  addNote: (note: Omit<Note, 'id'>) => void;
  deleteNote: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addBirthday: (birthday: Omit<Birthday, 'id'>) => void;
  deleteBirthday: (id: string) => void;
  setTileColor: (date: string, color: string) => void;
  toggleDark: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarTab: (tab: CalendarState['sidebarTab']) => void;
}

const genId = () => Math.random().toString(36).slice(2, 10);

export const useCalendarStore = create<CalendarState>((set) => ({
  currentMonth: dayjs(),
  selectedRange: { start: null, end: null },
  notes: [],
  tasks: [],
  birthdays: [],
  tileColors: {},
  isDark: false,
  sidebarOpen: false,
  sidebarTab: 'schedule',

  setCurrentMonth: (month) => set({ currentMonth: month }),
  nextMonth: () => set((s) => ({ currentMonth: s.currentMonth.add(1, 'month') })),
  prevMonth: () => set((s) => ({ currentMonth: s.currentMonth.subtract(1, 'month') })),

  selectDate: (date) =>
    set((s) => {
      const { start, end } = s.selectedRange;
      if (!start || (start && end)) {
        return { selectedRange: { start: date, end: null } };
      }
      if (dayjs(date).isBefore(dayjs(start))) {
        return { selectedRange: { start: date, end: start } };
      }
      return { selectedRange: { start, end: date } };
    }),

  clearSelection: () => set({ selectedRange: { start: null, end: null } }),

  addNote: (note) => set((s) => ({ notes: [...s.notes, { ...note, id: genId() }] })),
  deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

  addTask: (task) => set((s) => ({ tasks: [...s.tasks, { ...task, id: genId() }] })),
  toggleTask: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  addBirthday: (b) => set((s) => ({ birthdays: [...s.birthdays, { ...b, id: genId() }] })),
  deleteBirthday: (id) => set((s) => ({ birthdays: s.birthdays.filter((b) => b.id !== id) })),

  setTileColor: (date, color) => set((s) => ({ tileColors: { ...s.tileColors, [date]: color } })),
  toggleDark: () =>
    set((s) => {
      const next = !s.isDark;
      document.documentElement.classList.toggle('dark', next);
      return { isDark: next };
    }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
}));
