/*
  Tareas (V15).
  ATENCIÓN: en esta etapa la privacidad sigue siendo SIMULADA en el navegador.
  La privacidad real (RLS en la tabla `tasks`) se implementa en Fase 3.
*/
import { TEAM_USERNAMES } from '../config';
import { $, $maybe, capitalize, esc, newId, toast } from '../lib/dom';
import { currentUsername, isManager } from '../state';
import { STORAGE_KEYS, loadTasks, saveTasks } from '../store/local';
import { isExtraOpen, openExtra } from './extraModal';

const TITLE = 'Tareas';

export function countTasks(): void {
  const u = currentUsername();
  const manager = isManager();
  const rows = loadTasks().filter((t) => manager || t.owner === u);
  const el = $maybe('taskCount');
  if (el) el.textContent = String(rows.filter((t) => !t.done).length);
}

const userOptions = (): string => TEAM_USERNAMES.map((n) => `<option value="${n}">${capitalize(n)}</option>`).join('');

function showTasks(): void {
  const u = currentUsername();
  const manager = isManager();
  openExtra(
    TITLE,
    `<p class="muted">${manager ? 'Podés ver, crear y asignar tareas a cualquiera del equipo.' : 'Tus tareas son personales. Lorena también puede verlas y asignarte nuevas.'} <strong>Migración en curso:</strong> la privacidad todavía se simula en este navegador; no hay sincronización entre dispositivos.</p>
 <form id="taskForm" class="task-form">
 <label for="taskTitle">Nueva tarea</label><input id="taskTitle" class="extra-input" maxlength="180" placeholder="Ej.: Preparar carrusel para Agro" required>
 <label for="taskNotes">Detalles (opcional)</label><textarea id="taskNotes" class="extra-textarea" placeholder="Indicaciones, materiales, entregables..."></textarea>
 ${manager ? `<label for="taskOwner">Asignar a</label><select id="taskOwner" class="extra-input">${userOptions()}</select>` : ''}
 <button type="submit" class="btn primary">＋ Guardar tarea</button></form>
 ${manager ? `<label for="taskFilter" style="display:block;margin-top:20px">Ver tareas de</label><select id="taskFilter" class="extra-input"><option value="all">Todo el equipo</option>${userOptions()}</select>` : ''}
 <div id="taskItems"></div>`,
  );
  const list = $('taskItems');

  const draw = (): void => {
    const f = manager ? $<HTMLSelectElement>('taskFilter').value : u;
    const tasks = loadTasks()
      .filter((t) => (manager && (f === 'all' || t.owner === f)) || (!manager && t.owner === u))
      .sort((a, b) => Number(a.done) - Number(b.done));
    list.innerHTML = tasks.length
      ? tasks
          .map(
            (t) =>
              `<div class="task-row ${t.done ? 'task-done' : ''}"><label class="task-check"><input type="checkbox" data-taskcheck="${esc(t.id)}" ${t.done ? 'checked' : ''}><span><strong>${esc(t.title)}</strong><small>${esc(capitalize(t.owner))}${t.assignedBy && t.assignedBy !== t.owner ? ' · Asignada por ' + esc(t.assignedBy) : ''}</small>${t.notes ? `<span class="task-notes">${esc(t.notes)}</span>` : ''}</span></label><button type="button" class="btn danger" data-taskdelete="${esc(t.id)}" aria-label="Eliminar tarea">Eliminar</button></div>`,
          )
          .join('')
      : '<div class="empty">No hay tareas para mostrar.</div>';
  };

  const form = $<HTMLFormElement>('taskForm');
  form.onsubmit = (e) => {
    e.preventDefault();
    const title = $<HTMLInputElement>('taskTitle').value.trim();
    if (!title) return;
    const owner = manager ? $<HTMLSelectElement>('taskOwner').value : u;
    const tasks = loadTasks();
    tasks.push({ id: newId('t'), title, notes: $<HTMLTextAreaElement>('taskNotes').value, owner, assignedBy: u, done: false, createdAt: new Date().toISOString() });
    if (saveTasks(tasks)) {
      form.reset();
      draw();
      countTasks();
      toast('Tarea guardada');
    }
  };

  if (manager) $<HTMLSelectElement>('taskFilter').onchange = draw;

  list.onchange = (e) => {
    const box = (e.target as HTMLElement).closest<HTMLInputElement>('[data-taskcheck]');
    if (!box) return;
    const rows = loadTasks();
    const t = rows.find((x) => x.id === box.dataset.taskcheck);
    if (t && (manager || t.owner === u)) {
      t.done = box.checked;
      if (saveTasks(rows)) {
        draw();
        countTasks();
      }
    }
  };

  list.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-taskdelete]');
    if (!b) return;
    let rows = loadTasks();
    const t = rows.find((x) => x.id === b.dataset.taskdelete);
    if (!t || !(manager || t.owner === u) || !confirm('¿Eliminar esta tarea?')) return;
    rows = rows.filter((x) => x.id !== t.id);
    if (saveTasks(rows)) {
      draw();
      countTasks();
      toast('Tarea eliminada');
    }
  };

  draw();
}

export function initTasks(): void {
  $('sideTasks').onclick = showTasks;
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.tasks) {
      countTasks();
      if (isExtraOpen(TITLE)) showTasks();
    }
  });
}
