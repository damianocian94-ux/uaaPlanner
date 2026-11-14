export type AccountId = 'inst' | 'agro' | 'cor' | 'super';
export type StatusId = 'draft' | 'materials' | 'review' | 'ready' | 'published';
export type Role = 'manager' | 'member';

export interface PostFile {
  name: string;
  /** Data URL (temporal hasta Fase 4: R2). */
  data: string;
  bytes: number;
  type: string;
}

export interface Post {
  id: string;
  title: string;
  account: AccountId;
  date: string; // YYYY-MM-DD
  format: string;
  status: StatusId;
  copy: string;
  notes: string;
  files: PostFile[];
  link: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Idea {
  id: string;
  title: string;
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  owner: string;
  assignedBy: string;
  done: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  role: Role;
}

export type SpecialDateType = 'holiday' | 'nonworking' | 'ephemeris';

export interface SpecialDate {
  date: string;
  title: string;
  type: SpecialDateType;
}
