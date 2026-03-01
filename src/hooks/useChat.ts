import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  created_at?: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  context_id: string;
}

interface ChatResponse {
  role: 'assistant';
  content: string;
}

const sendMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>('/chat', data);
  return response.data;
};

const fetchChatHistory = async (contextId: string): Promise<ChatMessage[]> => {
  const { data } = await api.get<ChatMessage[]>('/chat/history', {
    params: { context_id: contextId }
  });
  return data;
};

export const useChatHistory = (contextId: string) => {
  return useQuery({
    queryKey: ['chat', contextId],
    queryFn: () => fetchChatHistory(contextId),
  });
};

export const useChatMutation = (contextId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      // Invalidate both tasks (in case tool was used) and chat history
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['chat', contextId] });
    },
  });
};
