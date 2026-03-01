'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Layout, 
  Calendar, 
  CheckCircle2, 
  Hash, 
  ChevronDown, 
  Plus, 
  Settings,
  List,
  Trash2
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useWorkspaces, useCreateWorkspace, useDeleteWorkspace } from '@/hooks/useWorkspaces';
import { cn } from '@/lib/utils';
import { SettingsModal } from '@/components/features/settings/SettingsModal';

export function Sidebar() {
  const { user } = useUser();
  const { data: workspaces } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  
  const pathname = usePathname();
  const router = useRouter();

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      createWorkspaceMutation.mutate(newWorkspaceName, {
        onSuccess: () => {
          setIsCreatingWorkspace(false);
          setNewWorkspaceName("");
        }
      });
    }
  };

  const handleDeleteWorkspace = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this list?")) {
        deleteWorkspaceMutation.mutate(id, {
            onSuccess: () => {
                if (pathname === `/workspace/${id}`) {
                    router.push('/');
                }
            }
        });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* User Profile */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <img 
          src={user?.imageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} 
          alt={user?.fullName || "Guest"} 
          className="w-8 h-8 rounded-full bg-gray-200"
        />
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate text-gray-900">{user?.fullName || "Guest"}</p>
          <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress || "guest@example.com"}</p>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-6">
          {/* Workspaces */}
          <div className="flex items-center justify-between px-2 mb-2 group">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Workspace
            </h3>
            <button 
              onClick={() => setIsCreatingWorkspace(true)}
              className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus size={14} />
            </button>
          </div>

          <Link href="/">
            <NavItem icon={<Layout size={18} />} label="My Day" active={pathname === '/'} />
          </Link>
          <Link href="/upcoming">
            <NavItem icon={<Calendar size={18} />} label="Upcoming" active={pathname === '/upcoming'} />
          </Link>
          <Link href="/completed">
            <NavItem icon={<CheckCircle2 size={18} />} label="Completed" active={pathname === '/completed'} />
          </Link>

          {isCreatingWorkspace && (
            <form onSubmit={handleCreateWorkspace} className="mt-2 px-2">
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="List name..."
                className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900"
                autoFocus
                onBlur={() => !newWorkspaceName && setIsCreatingWorkspace(false)}
              />
            </form>
          )}

          <div className="mt-4 space-y-1">
            {workspaces?.map((ws) => (
              <Link key={ws.id} href={`/workspace/${ws.id}`} className="group block relative">
                <NavItem 
                  icon={<List size={18} />} 
                  label={ws.name} 
                  active={pathname === `/workspace/${ws.id}`} 
                />
                <button
                    onClick={(e) => handleDeleteWorkspace(e, ws.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                    <Trash2 size={14} />
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 w-full px-2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
        active 
          ? "bg-blue-50 text-blue-700" 
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <span className={cn(active ? "text-blue-600" : "text-gray-500")}>
        {icon}
      </span>
      {label}
    </div>
  );
}