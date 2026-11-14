import { $, esc } from '../lib/dom';
import { actions, state } from '../state';
import { closeExtra, openExtra } from './extraModal';

const safeDataUrl = (url: string): string => (/^data:[\w.+-]+\/[\w.+-]+[;,]/i.test(url) ? url : '');

/** Biblioteca de archivos (V15). En Fase 4 lista los objetos de R2 vía post_media. */
function showLibrary(): void {
  const all = state.posts.flatMap((p) => (p.files || []).map((f) => ({ p, f })));
  const content = openExtra(
    'Biblioteca de archivos',
    `<p class="muted">Archivos adjuntos a las publicaciones guardadas. Elegí un material para descargarlo o abrí su publicación.</p>${
      all.length
        ? all
            .map(
              ({ p, f }) =>
                `<div class="library-row"><div style="flex:1;min-width:170px"><strong>${esc(f.name)}</strong><div class="muted">${esc(p.title)} · ${esc(p.date)}</div></div><div class="extra-actions"><a class="btn" href="${esc(safeDataUrl(f.data))}" download="${esc(f.name)}">↓ Descargar</a><button type="button" class="btn" data-librarypost="${esc(p.id)}">Abrir ficha</button></div></div>`,
            )
            .join('')
        : '<div class="empty">Todavía no hay archivos. Adjuntalos a una publicación para verlos acá.</div>'
    }`,
  );
  content.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-librarypost]');
    if (!b) return;
    const p = state.posts.find((x) => x.id === b.dataset.librarypost);
    if (p) {
      closeExtra();
      actions.openPost(p);
    }
  };
}

export function initLibrary(): void {
  $('sideLibrary').onclick = showLibrary;
}
