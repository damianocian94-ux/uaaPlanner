import { ACCOUNT_COLORS, ACCOUNT_NAMES, STATUSES, STATUS_COLORS } from '../config';
import { $, daysUntil, esc, monthPrefix, pad, toDisplayDate, toast, today, todayYmd } from '../lib/dom';
import { specialDates } from '../lib/specialDates';
import { actions, currentUsername, state } from '../state';
import { STORAGE_KEYS, dismissAlert, loadDismissedAlerts, savePosts } from '../store/local';
import type { AccountId, Post } from '../types';
import { openSpecialDate } from './dateModal';

/** Publicaciones del mes visible, respetando el filtro de cuenta. */
export function visible(): Post[] {
  const ym = monthPrefix(state.current);
  return state.posts.filter((p) => (state.filter === 'all' || p.account === state.filter) && p.date?.startsWith(ym));
}

const accountColor = (a: string): string => ACCOUNT_COLORS[a as AccountId] ?? '#004AA1';
const accountName = (a: string): string => ACCOUNT_NAMES[a as AccountId] ?? a;
const statusName = (s: string): string => STATUSES[s as keyof typeof STATUSES] ?? s;
const statusColor = (s: string): string => STATUS_COLORS[s as keyof typeof STATUS_COLORS] ?? '#fff';

function renderSidebar(): void {
  const v = visible();
  $('metricTotal').textContent = String(v.length);
  $('sidePublished').textContent = String(v.filter((p) => p.status === 'published').length);
  const upcoming = state.posts
    .filter((p) => p.date >= todayYmd() && p.status !== 'published')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  $('sideUpcoming').innerHTML = upcoming.length
    ? upcoming
        .map(
          (p) =>
            `<button class="side-post" data-sidepost="${esc(p.id)}" style="--account-color:${accountColor(p.account)}"><strong>${esc(p.title)}</strong><span>${esc(toDisplayDate(p.date))} · ${esc(accountName(p.account))}</span><em style="color:${statusColor(p.status)}">${esc(statusName(p.status))}</em></button>`,
        )
        .join('')
    : '<div class="side-empty">No hay publicaciones pendientes próximas.</div>';
  $('ideasCount').textContent = String(state.ideas.length);
}

function renderAlerts(): void {
  const alerts = state.posts
    .filter((p) => p.status !== 'published')
    .map((p) => ({ ...p, days: daysUntil(p.date) }))
    .filter((p) => p.days <= 3)
    .sort((a, b) => a.days - b.days)
    .slice(0, 8);
  const dismissed = loadDismissedAlerts();
  const active = alerts.filter((p) => !dismissed.includes(`${p.id}|${p.date}|${p.status}`));
  const when = (d: number): string => (d < 0 ? 'Vencida' : d === 0 ? 'Para hoy' : `Faltan ${d} día${d === 1 ? '' : 's'}`);
  $('alerts').innerHTML =
    '<div class="alert-heading"><b>🔔 Alertas de publicaciones</b><span class="alert-subhead">Podés descartar cada aviso con ×</span></div>' +
    (active.length
      ? active
          .map(
            (p) =>
              `<div class="dismiss-alert"><span><b>${esc(p.title)}</b> · ${when(p.days)} · ${esc(accountName(p.account))}</span><button type="button" class="dismiss-btn" data-dismiss="${esc(`${p.id}|${p.date}|${p.status}`)}" aria-label="Descartar aviso de ${esc(p.title)}">×</button></div>`,
          )
          .join('')
      : '<div class="alert-empty">No hay alertas pendientes para mostrar.</div>') +
    '<div class="press-monitor"><span>📰 <b>Menciones de UAA en portales</b></span><span class="press-label">Se activará al conectar el monitoreo de noticias. Por ahora no se consultan medios automáticamente.</span></div>';
}

