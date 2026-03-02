import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Task } from '@/types';

interface TaskQueryParams {
  workspaceId?: string;
}

const fetchTasks = async (params?: TaskQueryParams): Promise<Task[]> => {
  try {
    const { data } = await api.get<Task[]>('/tasks', { 
      params: { 
          workspace_id: params?.workspaceId
      } 
    });
    return data;
  } catch (err) {
    console.error("Error fetching tasks:", err);
    throw err;
  }
};

const createTask = async (task: Partial<Task>): Promise<Task> => {
  const { data } = await api.post<Task>('/tasks', task);
  return data;
};

const updateTask = async ({ id, ...updates }: Partial<Task> & { id: string }): Promise<Task> => {
  const { data } = await api.patch<Task>(`/tasks/${id}`, updates);
  return data;
};

const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const useTasks = (params?: TaskQueryParams) => {
  return useQuery({
    queryKey: ['tasks', params?.workspaceId],
    queryFn: () => fetchTasks(params),
  });
};
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTask,
    // Optimistic Update Implementation
    onMutate: async (newHelper) => {
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // 2. Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      // 3. Optimistically update to the new value
      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        return old?.map((task) => 
          task.id === newHelper.id ? { ...task, ...newHelper } : task
        ) || [];
      });

      // 4. Return a context object with the snapshotted value
      return { previousTasks };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        return old?.filter((task) => task.id !== id) || [];
      });

      return { previousTasks };
    },
    onError: (err, id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};