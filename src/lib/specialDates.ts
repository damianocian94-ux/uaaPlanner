import type { SpecialDate, SpecialDateType } from '../types';

/*
  Feriados y efemérides tal como estaban en V15.
  TEMPORAL: en Fase 2 se reemplaza por la tabla `important_dates`
  alimentada por holidays-sync.yml con fuente y año verificables.
*/

const FIXED_DATES: [string, string, SpecialDateType][] = [
  ['01-01', 'Año Nuevo', 'holiday'], ['03-24', 'Día Nacional de la Memoria por la Verdad y la Justicia', 'holiday'], ['04-02', 'Día del Veterano y de los Caídos en la Guerra de Malvinas', 'holiday'], ['05-01', 'Día del Trabajador', 'holiday'], ['05-25', 'Día de la Revolución de Mayo', 'holiday'], ['06-20', 'Paso a la Inmortalidad del General Manuel Belgrano', 'holiday'], ['07-09', 'Día de la Independencia', 'holiday'], ['12-08', 'Inmaculada Concepción de María', 'holiday'], ['12-25', 'Navidad', 'holiday'],
  ['02-04', 'Día Mundial contra el Cáncer', 'ephemeris'], ['03-08', 'Día Internacional de la Mujer', 'ephemeris'], ['03-21', 'Día Internacional de los Bosques', 'ephemeris'], ['03-22', 'Día Mundial del Agua', 'ephemeris'], ['04-22', 'Día Internacional de la Madre Tierra', 'ephemeris'], ['04-29', 'Día del Animal (Argentina)', 'ephemeris'], ['05-17', 'Día Mundial del Reciclaje', 'ephemeris'], ['06-05', 'Día Mundial del Medio Ambiente', 'ephemeris'], ['06-06', 'Día de la Ingeniería Argentina', 'ephemeris'], ['07-07', 'Día Nacional de la Conservación del Suelo', 'ephemeris'], ['08-06', 'Día del Ingeniero Agrónomo y del Veterinario (Argentina)', 'ephemeris'], ['08-29', 'Día del Árbol (Argentina)', 'ephemeris'], ['09-08', 'Día del Agricultor y Productor Agropecuario (Argentina)', 'ephemeris'], ['09-11', 'Día del Maestro (Argentina)', 'ephemeris'], ['09-21', 'Día del Estudiante y de la Primavera', 'ephemeris'], ['10-08', 'Día del Trabajador Rural (Argentina)', 'ephemeris'], ['10-16', 'Día Mundial de la Alimentación', 'ephemeris'], ['11-10', 'Día de la Tradición (Argentina)', 'ephemeris'], ['11-20', 'Día de la Soberanía Nacional — fecha conmemorativa', 'ephemeris'], ['12-05', 'Día Mundial del Suelo', 'ephemeris'],
];

const HOLIDAYS_2026: [string, string, SpecialDateType?][] = [
  ['02-16', 'Carnaval'], ['02-17', 'Carnaval'], ['03-23', 'Día no laborable con fines turísticos', 'nonworking'], ['04-03', 'Viernes Santo'], ['06-15', 'Paso a la Inmortalidad del Gral. Güemes (trasladado)'], ['07-10', 'Día no laborable con fines turísticos', 'nonworking'], ['08-17', 'Paso a la Inmortalidad del Gral. San Martín'], ['10-12', 'Día del Respeto a la Diversidad Cultural'], ['11-09', 'Feriado nacional especial — visita del Papa León XIV'], ['11-23', 'Día de la Soberanía Nacional (trasladado)'], ['12-07', 'Día no laborable con fines turísticos', 'nonworking'],
];

export function specialDates(year: number): SpecialDate[] {
  const out: SpecialDate[] = FIXED_DATES.map(([md, title, type]) => ({ date: `${year}-${md}`, title, type }));
  if (year === 2026) {
    HOLIDAYS_2026.forEach(([md, title, type = 'holiday']) => out.push({ date: `2026-${md}`, title, type }));
  }
  return out;
}
