/*
  Persistencia LOCAL heredada de V15 (localStorage).
  TEMPORAL: se reemplaza por Supabase en Fase 2 (publicaciones),
  Fase 3 (ideas y tareas) y Fase 6 (descarte de alertas).
  Se mantienen las mismas claves que V15 para no perder datos de prueba existentes.
*/
import { addDays } from '../lib/dom';
import type { Idea, Post, Task } from '../types';

export const STORAGE_KEYS = {
  posts: 'uaa_planner_demo_v2',
  ideas: 'uaa_planner_ideas_v7',
  tasks: 'uaa_planner_tasks_v15',
  dismissedAlerts: 'uaa_planner_dismissed_alerts_v12',
} as const;

function seedPosts(): Post[] {
  return [
    { id: 'seed1', title: 'Video institucional', account: 'inst', date: addDays(1), format: 'Reel / Video', status: 'review', copy: 'Ejemplo de copy institucional para revisar.', notes: 'Ejemplo ficticio: revisar edición y portada.', files: [], link: '' },
    { id: 'seed2', title: 'Tecnología en el campo', account: 'agro', date: addDays(3), format: 'Carrusel', status: 'materials', copy: 'Contenido de ejemplo sobre servicios de agricultura.', notes: 'Ejemplo ficticio: falta selección de imágenes.', files: [], link: '' },
    { id: 'seed3', title: 'Herramientas rurales', account: 'cor', date: addDays(6), format: 'Post', status: 'draft', copy: 'Contenido de ejemplo orientado a asociados y productores.', notes: 'Ejemplo ficticio: revisar materiales.', files: [], link: '' },
    { id: 'seed4', title: 'Agenda institucional', account: 'inst', date: addDays(-2), format: 'Historia', status: 'published', copy: 'Agenda de ejemplo.', notes: 'Publicación ficticia.', files: [], link: '' },
  ];
}

function readArray<T>(key: string, fallback: () => T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback();
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as T[]) : fallback();
  } catch {
    return fallback();
  }
}

function writeJson(key: string, value: unknown, errorMessage: string): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    alert(errorMessage);
    return false;
  }
}

export const loadPosts = (): Post[] => readArray<Post>(STORAGE_KEYS.posts, seedPosts);
export const savePosts = (posts: Post[]): boolean =>
  writeJson(STORAGE_KEYS.posts, posts, 'No se pudieron guardar los datos. Es posible que los adjuntos hayan llenado el almacenamiento del navegador. Quitá algún archivo y volvé a intentar.');

export const loadIdeas = (): Idea[] => readArray<Idea>(STORAGE_KEYS.ideas, () => []);
export const saveIdeas = (ideas: Idea[]): boolean =>
  writeJson(STORAGE_KEYS.ideas, ideas, 'No se pudieron guardar las ideas en este navegador.');

export const loadTasks = (): Task[] => readArray<Task>(STORAGE_KEYS.tasks, () => []);
export const saveTasks = (tasks: Task[]): boolean =>
  writeJson(STORAGE_KEYS.tasks, tasks, 'No se pudieron guardar las tareas');

export const loadDismissedAlerts = (): string[] => readArray<string>(STORAGE_KEYS.dismissedAlerts, () => []);
export function dismissAlert(key: string): void {
  const dismissed = loadDismissedAlerts();
  if (!dismissed.includes(key)) dismissed.push(key);
  try {
    localStorage.setItem(STORAGE_KEYS.dismissedAlerts, JSON.stringify(dismissed));
  } catch {
    /* sin almacenamiento disponible: el aviso reaparecerá */
  }
}
