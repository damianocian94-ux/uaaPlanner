/** Obtiene un elemento por id; falla temprano si no existe en el markup. */
export function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} no encontrado`);
  return el as T;
}

/** Igual que $, pero devuelve null si no existe (elementos creados dinámicamente). */
export function $maybe<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function esc(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );
}

export const pad = (n: number): string => String(n).padStart(2, '0');

export const ymd = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = new Date();

export const todayYmd = (): string => ymd(today);

export const addDays = (n: number): string =>
  ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + n));

export const monthPrefix = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-`;

/** Días entre hoy y la fecha (negativo = pasada). */
export const daysUntil = (date: string): number =>
  Math.round((new Date(date + 'T12:00:00').getTime() - new Date(todayYmd() + 'T12:00:00').getTime()) / 86400000);

export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export const toDisplayDate = (date: string): string => date.split('-').reverse().join('/');

let toastTimer: number | undefined;
export function toast(message: string): void {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2200);
}

export const newId = (prefix: string): string =>
  prefix + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
