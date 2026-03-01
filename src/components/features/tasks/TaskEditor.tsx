'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Task } from '@/types';
import { useUpdateTask, useCreateTask } from '@/hooks/useTasks';

interface TaskEditorProps {
  task?: Task | null;
  onClose: () => void;
  workspaceId?: string;
}

export function TaskEditor({ task, onClose, workspaceId }: TaskEditorProps) {
  const updateTaskMutation = useUpdateTask();
  const createTaskMutation = useCreateTask();
  
  const isNew = !task;

  const [title, setTitle] = useState(task?.title || '');
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '');
  const [status, setStatus] = useState<'todo' | 'done'>(task?.status || 'todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium');

  // Sync state when switching between tasks (only if not creating a new one)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
      setStatus(task.status);
      setPriority(task.priority);
    } else {
        // Reset for new task
        setTitle('');
        setDueDate('');
        setStatus('todo');
        setPriority('medium');
    }
  }, [task]);

  const handleCreate = () => {
    if (!title.trim()) return;
    
    createTaskMutation.mutate({
        title,
        status,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        description: '',
        workspace_id: workspaceId
    }, {
        onSuccess: () => {
            onClose();
        }
    });
  };

  // Auto-save handlers (only for existing tasks)
  const handleStatusChange = (newStatus: 'todo' | 'done') => {
    setStatus(newStatus);
    if (!isNew && task) {
        updateTaskMutation.mutate({ id: task.id, status: newStatus });
    }
  };

  const handlePriorityChange = (newPriority: 'low' | 'medium' | 'high') => {
    setPriority(newPriority);
    if (!isNew && task) {
        updateTaskMutation.mutate({ id: task.id, priority: newPriority });
    }
  };

  const handleTitleBlur = () => {
    if (!isNew && task && title !== task.title) {
      updateTaskMutation.mutate({ id: task.id, title });
    }
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDueDate(newDate);
    if (!isNew && task) {
        updateTaskMutation.mutate({ id: task.id, due_date: newDate ? new Date(newDate).toISOString() : null });
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-xl p-4 transform transition-transform duration-200 ease-in-out z-50 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-800">{isNew ? 'New Task' : 'Edit Task'}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            autoFocus={isNew}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Due Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={dueDate}
              onChange={handleDueDateChange}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <CalendarIcon className="absolute left-3 top-2.5 text-gray-500" size={16} />
          </div>
        </div>

        <div>
           <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Status
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('todo')}
              className={`px-3 py-1.5 text-sm rounded-md border ${
                status === 'todo' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => handleStatusChange('done')}
              className={`px-3 py-1.5 text-sm rounded-md border ${
                status === 'done' 
                  ? 'bg-green-50 border-green-200 text-green-700 font-medium' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Done
            </button>
          </div>
        </div>

        <div>
           <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Priority
          </label>
          <div className="flex flex-col gap-2">
             {['low', 'medium', 'high'].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePriorityChange(p as any)}
                   className={`px-3 py-1.5 text-sm rounded-md border text-left capitalize ${
                    priority === p 
                      ? 'bg-purple-50 border-purple-200 text-purple-700 font-medium' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
             ))}
          </div>
        </div>

        {isNew && (
            <div className="pt-4 border-t border-gray-100">
                <button
                    onClick={handleCreate}
                    disabled={!title.trim() || createTaskMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={18} />
                    Create Task
                </button>
            </div>
        )}
      </div>
    </div>
  );
}