// Idea status and priority types
export type IdeaStatus = 'hold' | 'developing' | 'ready' | 'scheduled' | 'archived' | 'recycled';
export type IdeaPriority = 'none' | 'good' | 'better' | 'best';

// Database types
export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentType {
  id: string;
  user_id: string;
  name: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  content: string | null;
  content_type_id: string | null;
  platform_id: string | null;
  priority: IdeaPriority;
  status: IdeaStatus;
  is_timely: boolean;
  scheduled_date: string | null;
  source: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  content_type?: ContentType | null;
  platform?: Platform | null;
  files?: IdeaFile[];
}

export interface IdeaFile {
  id: string;
  idea_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string | null;
  created_at: string;
}

export interface QuickLink {
  id: string;
  user_id: string;
  name: string;
  url: string;
  content_type_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  content_type?: ContentType | null;
}

// View mode types
export type ViewMode = 'grid' | 'compact' | 'list';

// Filter types
export interface IdeaFilters {
  status?: IdeaStatus[];
  contentType?: string[];
  platform?: string[];
  priority?: IdeaPriority[];
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  search?: string;
}

// Stats
export interface IdeaStats {
  total: number;
  byStatus: Record<IdeaStatus, number>;
  timely: number;
}
