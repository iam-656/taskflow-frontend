import { MainLayout } from '@/components/layout/MainLayout';
import { Sidebar } from '@/components/features/sidebar/Sidebar';
import { ChatInterface } from '@/components/features/chat/ChatInterface';
import { TaskFeed } from '@/components/features/tasks/TaskFeed';

export default function Home() {
  return (
    <MainLayout
      sidebar={<Sidebar />}
      chat={<ChatInterface chatId="my-day" />}
      tasks={<TaskFeed title="My Day" filterType="my-day" />}
    />
  );
}