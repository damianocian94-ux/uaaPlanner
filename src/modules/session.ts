import { AuthError, loadProfile, onSignedOut, signIn, signOut } from '../lib/auth';
import { $ } from '../lib/dom';
import { supabaseConfigured } from '../lib/supabase';
import { state } from '../state';
import type { Profile } from '../types';

interface SessionHandlers {
  onEnter: (profile: Profile) => void;
}

function showError(message: string): void {
  const el = $('loginError');
  el.textContent = message;
  el.classList.toggle('hide', !message);
}

function showLogin(): void {
  state.user = null;
  $<HTMLFormElement>('loginForm').reset();
  $('auth').classList.remove('hide');
  $<HTMLInputElement>('username').focus();
}

function enter(profile: Profile, handlers: SessionHandlers): void {
  state.user = profile;
  showError('');
  $('greeting').textContent = `Hola, ${profile.display_name || profile.username} · Planificación de contenidos UAA`;
  $('sideUsername').textContent = profile.display_name || profile.username;
  $('sideRole').textContent = profile.role === 'manager' ? 'Sesión iniciada · supervisora' : 'Sesión iniciada';
  $('auth').classList.add('hide');
  handlers.onEnter(profile);
}

export async function initSession(handlers: SessionHandlers): Promise<void> {
  const form = $<HTMLFormElement>('loginForm');
  const button = $<HTMLButtonElement>('loginBtn');

  if (!supabaseConfigured) {
    showError('Falta configurar Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY). Ver docs/setup.md.');
    button.disabled = true;
    return;
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const username = $<HTMLInputElement>('username').value;
    const password = $<HTMLInputElement>('password').value;
    if (!username.trim()) {
      $<HTMLInputElement>('username').focus();
      return;
    }
    button.disabled = true;
    showError('');
    try {
      const profile = await signIn(username, password);
      enter(profile, handlers);
    } catch (err) {
      $<HTMLInputElement>('password').value = '';
      showError(err instanceof AuthError ? err.message : 'No se pudo iniciar sesión. Revisá tu conexión e intentá de nuevo.');
    } finally {
      button.disabled = false;
    }
  };

  $('sideLogout').onclick = async () => {
    await signOut();
    showLogin();
  };

  onSignedOut(() => {
    if (state.user) showLogin();
  });

  // Sesión existente (recarga de página): la identidad sale del token, no del formulario.
  const profile = await loadProfile();
  if (profile) enter(profile, handlers);
}
