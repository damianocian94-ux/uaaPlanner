/**
 * Alta de los integrantes del equipo en Supabase Auth + tabla profiles.
 *
 * Uso (local, nunca en el navegador ni en CI):
 *   npm run users:create              -> crea los usuarios que falten
 *   npm run users:reset -- lorena     -> genera una nueva contraseña temporal para "lorena"
 *
 * Requiere en .env.local: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_AUTH_EMAIL_DOMAIN.
 * Las contraseñas temporales se muestran UNA sola vez por consola: entregarlas en privado.
 */
import { createClient, type User } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';

type Role = 'manager' | 'member';

const TEAM: { username: string; display_name: string; role: Role }[] = [
  { username: 'damiano', display_name: 'Damiano', role: 'member' },
  { username: 'lorena', display_name: 'Lorena', role: 'manager' },
  { username: 'cecilia', display_name: 'Cecilia', role: 'member' },
  { username: 'emiliana', display_name: 'Emiliana', role: 'member' },
  { username: 'erika', display_name: 'Erika', role: 'member' },
];

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const domain = process.env.VITE_AUTH_EMAIL_DOMAIN || 'planner.uaa.com.ar';

if (!url || !serviceKey) {
  console.error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

const tempPassword = (): string => randomBytes(12).toString('base64url'); // 16 caracteres

async function findUserByEmail(email: string): Promise<User | null> {
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return found;
    if (data.users.length < 200) return null;
  }
}

async function upsertProfile(id: string, member: (typeof TEAM)[number]): Promise<void> {
  const { error } = await admin
    .from('profiles')
    .upsert({ id, username: member.username, display_name: member.display_name, role: member.role });
  if (error) throw error;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const resetIdx = args.indexOf('--reset');
  const resetUser = resetIdx >= 0 ? args[resetIdx + 1]?.toLowerCase() : undefined;

  if (resetIdx >= 0 && !resetUser) {
    console.error('Indicá el usuario: npm run users:reset -- <usuario>');
    process.exit(1);
  }

  const targets = resetUser ? TEAM.filter((m) => m.username === resetUser) : TEAM;
  if (!targets.length) {
    console.error(`Usuario desconocido: ${resetUser}`);
    process.exit(1);
  }

  const credentials: { usuario: string; contraseña_temporal: string }[] = [];

  for (const member of targets) {
    const email = `${member.username}@${domain}`;
    const existing = await findUserByEmail(email);

    if (resetUser) {
      if (!existing) throw new Error(`${member.username} no existe todavía. Ejecutá primero users:create.`);
      const password = tempPassword();
      const { error } = await admin.auth.admin.updateUserById(existing.id, { password });
      if (error) throw error;
      credentials.push({ usuario: member.username, contraseña_temporal: password });
      continue;
    }

    if (existing) {
      await upsertProfile(existing.id, member);
      console.log(`✓ ${member.username}: ya existía (perfil actualizado, contraseña sin cambios)`);
      continue;
    }

    const password = tempPassword();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: member.username },
    });
    if (error || !data.user) throw error ?? new Error('No se pudo crear el usuario');
    await upsertProfile(data.user.id, member);
    credentials.push({ usuario: member.username, contraseña_temporal: password });
    console.log(`✓ ${member.username}: creado (${member.role})`);
  }

  if (credentials.length) {
    console.log('\nContraseñas temporales (se muestran una sola vez; entregalas en privado y no las guardes en el repo):');
    console.table(credentials);
  }
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
