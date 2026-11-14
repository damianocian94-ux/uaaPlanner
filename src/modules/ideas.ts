import { $, esc, toast } from '../lib/dom';
import { actions, state } from '../state';
import { saveIdeas } from '../store/local';
import type { Idea } from '../types';
import { closeExtra, openExtra } from './extraModal';
import { openPostFromIdea } from './postForm';

function showIdeas(): void {
  const content = openExtra(
    'Banco de ideas',
    `<p class="muted">Anotá ideas todavía sin fecha. Cuando decidas publicarlas, pasalas al calendario.</p><form id="ideaForm"><label for="ideaTitle">Título de la idea</label><input id="ideaTitle" class="extra-input" required maxlength="160" placeholder="Ej.: Reel sobre drones agrícolas"><label for="ideaNotes">Notas / propuesta</label><textarea id="ideaNotes" class="extra-textarea" placeholder="Objetivo, materiales necesarios, enfoque..."></textarea><button class="btn primary" type="submit">＋ Guardar idea</button></form><div id="ideaItems"></div>`,
  );

  const renderIdeas = (): void => {
    $('ideaItems').innerHTML = state.ideas.length
      ? state.ideas
          .map(
            (x) =>
              `<div class="idea-row"><div style="flex:1;min-width:180px"><strong>${esc(x.title)}</strong><p>${esc(x.notes || 'Sin notas')}</p></div><div class="extra-actions"><button type="button" class="btn primary" data-planidea="${esc(x.id)}">Planificar</button><button type="button" class="btn danger" data-delidea="${esc(x.id)}">Eliminar</button></div></div>`,
          )
          .join('')
      : '<p class="muted">Todavía no hay ideas guardadas.</p>';
  };
  renderIdeas();

  const form = $<HTMLFormElement>('ideaForm');
  form.onsubmit = (e) => {
    e.preventDefault();
    const idea: Idea = {
      id: 'idea' + Date.now(),
      title: $<HTMLInputElement>('ideaTitle').value.trim(),
      notes: $<HTMLTextAreaElement>('ideaNotes').value.trim(),
    };
    if (!idea.title) return;
    state.ideas.unshift(idea);
    if (!saveIdeas(state.ideas)) {
      state.ideas.shift();
      return;
    }
    form.reset();
    renderIdeas();
    actions.render();
    toast('Idea guardada');
  };

  content.onclick = (e) => {
    const t = e.target as HTMLElement;
    const plan = t.closest<HTMLElement>('[data-planidea]');
    const del = t.closest<HTMLElement>('[data-delidea]');
    if (plan) {
      const idea = state.ideas.find((x) => x.id === plan.dataset.planidea);
      if (!idea) return;
      closeExtra();
      openPostFromIdea(idea.title, idea.notes);
      return;
    }
    if (del) {
      if (!confirm('¿Eliminar esta idea?')) return;
      state.ideas = state.ideas.filter((x) => x.id !== del.dataset.delidea);
      saveIdeas(state.ideas);
      renderIdeas();
      actions.render();
    }
  };
}

export function initIdeas(): void {
  $('sideIdeas').onclick = showIdeas;
}
