import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, CheckSquare, Cake, StickyNote, X, Plus, Trash2, Loader2, Bell } from 'lucide-react';
import { useCalendarStore } from '@/store/calendarStore';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import type { useCalendarData } from '@/hooks/useCalendarData';

const tabs = [
  { id: 'schedule' as const, label: 'Schedule', icon: CalendarDays },
  { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
  { id: 'birthdays' as const, label: 'Birthdays', icon: Cake },
  { id: 'notes' as const, label: 'Notes', icon: StickyNote },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
];

interface Props {
  calendarData: ReturnType<typeof useCalendarData>;
}

export function AppSidebar({ calendarData }: Props) {
  const { sidebarOpen, setSidebarOpen } = useCalendarStore();

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar shrink-0 h-full">
        <SidebarContent calendarData={calendarData} />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-border z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-display text-lg font-semibold text-sidebar-foreground">Menu</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-sidebar-accent">
                  <X className="w-5 h-5 text-sidebar-foreground" />
                </button>
              </div>
              <SidebarContent calendarData={calendarData} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ calendarData }: Props) {
  const {
    sidebarTab, setSidebarTab,
    tasks, addTask, toggleTask, deleteTask,
    birthdays, addBirthday, deleteBirthday,
    notes, selectedRange, clearSelection,
    schedules, addSchedule, deleteSchedule,
  } = useCalendarStore();

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newBdayName, setNewBdayName] = useState('');
  const [newBdayDate, setNewBdayDate] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);
  const [bdayLoading, setBdayLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    setTaskLoading(true);
    const data = await calendarData.addTaskDB(newTaskText.trim(), newTaskDate || undefined);
    if (data) addTask({ id: data.id, title: data.title, completed: data.completed, date: data.date || undefined });
    setNewTaskText('');
    setNewTaskDate('');
    setTaskLoading(false);
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    toggleTask(id);
    await calendarData.toggleTaskDB(id, !task.completed);
  };

  const handleDeleteTask = async (id: string) => {
    deleteTask(id);
    await calendarData.deleteTaskDB(id);
  };

  const handleAddBirthday = async () => {
    if (!newBdayName.trim() || !newBdayDate) return;
    setBdayLoading(true);
    const data = await calendarData.addBirthdayDB(newBdayName.trim(), newBdayDate);
    if (data) addBirthday({ id: data.id, name: data.name, date: data.date });
    setNewBdayName('');
    setNewBdayDate('');
    setBdayLoading(false);
  };

  const handleDeleteBirthday = async (id: string) => {
    deleteBirthday(id);
    await calendarData.deleteBirthdayDB(id);
  };

  const handleAddSchedule = async () => {
    if (!selectedRange.start || !scheduleTitle.trim()) return;
    setScheduleLoading(true);
    const data = await calendarData.addScheduleDB(
      scheduleTitle.trim(),
      selectedRange.start,
      selectedRange.end || undefined,
    );
    if (data) {
      addSchedule({ id: data.id, title: data.title, start_date: data.start_date, end_date: data.end_date || undefined });
    }
    setScheduleTitle('');
    clearSelection();
    setScheduleLoading(false);
  };

  const handleDeleteSchedule = async (id: string) => {
    deleteSchedule(id);
    await calendarData.deleteScheduleDB(id);
  };

  // Generate notifications
  const notifications = useMemo(() => {
    const items: { type: string; text: string; date: string; icon: string }[] = [];
    const today = dayjs();
    const nextWeek = today.add(7, 'day');

    // Upcoming birthdays within 7 days
    birthdays.forEach((b) => {
      const bdayThisYear = dayjs(b.date).year(today.year());
      const bdayCheck = bdayThisYear.isBefore(today) ? bdayThisYear.add(1, 'year') : bdayThisYear;
      if (bdayCheck.isBefore(nextWeek) && !bdayCheck.isBefore(today, 'day')) {
        items.push({ type: 'birthday', text: `${b.name}'s birthday`, date: bdayCheck.format('MMM D'), icon: '🎂' });
      }
    });

    // Upcoming tasks within 7 days
    tasks.filter((t) => t.date && !t.completed).forEach((t) => {
      const taskDate = dayjs(t.date);
      if (taskDate.isBefore(nextWeek) && !taskDate.isBefore(today, 'day')) {
        items.push({ type: 'task', text: t.title, date: taskDate.format('MMM D'), icon: '✅' });
      }
    });

    // Upcoming schedules within 7 days
    schedules.forEach((s) => {
      const startDate = dayjs(s.start_date);
      if (startDate.isBefore(nextWeek) && !startDate.isBefore(today, 'day')) {
        const endStr = s.end_date ? ` → ${dayjs(s.end_date).format('MMM D')}` : '';
        items.push({ type: 'schedule', text: s.title, date: startDate.format('MMM D') + endStr, icon: '📅' });
      }
    });

    return items.sort((a, b) => {
      const dateA = dayjs(a.date.split(' → ')[0], 'MMM D');
      const dateB = dayjs(b.date.split(' → ')[0], 'MMM D');
      return dateA.valueOf() - dateB.valueOf();
    });
  }, [birthdays, tasks, schedules]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <nav className="p-3 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
              sidebarTab === tab.id
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'notifications' && notifications.length > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={sidebarTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
          >
            {sidebarTab === 'schedule' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-sidebar-foreground">Selected Range</h3>
                {selectedRange.start ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-sidebar-accent text-sm text-sidebar-accent-foreground">
                      <p>{dayjs(selectedRange.start).format('MMM D, YYYY')}</p>
                      {selectedRange.end && <p>→ {dayjs(selectedRange.end).format('MMM D, YYYY')}</p>}
                    </div>
                    <input
                      value={scheduleTitle}
                      onChange={(e) => setScheduleTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddSchedule(); }}
                      placeholder="Event title..."
                      className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={handleAddSchedule}
                      disabled={scheduleLoading || !scheduleTitle.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                    >
                      {scheduleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add to Schedule
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Click dates to select a range</p>
                )}

                {schedules.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-semibold text-sidebar-foreground">Scheduled Events</h3>
                    {schedules.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 group p-2 rounded-lg bg-sidebar-accent/50">
                        <CalendarDays className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-sidebar-foreground truncate">{s.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {dayjs(s.start_date).format('MMM D')}
                            {s.end_date && ` → ${dayjs(s.end_date).format('MMM D')}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-destructive transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {sidebarTab === 'tasks' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <input
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
                    placeholder="Add task..."
                    className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground"
                    />
                    <button
                      onClick={handleAddTask}
                      disabled={taskLoading}
                      className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                    >
                      {taskLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-colors ${
                        task.completed ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`block text-sm truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-sidebar-foreground'}`}>
                        {task.title}
                      </span>
                      {task.date && (
                        <span className="text-[10px] text-muted-foreground">{dayjs(task.date).format('MMM D')}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-destructive transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {sidebarTab === 'birthdays' && (
              <div className="space-y-3">
                <input
                  value={newBdayName}
                  onChange={(e) => setNewBdayName(e.target.value)}
                  placeholder="Name"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newBdayDate}
                    onChange={(e) => setNewBdayDate(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground"
                  />
                  <button
                    onClick={handleAddBirthday}
                    disabled={bdayLoading}
                    className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                  >
                    {bdayLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
                {birthdays.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 group">
                    <Cake className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-sidebar-foreground">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{dayjs(b.date).format('MMM D')}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBirthday(b.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-destructive transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {sidebarTab === 'notes' && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-sidebar-foreground">All Notes</h3>
                {notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Click a date to add notes</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="p-2 rounded-lg text-sm" style={{ backgroundColor: note.color }}>
                      <p className="text-xs font-medium text-foreground/70">{dayjs(note.date).format('MMM D')}</p>
                      <p className="text-foreground">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {sidebarTab === 'notifications' && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-sidebar-foreground">Upcoming</h3>
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent/50">
                      <span className="text-base">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sidebar-foreground truncate">{n.text}</p>
                        <p className="text-[10px] text-muted-foreground">{n.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
