import { LOCAL_FILE_MAX_BYTES, LOCAL_POST_MAX_BYTES } from '../config';
import { $, $maybe, esc, newId, toast, todayYmd } from '../lib/dom';
import { actions, currentUsername, state } from '../state';
import { savePosts } from '../store/local';
import type { AccountId, Post, PostFile, StatusId } from '../types';

type FileKind = 'image' | 'video' | 'document';

function fileKind(f: PostFile): FileKind {
  const mime = f.type || '';
  const n = (f.name || '').toLowerCase();
  if (mime.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|bmp|avif)$/i.test(n)) return 'image';
  if (mime.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogg)$/i.test(n)) return 'video';
  return 'document';
}

/** Solo se aceptan data URLs como src/href de adjuntos locales (evita javascript: u otros esquemas). */
const safeDataUrl = (url: string): string => (/^data:[\w.+-]+\/[\w.+-]+[;,]/i.test(url) ? url : '');

function filesRender(): void {
  const files = state.workingFiles;
  const count = files.length;
  $('fileList').innerHTML = files
    .map((f, i) => {
      const kind = fileKind(f);
      const label = kind === 'image' ? 'Imagen' : kind === 'video' ? 'Video / reel' : 'Documento';
      const name = esc(f.name);
      const src = esc(safeDataUrl(f.data));
      const media =
        kind === 'image'
          ? `<img alt="Vista previa de ${name}" src="${src}">`
          : kind === 'video'
            ? `<video src="${src}" controls preload="metadata" playsinline aria-label="Vista previa de ${name}"></video>`
            : '<span class="asset-fallback">📄</span>';
      return `<div class="asset-card"><span class="asset-order">${i + 1}${count > 1 ? ' / ' + count : ''}</span><div class="asset-media">${media}</div><div class="asset-desc"><div style="min-width:0"><div class="asset-name" title="${name}">${name}</div><div class="asset-type">${label} · ${((f.bytes || 0) / 1024 / 1024).toFixed(2)} MB</div></div></div><div class="asset-actions">${kind !== 'document' ? `<button class="btn" type="button" data-previewidx="${i}">⛶ Ampliar</button>` : ''}<a class="btn" href="${src}" download="${name}">↓ Bajar</a><button class="btn danger" type="button" data-fileidx="${i}">Quitar</button></div></div>`;
    })
    .join('');
  const hint = $maybe('assetHint');
  if (hint) hint.textContent = count > 1 ? `Vista previa de carrusel · ${count} archivos adjuntos` : 'Se muestra la vista previa de cada archivo adjunto.';
}

function closeLightbox(): void {
  $('assetLightbox').classList.remove('open');
  $('lightboxBody').replaceChildren();
}

function previewAsset(i: number): void {
  const f = state.workingFiles[i];
  if (!f) return;
  const type = fileKind(f);
  if (type === 'document') return;
  const src = safeDataUrl(f.data);
  if (!src) return;
  let el: HTMLImageElement | HTMLVideoElement;
  if (type === 'image') {
    el = document.createElement('img');
    el.alt = f.name;
  } else {
    el = document.createElement('video');
    el.controls = true;
    el.autoplay = false;
    el.playsInline = true;
  }
  el.src = src;
  $('lightboxName').textContent = f.name;
  $('lightboxBody').replaceChildren(el);
  $('assetLightbox').classList.add('open');
}

const input = (id: string) => $<HTMLInputElement>(id);
const select = (id: string) => $<HTMLSelectElement>(id);
const textarea = (id: string) => $<HTMLTextAreaElement>(id);

export function openPost(p: Post | null, date?: string): void {
  $<HTMLFormElement>('postForm').reset();
  input('postId').value = p?.id || '';
  $('formTitle').textContent = p ? 'Editar publicación' : 'Nueva publicación';
  input('title').value = p?.title || '';
  select('account').value = p?.account || (state.filter === 'all' ? 'inst' : state.filter);
  input('date').value = p?.date || date || todayYmd();
  select('format').value = p?.format || 'Post';
  select('status').value = p?.status || 'draft';
  textarea('copy').value = p?.copy || '';
  textarea('notes').value = p?.notes || '';
  input('link').value = p?.link || '';
  state.workingFiles = (p?.files || []).map((x) => ({ ...x }));
  filesRender();
  $('deleteBtn').classList.toggle('hide', !p);
  $('audit').textContent = p ? `Última edición: ${p.updatedBy || 'Demo'} · ${p.updatedAt || 'sin registro'}` : '';
  $('overlay').classList.add('open');
  input('title').focus();
}

