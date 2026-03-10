export type AnnouncementType = 'urgent' | 'general' | 'reminder';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  author: string;
  created_at: string;
}

export interface SchoolEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

export interface Schedule {
  id: number;
  class_name: string;
  teacher: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
}

export interface VideoGeneration {
  id: number;
  prompt: string;
  video_url?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}
