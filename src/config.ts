import type { AccountId, StatusId } from './types';

/** Estados de publicación (V15). */
export const STATUSES: Record<StatusId, string> = {
  draft: 'Idea/Borrador',
  materials: 'Pendiente de materiales',
  review: 'En revisión',
  ready: 'Listo para publicar',
  published: 'Publicado',
};

/** Colores aplicados SOLO al texto del estado (V15). */
export const STATUS_COLORS: Record<StatusId, string> = {
  draft: '#43FEF4',
  materials: '#FF9F2B',
  review: '#E8F81C',
  ready: '#1C6C26',
  published: '#00FB21',
};

export const ACCOUNT_NAMES: Record<AccountId, string> = {
  inst: 'Institucional',
  agro: 'Agro',
  cor: 'Corralón',
  super: 'Super UAA',
};

export const ACCOUNT_COLORS: Record<AccountId, string> = {
  inst: '#004AA1',
  agro: '#0C670E',
  cor: '#DA5215',
  super: '#C62828',
};

/** Integrantes del equipo. En Fase 3 se leerá de la tabla `profiles`. */
export const TEAM_USERNAMES = ['damiano', 'lorena', 'cecilia', 'emiliana', 'erika'] as const;

export const AUTH_EMAIL_DOMAIN = import.meta.env.VITE_AUTH_EMAIL_DOMAIN || 'planner.uaa.com.ar';

/** Límites de adjuntos del modo local (V15). En Fase 4 pasan a app_settings + R2. */
export const LOCAL_FILE_MAX_BYTES = 3 * 1024 * 1024;
export const LOCAL_POST_MAX_BYTES = 8 * 1024 * 1024;
