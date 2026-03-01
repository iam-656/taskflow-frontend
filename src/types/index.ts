export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string; // Backend sends ISO string
  created_at: string;
  updated_at: string;
  assignee_id?: string;
  workspace_id?: string;
  assignee?: User;
  tags?: string[]; // Optional for now as backend doesn't support it yet
}