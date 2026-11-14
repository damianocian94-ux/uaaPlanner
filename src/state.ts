import { today } from './lib/dom';
import type { AccountId, Idea, Post, PostFile, Profile } from './types';

/** Estado de la aplicación en memoria (equivalente a las variables del IIFE de V15). */
export const state = {
  user: null as Profile | null,
  posts: [] as Post[],
  ideas: [] as Idea[],
  current: new Date(today.getFullYear(), today.getMonth(), 1),
  filter: 'all' as 'all' | AccountId,
  listMode: false,
  showDates: true,
  workingFiles: [] as PostFile[],
  draggedPostId: '',
};

export const isManager = (): boolean => state.user?.role === 'manager';
export const currentUsername = (): string => state.user?.username ?? '';

/**
 * Acciones compartidas entre módulos (evita dependencias circulares).
 * Cada módulo registra su implementación en init.
 */
export const actions = {
  render: (): void => {},
  openPost: (_post: Post | null, _date?: string): void => {},
};
