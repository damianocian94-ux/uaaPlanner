# Puesta en marcha (Fase 1)

Todo con planes gratuitos. Los secretos **nunca** van al repositorio.

## 1. Herramientas locales (Windows)

1. **Node.js 22 LTS:** https://nodejs.org (incluye npm).
2. **Git:** https://git-scm.com/download/win
3. **Supabase CLI** (opcional al principio): `npm i -g supabase` o `scoop install supabase`.
4. Verificar: `node -v`, `npm -v`, `git --version`.

```powershell
npm install          # genera package-lock.json (commitearlo: lo usa la CI)
copy .env.example .env.local
npm run dev          # http://localhost:5173
```

## 2. Supabase (2 proyectos: staging y producción)

1. Crear los proyectos en https://supabase.com. Región sugerida: São Paulo (`sa-east-1`).
2. **Authentication → Sign In / Providers:**
   - Email: habilitado.
   - **Allow new users to sign up: OFF.**
   - **Confirm email: OFF** (los emails internos no existen).
3. **Project Settings → API:** copiar la URL y la anon/publishable key a `.env.local`. La service_role/secret key va **solo** en `.env.local`, para el script de usuarios.
4. Aplicar migraciones, una de estas dos formas:
   - CLI: `supabase link --project-ref <ref>` y después `supabase db push`.
   - Workflow `db-migrate.yml` (push a `develop` o `main`).
5. Crear los usuarios: `npm run users:create`. Las contraseñas temporales se muestran una sola vez y hay que entregarlas en privado.
   - Para regenerar una contraseña: `npm run users:reset -- erika`.
6. Tests de RLS (con Supabase CLI y Docker): `supabase start` y después `supabase test db`.

## 3. GitHub

1. Crear el repo **privado** y subir el código:
   ```powershell
   git init
   git add .
   git commit -m "Fase 0/1: estructura inicial UAA Planner"
   git branch -M main
   git remote add origin https://github.com/<usuario>/uaa-planner.git
   git push -u origin main
   git checkout -b develop; git push -u origin develop
   ```
2. **Settings → Secrets and variables → Actions → New repository secret:**

| Secret | Uso |
|---|---|
| `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY` | keepalive |
| `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY` | keepalive |
| `STAGING_SUPABASE_DB_URL`, `PROD_SUPABASE_DB_URL` | migraciones y backup. Usar la cadena **Session pooler** (Connect → Session pooler), que funciona por IPv4. |
| `BACKUP_AGE_PUBLIC_KEY` | clave **pública** age para cifrar backups |
| `R2_ACCOUNT_ID` | ID de cuenta de Cloudflare |
| `R2_BACKUP_BUCKET` | `uaa-planner-backups` |
| `R2_BACKUP_ACCESS_KEY_ID`, `R2_BACKUP_SECRET_ACCESS_KEY` | token R2 con permiso de escritura **solo** en el bucket de backups |

> Se usan secrets con prefijo (`STAGING_` / `PROD_`) en lugar de GitHub Environments, porque los Environments en repos privados requieren plan pago.

## 4. Clave de cifrado de backups (age)

```powershell
# instalar age: https://github.com/FiloSottile/age/releases (o: scoop install age)
age-keygen -o uaa-planner-backup.key
```
- La línea `# public key: age1...` va como secret `BACKUP_AGE_PUBLIC_KEY`.
- El archivo `uaa-planner-backup.key` (clave **privada**) se guarda **fuera del repo**, en un gestor de contraseñas o en 2 lugares seguros. Sin esa clave los backups no se pueden restaurar.

## 5. Cloudflare

### R2
1. Activar R2. Cloudflare pide registrar un medio de pago aunque se use el plan gratis: **configurar alertas de facturación/uso**.
2. Crear el bucket `uaa-planner-backups` con una regla de ciclo de vida que borre objetos con prefijo `daily/` a los 30 días.
3. Crear un **API token de R2** con permiso *Object Read & Write* limitado a ese bucket. Sus credenciales van a los secrets `R2_BACKUP_*`.
4. (Fase 4) Buckets de media: `uaa-planner-media-staging` y `uaa-planner-media`.

### Pages
1. **Workers & Pages → Create → Pages → Connect to Git** y elegir el repo.
2. Build command `npm run build`, output `dist`, branch de producción `main`.
3. Variables de entorno, en Production y en Preview con los valores de cada proyecto Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_AUTH_EMAIL_DOMAIN`, `NODE_VERSION=22`.
4. **Custom domains → `planner.uaa.com.ar`**, creando el `CNAME` en la zona DNS de `uaa.com.ar`.

## 6. Restaurar un backup (probar en staging)

```bash
aws s3 cp s3://uaa-planner-backups/daily/<archivo>.tar.gz.age . --endpoint-url https://<account>.r2.cloudflarestorage.com
age -d -i uaa-planner-backup.key -o backup.tar.gz <archivo>.tar.gz.age
mkdir restore && tar -xzf backup.tar.gz -C restore
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file restore/roles.sql --file restore/schema.sql \
  --command 'SET session_replication_role = replica' \
  --file restore/data.sql --dbname "<STAGING_DB_URL>"
```
Después, verificar que los usuarios puedan iniciar sesión y que los datos estén completos.
