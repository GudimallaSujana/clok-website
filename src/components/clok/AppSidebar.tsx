import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  CheckSquare,
  Cake,
  StickyNote,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCalendarStore } from '@/store/calendarStore';
import { useState } from 'react';
import dayjs from 'dayjs';

const tabs = [
  { id: 'schedule' as const, label: 'Schedule', icon: CalendarDays },
  { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
  { id: 'birthdays' as const, label: 'Birthdays', icon: Cake },
  { id: 'notes' as const, label: 'Notes', icon: StickyNote },
];

export function AppSidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarTab,
    setSidebarTab,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    birthdays,
    addBirthday,
    deleteBirthday,
    notes,
    selectedRange,
  } = useCalendarStore();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar shrink-0 h-full">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
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
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent() {
  const {
    sidebarTab,
    setSidebarTab,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    birthdays,
    addBirthday,
    deleteBirthday,
    notes,
    selectedRange,
  } = useCalendarStore();

  const [newTaskText, setNewTaskText] = useState('');
  const [newBdayName, setNewBdayName] = useState('');
  const [newBdayDate, setNewBdayDate] = useState('');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <nav className="p-3 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              sidebarTab === tab.id
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
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
                  <div className="p-3 rounded-lg bg-sidebar-accent text-sm text-sidebar-accent-foreground">
                    <p>{dayjs(selectedRange.start).format('MMM D, YYYY')}</p>
                    {selectedRange.end && (
                      <p>→ {dayjs(selectedRange.end).format('MMM D, YYYY')}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Click dates to select a range</p>
                )}
              </div>
            )}

            {sidebarTab === 'tasks' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTaskText.trim()) {
                        addTask({ title: newTaskText.trim(), completed: false });
                        setNewTaskText('');
                      }
                    }}
                    placeholder="Add task..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => {
                      if (newTaskText.trim()) {
                        addTask({ title: newTaskText.trim(), completed: false });
                        setNewTaskText('');
                      }
                    }}
                    className="p-2 rounded-lg bg-primary text-primary-foreground"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground'
                      }`}
                    />
                    <span
                      className={`flex-1 text-sm ${
                        task.completed
                          ? 'line-through text-muted-foreground'
                          : 'text-sidebar-foreground'
                      }`}
                    >
                      {task.title}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
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
                    onClick={() => {
                      if (newBdayName.trim() && newBdayDate) {
                        addBirthday({ name: newBdayName.trim(), date: newBdayDate });
                        setNewBdayName('');
                        setNewBdayDate('');
                      }
                    }}
                    className="p-2 rounded-lg bg-primary text-primary-foreground"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {birthdays.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 group">
                    <Cake className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-sidebar-foreground">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(b.date).format('MMM D')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteBirthday(b.id)}
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
                    <div
                      key={note.id}
                      className="p-2 rounded-lg text-sm"
                      style={{ backgroundColor: note.color }}
                    >
                      <p className="text-xs font-medium text-foreground/70">
                        {dayjs(note.date).format('MMM D')}
                      </p>
                      <p className="text-foreground">{note.text}</p>
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
