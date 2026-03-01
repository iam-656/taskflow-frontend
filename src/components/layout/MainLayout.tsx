import React from 'react';

interface MainLayoutProps {
  sidebar: React.ReactNode;
  chat: React.ReactNode;
  tasks: React.ReactNode;
}

export function MainLayout({ sidebar, chat, tasks }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Left Column: Sidebar */}
      <aside className="w-[260px] flex-shrink-0 border-r border-gray-200 bg-gray-50/50">
        {sidebar}
      </aside>

      {/* Middle Column: Chat Interface */}
      <main className="flex-1 flex flex-col min-w-[400px] bg-white border-r border-gray-200 shadow-sm z-10">
        {chat}
      </main>

      {/* Right Column: Task Feed */}
      <aside className="w-[400px] flex-shrink-0 bg-gray-50">
        {tasks}
      </aside>
    </div>
  );
}
