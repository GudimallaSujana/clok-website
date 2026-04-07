import { Navbar } from '@/components/clok/Navbar';
import { AppSidebar } from '@/components/clok/AppSidebar';
import { CalendarGrid } from '@/components/clok/CalendarGrid';
import { NotesPanel } from '@/components/clok/NotesPanel';
import { useCalendarData } from '@/hooks/useCalendarData';
import { useCalendarStore } from '@/store/calendarStore';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const calendarData = useCalendarData();
  const { loading } = useCalendarStore();

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar calendarData={calendarData} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <CalendarGrid calendarData={calendarData} />
              <NotesPanel calendarData={calendarData} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
