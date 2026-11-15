// Aplica las migraciones de supabase/migrations al proyecto indicado en SUPABASE_DB_URL (.env.local).
// Uso: npm run db:push              -> aplica
//      npm run db:push -- --dry-run -> muestra qué aplicaría, sin cambios
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl || dbUrl.includes('<')) {
  console.error('Falta SUPABASE_DB_URL en .env.local (cadena "Session pooler" del proyecto).');
  process.exit(1);
}

// Se ejecuta el binario de la CLI con node directamente (sin shell), para que la
// contraseña de la URL no pase por cmd.exe ni se rompa con caracteres especiales.
const require = createRequire(import.meta.url);
const cliPkg = require.resolve('supabase/package.json');
const cli = path.join(path.dirname(cliPkg), 'dist', 'supabase.js');

const result = spawnSync(
  process.execPath,
  [cli, 'db', 'push', `--remote=${dbUrl}`, '--include-all', '--yes', ...process.argv.slice(2)],
  { stdio: 'inherit' },
);
process.exit(result.status ?? 1);