function closePost(): void {
  $('overlay').classList.remove('open');
}

/** Abre el formulario precargado desde una idea (Banco de ideas → Planificar). */
export function openPostFromIdea(title: string, notes: string): void {
  openPost(null);
  input('title').value = title;
  textarea('notes').value = notes;
}

const readAsDataUrl = (f: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(f);
  });

export function initPostForm(): void {
  actions.openPost = openPost;

  $('newBtn').onclick = () => openPost(null);
  $('sideNew').onclick = () => openPost(null);
  $('closeBtn').onclick = closePost;
  $('cancelBtn').onclick = closePost;
  const overlay = $('overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePost();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closePost();
    }
  });

  $('lightboxClose').onclick = closeLightbox;
  const lightbox = $('assetLightbox');
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  $('fileList').onclick = (e) => {
    const t = e.target as HTMLElement;
    const preview = t.closest<HTMLElement>('[data-previewidx]');
    if (preview) {
      previewAsset(Number(preview.dataset.previewidx));
      return;
    }
    const b = t.closest<HTMLElement>('[data-fileidx]');
    if (!b) return;
    state.workingFiles.splice(Number(b.dataset.fileidx), 1);
    filesRender();
  };

  // Adjuntos locales (V15). Fase 4: subida a Cloudflare R2.
  const filesInput = input('files');
  filesInput.onchange = async () => {
    for (const f of Array.from(filesInput.files || [])) {
      if (f.size > LOCAL_FILE_MAX_BYTES) {
        alert(`${f.name}: el límite de esta demo es 3 MB por archivo.`);
        continue;
      }
      if (state.workingFiles.reduce((s, x) => s + (x.bytes || 0), 0) + f.size > LOCAL_POST_MAX_BYTES) {
        alert('Se superó el límite de 8 MB por publicación.');
        break;
      }
      const data = await readAsDataUrl(f);
      state.workingFiles.push({ name: f.name, data, bytes: f.size, type: f.type });
    }
    filesRender();
    filesInput.value = '';
  };

  $<HTMLFormElement>('postForm').onsubmit = (e) => {
    e.preventDefault();
    const id = input('postId').value || newId('p');
    const p: Post = {
      id,
      title: input('title').value.trim(),
      account: select('account').value as AccountId,
      date: input('date').value,
      format: select('format').value,
      status: select('status').value as StatusId,
      copy: textarea('copy').value,
      notes: textarea('notes').value,
      link: input('link').value,
      files: state.workingFiles,
      updatedAt: new Date().toLocaleString('es-AR'),
      updatedBy: currentUsername(),
    };
    if (!p.title || !p.date) return;
    const old = state.posts;
    state.posts = state.posts.filter((x) => x.id !== id).concat(p);
    if (!savePosts(state.posts)) {
      state.posts = old;
      return;
    }
    state.current = new Date(Number(p.date.slice(0, 4)), Number(p.date.slice(5, 7)) - 1, 1);
    closePost();
    actions.render();
    toast('Publicación guardada');
  };

  $('deleteBtn').onclick = () => {
    const id = input('postId').value;
    if (!id || !confirm('¿Eliminar esta publicación?')) return;
    const old = state.posts;
    state.posts = state.posts.filter((p) => p.id !== id);
    if (!savePosts(state.posts)) {
      state.posts = old;
      return;
    }
    closePost();
    actions.render();
    toast('Publicación eliminada');
  };

  $('copyBtn').onclick = async () => {
    try {
      await navigator.clipboard.writeText(textarea('copy').value);
      toast('Copy copiado');
    } catch {
      const t = textarea('copy');
      t.focus();
      t.select();
      toast('Texto seleccionado para copiar');
    }
  };
}
