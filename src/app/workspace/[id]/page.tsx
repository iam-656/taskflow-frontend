'use client';

import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Sidebar } from '@/components/features/sidebar/Sidebar';
import { ChatInterface } from '@/components/features/chat/ChatInterface';
import { TaskFeed } from '@/components/features/tasks/TaskFeed';
import { useWorkspaces } from '@/hooks/useWorkspaces';

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { data: workspaces } = useWorkspaces();
  
  const currentWorkspace = workspaces?.find(w => w.id === workspaceId);
  const title = currentWorkspace ? currentWorkspace.name : "List";

  return (
    <MainLayout
      sidebar={<Sidebar />}
      chat={<ChatInterface chatId={`workspace-${workspaceId}`} />}
      tasks={
        <TaskFeed 
            title={title} 
            workspaceId={workspaceId}
            filterType="list"
        />
      }
    />
  );
}
