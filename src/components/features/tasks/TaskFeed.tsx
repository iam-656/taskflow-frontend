'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal, 
  Calendar as CalendarIcon,
  Flag,
  Circle,
  Plus,
  CheckCircle2,
  Trash2,
  Check
} from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { TaskEditor } from './TaskEditor';

interface TaskFeedProps {
  defaultFilter?: {
    status?: string[];
  };
  title?: string;
  workspaceId?: string;
  filterType?: 'my-day' | 'upcoming' | 'completed' | 'list';
}

export function TaskFeed({ defaultFilter, title = "My Day", workspaceId, filterType = 'list' }: TaskFeedProps) {
  const { data: tasks, isLoading, error } = useTasks({ workspaceId });
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filter & Sort State
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string[]>(defaultFilter?.status || []); 
  const [filterPriority, setFilterPriority] = useState<string[]>([]); // empty = all
  const [sortConfig, setSortConfig] = useState<{ option: SortOption, direction: SortDirection }>({ 
    option: 'created', 
    direction: 'desc' 
  });
  
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter and Sort Logic
  const processedTasks = useMemo(() => {
    if (!tasks) return [];
    
    let result = [...tasks];

    // 1. Apply Page-Specific Logic (filterType)
    if (filterType === 'my-day') {
        const today = new Date().toISOString().split('T')[0];
        result = result.filter(t => {
            if (t.status === 'done') return false; // Usually My Day only shows active
            if (!t.due_date) return false;
            return t.due_date.startsWith(today);
        });
    } else if (filterType === 'upcoming') {
        result = result.filter(t => t.status !== 'done');
    } else if (filterType === 'completed') {
        result = result.filter(t => t.status === 'done');
    }

    // 2. Apply Manual Filters (Menu)
    if (filterStatus.length > 0) {
      result = result.filter(t => filterStatus.includes(t.status));
    }
    if (filterPriority.length > 0) {
      result = result.filter(t => filterPriority.includes(t.priority));
    }

    // 3. Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.option) {
        case 'dueDate':
          // Sort empty dates to bottom
          const dateA = a.due_date ? new Date(a.due_date).getTime() : 8640000000000000; 
          const dateB = b.due_date ? new Date(b.due_date).getTime() : 8640000000000000;
          comparison = dateA - dateB;
          break;
        case 'priority':
          const priorityMap = { high: 3, medium: 2, low: 1 };
          comparison = priorityMap[a.priority] - priorityMap[b.priority];
          break;
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, filterStatus, filterPriority, sortConfig, filterType]);

  // Derive selected task
  const selectedTask = tasks?.find(t => t.id === selectedTaskId) || null;

  const handleCreateTaskClick = () => {
    setIsCreating(true);
    setSelectedTaskId(null);
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTaskMutation.mutate({ id: task.id, status: newStatus });
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
    }
  };

  const toggleFilter = (type: 'status' | 'priority', value: string) => {
    if (type === 'status') {
      setFilterStatus(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    } else {
      setFilterPriority(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading tasks</div>;
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="font-semibold text-gray-700">{title}</h2>
        <div className="flex items-center gap-1 relative">
          <button 
            onClick={handleCreateTaskClick}
            disabled={isCreating}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Create New Task"
          >
            <Plus size={16} />
          </button>
          
          {/* Filter Button & Menu */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={cn("p-1.5 rounded-md transition-colors", showFilterMenu ? "bg-gray-200 text-gray-800" : "text-gray-500 hover:bg-gray-200")}
              title="Filter"
            >
              <Filter size={16} />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 text-sm">
                <div className="mb-2">
                  <p className="font-semibold text-xs text-gray-900 uppercase px-2 py-1">Status</p>
                  {['todo', 'done'].map(status => (
                    <button 
                      key={status}
                      onClick={() => toggleFilter('status', status)}
                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded capitalize text-gray-700 font-medium"
                    >
                      {status}
                      {filterStatus.includes(status) && <Check size={14} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <p className="font-semibold text-xs text-gray-900 uppercase px-2 py-1">Priority</p>
                  {['high', 'medium', 'low'].map(priority => (
                    <button 
                      key={priority}
                      onClick={() => toggleFilter('priority', priority)}
                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded capitalize text-gray-700 font-medium"
                    >
                      {priority}
                      {filterPriority.includes(priority) && <Check size={14} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
                {(filterStatus.length > 0 || filterPriority.length > 0) && (
                   <button 
                    onClick={() => { setFilterStatus([]); setFilterPriority([]); }}
                    className="w-full text-center text-xs text-blue-700 hover:underline mt-2 py-1 font-medium"
                   >
                     Clear Filters
                   </button>
                )}
              </div>
            )}
          </div>

          {/* Sort Button & Menu */}
          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={cn("p-1.5 rounded-md transition-colors", showSortMenu ? "bg-gray-200 text-gray-800" : "text-gray-500 hover:bg-gray-200")}
              title="Sort"
            >
              <ArrowUpDown size={16} />
            </button>
            {showSortMenu && (
               <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 text-sm">
                 {[
                   { label: 'Date (Earliest)', opt: 'dueDate', dir: 'asc' },
                   { label: 'Date (Latest)', opt: 'dueDate', dir: 'desc' },
                   { label: 'Priority (High to Low)', opt: 'priority', dir: 'desc' },
                   { label: 'Priority (Low to High)', opt: 'priority', dir: 'asc' },
                   { label: 'Created (Newest)', opt: 'created', dir: 'desc' },
                   { label: 'Created (Oldest)', opt: 'created', dir: 'asc' },
                 ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setSortConfig({ option: item.opt as SortOption, direction: item.dir as SortDirection })}
                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded text-left text-gray-700 font-medium"
                    >
                      {item.label}
                      {sortConfig.option === item.opt && sortConfig.direction === item.dir && <Check size={14} className="text-blue-600" />}
                    </button>
                 ))}
               </div>
            )}
          </div>

        </div>
      </header>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {processedTasks.length === 0 ? (
           <div className="text-center text-gray-400 mt-10 text-sm">
             {tasks && tasks.length > 0 ? "No tasks match your filters." : "No tasks yet. Create one!"}
           </div>
        ) : (
          processedTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onToggleStatus={() => handleToggleStatus(task)}
              onClick={() => {
                  setSelectedTaskId(task.id);
                  setIsCreating(false);
              }}
              onDelete={() => handleDeleteTask(task.id)}
            />
          ))
        )}
      </div>

      {/* Editor Panel */}
      {(selectedTask || isCreating) && (
        <TaskEditor 
          task={selectedTask} 
          workspaceId={workspaceId}
          onClose={() => {
              setSelectedTaskId(null);
              setIsCreating(false);
          }} 
        />
      )}
    </div>
  );
}

// Add these types to avoid errors
type SortOption = 'dueDate' | 'priority' | 'created';
type SortDirection = 'asc' | 'desc';

function TaskCard({ task, onToggleStatus, onClick, onDelete }: { task: Task; onToggleStatus: () => void; onClick: () => void; onDelete: () => void }) {
  const priorityColors = {
    high: 'text-red-600 bg-red-50 border-red-100',
    medium: 'text-amber-600 bg-amber-50 border-amber-100',
    low: 'text-blue-600 bg-blue-50 border-blue-100',
  };
  
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDone = task.status === 'done';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative",
        isDone && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus();
          }}
          className={cn(
            "mt-0.5 transition-colors",
            isDone ? "text-green-500" : "text-gray-300 hover:text-blue-500"
          )}
        >
          {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              "text-sm font-medium text-gray-900 leading-tight",
              isDone && "line-through text-gray-500"
            )}>
              {task.title}
            </h3>
            
            {/* Action Menu */}
            <div className="relative" ref={menuRef}>
               <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }}
                className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
               >
                 <MoreHorizontal size={16} />
               </button>
               
               {showMenu && (
                 <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(false);
                            onDelete();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <Trash2 size={12} />
                        Delete
                    </button>
                 </div>
               )}
            </div>

          </div>
          
          {/* Metadata Row */}
          <div className="flex items-center gap-3 mt-2">
            {/* Due Date */}
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CalendarIcon size={12} />
                <span>
                  {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}

            {/* Priority Badge */}
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border",
              priorityColors[task.priority as keyof typeof priorityColors]
            )}>
              <Flag size={10} />
              <span className="capitalize">{task.priority}</span>
            </div>

            {/* Tags - Optional check */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {task.tags.map(tag => (
                  <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assignee Avatar (if exists) */}
        {task.assignee && (
          <img 
            src={task.assignee.avatar_url || ''} 
            alt={task.assignee.name}
            className="w-5 h-5 rounded-full bg-gray-100 border border-white shadow-sm"
          />
        )}
      </div>
    </div>
  );
}