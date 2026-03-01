import { MainLayout } from '@/components/layout/MainLayout';
import { Sidebar } from '@/components/features/sidebar/Sidebar';
import { ChatInterface } from '@/components/features/chat/ChatInterface';
import { TaskFeed } from '@/components/features/tasks/TaskFeed';

export default function UpcomingPage() {
  return (
    <MainLayout
      sidebar={<Sidebar />}
      chat={<ChatInterface chatId="upcoming" />}
      tasks={<TaskFeed title="Upcoming" filterType="upcoming" />}
    />
  );
}
