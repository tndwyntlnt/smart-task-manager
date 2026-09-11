export type TaskCategory = 'kuliah' | 'socmed' | 'special';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null; 
  due_date: string | null;    
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  is_birthday_task?: boolean;
  created_at?: string;
}

export interface SupportNote {
  id: string;
  message: string;
  author: string;
  created_at: string;
}