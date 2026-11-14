# UAA Planner

Plataforma interna del equipo de Comunicación y Marketing de la Unión Agrícola de Avellaneda: calendario editorial, publicaciones, materiales, banco de ideas, tareas y alertas.

- **Producción (prevista):** https://planner.uaa.com.ar
- **Contexto y especificación:** [PROJECT_CONTEXT_UAA_PLANNER.md](PROJECT_CONTEXT_UAA_PLANNER.md)
- **Inventario de V15:** [docs/v15-inventario.md](docs/v15-inventario.md)
- **Puesta en marcha:** [docs/setup.md](docs/setup.md)

## Stack (planes gratuitos)

| Capa | Tecnología |
|---|---|
| Frontend | Vite + TypeScript (sin framework), HTML/CSS de V15 |
| Hosting | Cloudflare Pages |
| Base de datos, login y tiempo real | Supabase (Postgres + Auth + Realtime, con RLS) |
| Archivos | Cloudflare R2 |
| Tareas programadas | GitHub Actions (keepalive, backup diario, migraciones, CI) |

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar
npm run dev
npm run build
```

## Estructura

```text
index.html               markup de V15
src/styles/v15.css       CSS original de V15 (no modificar)
src/styles/app.css       ajustes posteriores
src/modules/             calendario, ficha, ideas, tareas, biblioteca, sesión…
src/store/local.ts       persistencia local TEMPORAL (se reemplaza por Supabase en Fases 2-3)
src/lib/                 supabase, auth, utilidades
supabase/migrations/     esquema SQL versionado (con RLS)
supabase/tests/          tests pgTAP
scripts/create-users.ts  alta de usuarios (local, service_role)
.github/workflows/       ci, db-migrate, keepalive, db-backup
reference/v15/           HTML original aprobado (solo referencia)
```

## Estado

- [x] Fase 0: inventario de V15 y migración a Vite/TS sin cambios visuales.
- [ ] Fase 1: login real, roles, keepalive y backup. **El código está escrito; falta probarlo con los proyectos de Supabase, GitHub y Cloudflare.**
- [ ] Fases 2 a 9: ver el plan en el documento de contexto.
