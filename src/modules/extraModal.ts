import { $ } from '../lib/dom';

/** Modal genérico usado por Banco de ideas, Tareas y Biblioteca (V15). */
export function openExtra(title: string, contentHtml: string): HTMLElement {
  $('extraTitle').textContent = title;
  const content = $('extraContent');
  content.onclick = null;
  content.innerHTML = contentHtml;
  const modal = $('extraModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  return content;
}

export function closeExtra(): void {
  const modal = $('extraModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

export const isExtraOpen = (title: string): boolean =>
  $('extraModal').classList.contains('open') && $('extraTitle').textContent === title;

export function initExtraModal(): void {
  const modal = $('extraModal');
  $('extraClose').onclick = closeExtra;
  modal.onclick = (e) => {
    if (e.target === modal) closeExtra();
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeExtra();
  });
}
