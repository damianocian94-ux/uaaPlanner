import { $ } from '../lib/dom';

export function openSpecialDate(date: string, title: string, type: string): void {
  $('dateTitle').textContent = title;
  $('dateKind').textContent =
    type === 'holiday' ? 'FERIADO NACIONAL' : type === 'nonworking' ? 'DÍA NO LABORABLE' : 'EFEMÉRIDE · IDEA DE CONTENIDO';
  $('dateWhen').textContent = new Date(date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  $('dateText').textContent =
    type === 'ephemeris'
      ? 'Fecha para considerar en la planificación editorial. No es un feriado nacional.'
      : type === 'nonworking'
        ? 'Día no laborable: no equivale legalmente a un feriado nacional.'
        : 'Feriado nacional. Revisá su alcance y las comunicaciones oficiales cuando planifiques actividades.';
  $('dateModal').classList.remove('hide');
}

export function initDateModal(): void {
  const modal = $('dateModal');
  $('dateClose').onclick = () => modal.classList.add('hide');
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add('hide');
  };
}
