export interface Book {
  id?: string; // UUID format
  title: string;
  author: string;
  year: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}