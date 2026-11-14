import { AUTH_EMAIL_DOMAIN } from '../config';
import type { Profile } from '../types';
import { supabase } from './supabase';

const USERNAME_RE = /^[a-z0-9._-]{2,32}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** "lorena" -> "lorena@planner.uaa.com.ar" (email interno de Supabase Auth). */
export function usernameToEmail(username: string): string {
  return `${username}@${AUTH_EMAIL_DOMAIN}`;
}

export class AuthError extends Error {}

const GENERIC_ERROR = 'Usuario o contraseña incorrectos.';

export async function signIn(rawUsername: string, password: string): Promise<Profile> {
  if (!supabase) throw new AuthError('La aplicación no está configurada (faltan las variables de Supabase).');
  const username = normalizeUsername(rawUsername);
  // Mensaje genérico: no revelar si el usuario existe.
  if (!USERNAME_RE.test(username) || !password) throw new AuthError(GENERIC_ERROR);

  const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password });
  if (error) {
    if (error.status === 429) throw new AuthError('Demasiados intentos. Esperá unos minutos y volvé a intentar.');
    throw new AuthError(GENERIC_ERROR);
  }
  const profile = await loadProfile();
  if (!profile) {
    await supabase.auth.signOut();
    throw new AuthError('Tu usuario no tiene un perfil asignado. Contactá a la administración.');
  }
  return profile;
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}

/** Perfil del usuario autenticado. La identidad sale de la sesión, nunca del formulario. */
export async function loadProfile(): Promise<Profile | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, role')
    .eq('id', uid)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

export function onSignedOut(callback: () => void): void {
  supabase?.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') callback();
  });
}
