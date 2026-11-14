import { $, toast } from '../lib/dom';
import { actions, state } from '../state';
import { savePosts } from '../store/local';
import type { Post } from '../types';

/*
  Exportar / importar respaldo JSON (V15).
  Con datos en servidor (Fase 2) se revisará: la importación no debe pisar datos compartidos sin control.
*/
export function initExportImport(): void {
  $('exportBtn').onclick = () => {
    const blob = new Blob([JSON.stringify({ app: 'UAA Planner Demo', version: 5, posts: state.posts }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uaa-planner-respaldo.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const importInput = $<HTMLInputElement>('importInput');
  importInput.onchange = async () => {
    const f = importInput.files?.[0];
    if (!f) return;
    try {
      const obj = JSON.parse(await f.text()) as { app?: string; posts?: unknown };
      if (!Array.isArray(obj.posts) || obj.app !== 'UAA Planner Demo') throw new Error('formato');
      if (!confirm('La importación reemplazará todas las publicaciones locales. ¿Continuar?')) return;
      const old = state.posts;
      state.posts = obj.posts as Post[];
      if (!savePosts(state.posts)) {
        state.posts = old;
        return;
      }
      actions.render();
      toast('Datos importados');
    } catch {
      alert('El archivo no es un respaldo válido de UAA Planner.');
    } finally {
      importInput.value = '';
    }
  };
}