export function render(): void {
  const v = visible();
  const { current } = state;
  $('metricTotal').textContent = String(v.length);
  $('metricPending').textContent = String(v.filter((p) => p.status !== 'published').length);
  $('metricReview').textContent = String(v.filter((p) => p.status === 'review').length);
  $('monthTitle').textContent = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(current);
  document.querySelectorAll<HTMLElement>('[data-filter]').forEach((b) => b.classList.toggle('active', b.dataset.filter === state.filter));

  const first = new Date(current.getFullYear(), current.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const last = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  const count = Math.ceil((offset + last) / 7) * 7;
  const specials = state.showDates ? specialDates(current.getFullYear()) : [];
  const todayStr = todayYmd();
  let html = '';
  for (let i = 0; i < count; i++) {
    const n = i - offset + 1;
    const active = n > 0 && n <= last;
    const date = active ? `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(n)}` : '';
    html += `<div class="day ${active ? '' : 'out'} ${date === todayStr ? 'today' : ''}" ${active ? `data-date="${date}" tabindex="0" role="button" aria-label="Agregar publicación el ${date}"` : ''}><div class="daynum">${active ? n : ''}</div>`;
    if (active) {
      specials
        .filter((d) => d.date === date)
        .forEach((d) => {
          html += `<button class="date-event ${d.type === 'ephemeris' ? '' : 'holiday'}" data-special-date="${d.date}" data-special-type="${d.type}" data-special-title="${esc(d.title)}" title="${esc(d.title)}">${d.type === 'ephemeris' ? '✦' : '◆'} ${esc(d.title)}</button>`;
        });
      v.filter((p) => p.date === date).forEach((p) => {
        const delta = daysUntil(p.date);
        const alert = p.status !== 'published' && delta >= 0 && delta <= 1;
        html += `<button class="event ${esc(p.account)}" draggable="true" data-id="${esc(p.id)}" data-date="${esc(p.date)}" title="${esc(p.title)}">${esc(p.title)}<small class="post-status" data-status="${esc(p.status)}">${esc(statusName(p.status))} ${alert ? '⚠' : ''}</small></button>`;
      });
    }
    html += '</div>';
  }
  $('calendar').innerHTML = html;

  const sorted = [...v].sort((a, b) => a.date.localeCompare(b.date));
  let listHtml = sorted.length
    ? sorted
        .map(
          (p) =>
            `<div class="listitem"><div><b>${esc(p.date.slice(8))} · ${esc(p.title)}</b><div class="muted">${esc(accountName(p.account))} · ${esc(p.format)} · <span class="post-status" data-status="${esc(p.status)}">${esc(statusName(p.status))}</span></div></div><button class="btn" data-id="${esc(p.id)}">Abrir</button></div>`,
        )
        .join('')
    : '<div class="empty">Todavía no hay publicaciones para este filtro.</div>';
  if (state.showDates) {
    const ym = monthPrefix(current);
    listHtml += specials
      .filter((d) => d.date.startsWith(ym))
      .map(
        (d) =>
          `<div class="list-date"><button class="btn" data-special-date="${d.date}" data-special-type="${d.type}" data-special-title="${esc(d.title)}">${d.date.slice(8)} · ${d.type === 'ephemeris' ? '✦ Efeméride' : '◆ ' + (d.type === 'holiday' ? 'Feriado' : 'Día no laborable')} · ${esc(d.title)}</button></div>`,
      )
      .join('');
  }
  $('list').innerHTML = listHtml;
  $('calendarWrap').classList.toggle('hide', state.listMode);
  $('list').classList.toggle('hide', !state.listMode);
  $('modeBtn').textContent = state.listMode ? '▦ Vista calendario' : '≡ Vista lista';

  renderAlerts();
  renderSidebar();
}

function clearDragMarkers(): void {
  document.querySelectorAll('.day.drop-target').forEach((el) => el.classList.remove('drop-target'));
  document.querySelectorAll('.event.dragging').forEach((el) => el.classList.remove('dragging'));
}

function movePostToDate(id: string, newDate: string): void {
  const existing = state.posts.find((p) => p.id === id);
  if (!existing || !newDate) return;
  if (existing.date === newDate) {
    clearDragMarkers();
    return;
  }
  const old = state.posts;
  const moved: Post = { ...existing, date: newDate, updatedAt: new Date().toLocaleString('es-AR'), updatedBy: currentUsername() };
  state.posts = state.posts.map((p) => (p.id === id ? moved : p));
  if (!savePosts(state.posts)) {
    state.posts = old;
    return;
  }
  state.current = new Date(Number(newDate.slice(0, 4)), Number(newDate.slice(5, 7)) - 1, 1);
  render();
  toast(`Publicación movida al ${toDisplayDate(newDate)}`);
}

function clickCalendar(e: Event): void {
  const target = e.target as HTMLElement;
  const spec = target.closest<HTMLElement>('[data-special-date]');
  if (spec) {
    openSpecialDate(spec.dataset.specialDate!, spec.dataset.specialTitle!, spec.dataset.specialType!);
    return;
  }
  const btn = target.closest<HTMLElement>('[data-id]');
  if (btn) {
    const p = state.posts.find((x) => x.id === btn.dataset.id);
    if (p) actions.openPost(p);
    return;
  }
  const cell = target.closest<HTMLElement>('[data-date]');
  if (cell) actions.openPost(null, cell.dataset.date);
}

export function initCalendar(): void {
  actions.render = render;

  $('prev').onclick = () => {
    state.current = new Date(state.current.getFullYear(), state.current.getMonth() - 1, 1);
    render();
  };
  $('next').onclick = () => {
    state.current = new Date(state.current.getFullYear(), state.current.getMonth() + 1, 1);
    render();
  };
  $('todayBtn').onclick = () => {
    state.current = new Date(today.getFullYear(), today.getMonth(), 1);
    render();
  };
  $('modeBtn').onclick = () => {
    state.listMode = !state.listMode;
    render();
  };
  document.querySelectorAll<HTMLElement>('[data-filter]').forEach((b) => {
    b.onclick = () => {
      state.filter = b.dataset.filter as typeof state.filter;
      render();
    };
  });
  $<HTMLInputElement>('showDates').onchange = (e) => {
    state.showDates = (e.target as HTMLInputElement).checked;
    render();
  };

  $('alerts').addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-dismiss]');
    if (!btn) return;
    dismissAlert(btn.dataset.dismiss!);
    render();
    toast('Aviso descartado en este navegador');
  });

  $('sideUpcoming').onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-sidepost]');
    if (!b) return;
    const p = state.posts.find((x) => x.id === b.dataset.sidepost);
    if (p) actions.openPost(p);
  };

  const calendar = $('calendar');
  calendar.addEventListener('click', clickCalendar);
  $('list').addEventListener('click', clickCalendar);
  calendar.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if ((e.key === 'Enter' || e.key === ' ') && t.classList.contains('day')) {
      e.preventDefault();
      actions.openPost(null, t.dataset.date);
    }
  });

  // Drag & drop (V15). En Fase 2 el movimiento se persiste en Supabase.
  calendar.addEventListener('dragstart', (e) => {
    const ev = (e.target as HTMLElement).closest<HTMLElement>('.event[data-id]');
    if (!ev) return;
    state.draggedPostId = ev.dataset.id!;
    ev.classList.add('dragging');
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', state.draggedPostId);
    }
  });
  calendar.addEventListener('dragover', (e) => {
    const day = (e.target as HTMLElement).closest<HTMLElement>('.day[data-date]');
    if (!day || !state.draggedPostId) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.day.drop-target').forEach((el) => {
      if (el !== day) el.classList.remove('drop-target');
    });
    day.classList.add('drop-target');
  });
  calendar.addEventListener('dragleave', (e) => {
    const day = (e.target as HTMLElement).closest<HTMLElement>('.day[data-date]');
    if (day && !day.contains(e.relatedTarget as Node | null)) day.classList.remove('drop-target');
  });
  calendar.addEventListener('drop', (e) => {
    const day = (e.target as HTMLElement).closest<HTMLElement>('.day[data-date]');
    if (!day) return;
    const id = state.draggedPostId || (e.dataTransfer ? e.dataTransfer.getData('text/plain') : '');
    if (!id) return;
    e.preventDefault();
    clearDragMarkers();
    movePostToDate(id, day.dataset.date!);
    state.draggedPostId = '';
  });
  calendar.addEventListener('dragend', (e) => {
    const ev = (e.target as HTMLElement).closest('.event');
    if (ev) ev.classList.remove('dragging');
    clearDragMarkers();
    state.draggedPostId = '';
  });

  // Sincronización entre pestañas del mismo navegador (V15). En Fase 5: Supabase Realtime.
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.posts && e.newValue) {
      try {
        const v = JSON.parse(e.newValue);
        if (Array.isArray(v)) {
          state.posts = v;
          render();
        }
      } catch {
        /* ignorar */
      }
    } else if (e.key === STORAGE_KEYS.ideas && e.newValue) {
      try {
        const v = JSON.parse(e.newValue);
        if (Array.isArray(v)) {
          state.ideas = v;
          render();
        }
      } catch {
        /* ignorar */
      }
    } else if (e.key === STORAGE_KEYS.dismissedAlerts) {
      render();
    }
  });
}
