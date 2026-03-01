export const mockUser = {
  id: 'user_1',
  name: 'Alex Developer',
  email: 'alex@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
};

export const mockTasks = [
  {
    id: 'task_1',
    title: 'Design 3-column layout',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-02-10T12:00:00Z',
    assignee: mockUser,
    tags: ['ui', 'frontend'],
  },
  {
    id: 'task_2',
    title: 'Setup Clerk authentication',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-02-12T12:00:00Z',
    assignee: null,
    tags: ['auth', 'backend'],
  },
  {
    id: 'task_3',
    title: 'Research vector databases',
    status: 'done',
    priority: 'low',
    dueDate: '2024-02-01T12:00:00Z',
    assignee: mockUser,
    tags: ['research'],
  },
];

export const mockMessages = [
  {
    id: 'msg_1',
    role: 'user',
    content: 'What are the high priority tasks for this week?',
    timestamp: '10:00 AM',
  },
  {
    id: 'msg_2',
    role: 'assistant',
    content:
      "You have one high priority task: **Design 3-column layout**. It's due on Feb 10th. Would you like me to break this down into subtasks?",
    timestamp: '10:01 AM',
  },
];