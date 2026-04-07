import { Navbar } from '@/components/clok/Navbar';
import { AppSidebar } from '@/components/clok/AppSidebar';
import { CalendarGrid } from '@/components/clok/CalendarGrid';
import { NotesPanel } from '@/components/clok/NotesPanel';

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <CalendarGrid />
            <NotesPanel />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
