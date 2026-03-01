import { MainLayout } from '@/components/layout/MainLayout';
import { Sidebar } from '@/components/features/sidebar/Sidebar';
import { ChatInterface } from '@/components/features/chat/ChatInterface';
import { TaskFeed } from '@/components/features/tasks/TaskFeed';

export default function CompletedPage() {
  return (
    <MainLayout
      sidebar={<Sidebar />}
      chat={<ChatInterface chatId="completed" />} // Ideally this should be a separate chat instance or context-aware
      tasks={<TaskFeed title="Completed" filterType="completed" />}
    />
  );
}
