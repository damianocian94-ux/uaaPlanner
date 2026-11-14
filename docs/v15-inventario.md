# Inventario de UAA Planner V15 (Fase 0)

Fuente auténtica: [`reference/v15/uaa-planner-demo-v15.html`](../reference/v15/uaa-planner-demo-v15.html), un único HTML de unos 660 KB con CSS, JS y 3 imágenes PNG en base64. Este archivo no se modifica.

## 1. Tecnologías de V15

- HTML + CSS + JavaScript puro (un IIFE de unas 50 líneas minificadas), sin dependencias ni build.
- Persistencia: `localStorage` / `sessionStorage` del navegador.
- Imágenes: logo de login (2 PNG embebidos) y logo de barra lateral / mobile (mismo PNG).

## 2. Cómo se migró al repo

| Origen V15 | Destino |
|---|---|
| `<style>` completo | [`src/styles/v15.css`](../src/styles/v15.css), **copiado sin cambios** (capas V1→V15 en el mismo orden). |
| Ajustes nuevos | [`src/styles/app.css`](../src/styles/app.css), que se carga después de v15.css. |
| Markup del `<body>` | [`index.html`](../index.html), con las imágenes reemplazadas por archivos. |
| Logo login | `public/assets/img/uaa-logo-login.png` |
| Logo lateral / mobile | `public/assets/img/uaa-logo.png` |
| IIFE JavaScript | Módulos TypeScript en `src/` (ver §5). |

**Decisión de framework:** **TypeScript sin framework (vanilla) + Vite.** V15 está hecha con plantillas `innerHTML` y handlers directos sobre ids fijos. Portarla a React obligaría a reescribir todo el markup y aumentaría el riesgo de alterar el diseño aprobado. Con TS puro, el HTML y el CSS quedan idénticos.

## 3. Pantallas y componentes

| Pantalla / componente | Ids principales | Descripción |
|---|---|---|
| Login | `#auth`, `.login` | V15: selector de usuario sin contraseña. **Reemplazado** por usuario + contraseña (Supabase Auth). |
| Barra superior mobile | `.mobiletop` | Logo + "UAA PLANNER / Comunicación y marketing" (≤950px). |
| Barra lateral | `.side` | Logo, "Comunicación y marketing", Resumen del mes (4 KPIs), Próximas publicaciones (3), Accesos rápidos, usuario y cierre de sesión. |
| KPIs | `#metricTotal`, `#sidePublished`, `#metricPending`, `#metricReview` | Planificadas / Publicadas / Pendientes / En revisión del mes visible y filtro actual. |
| Accesos rápidos | `#sideNew`, `#sideIdeas`, `#sideTasks`, `#sideLibrary` | Nueva publicación, Banco de ideas (contador), Tareas (contador), Biblioteca. |
| Encabezado principal | `.top` | "Calendario editorial", saludo, Exportar / Importar JSON, Nueva publicación. |
| Alertas | `#alerts` | Publicaciones no publicadas a ≤3 días (o vencidas), máx. 8, descartables con ×. Bloque "Menciones de UAA en portales" (placeholder). |
| Filtros de cuenta | `[data-filter]` | Todas / Institucional / Agro / Corralón / Super UAA. |
| Calendario | `#calendar` | Mensual, lunes a domingo, navegación ‹ Hoy ›, drag & drop entre días, clic en día = nueva publicación, accesible con teclado. |
| Vista lista | `#list`, `#modeBtn` | Alterna con el calendario; incluye feriados del mes. |
| Feriados / efemérides | `.date-event`, `#dateModal` | Fijos + feriados 2026 hardcodeados; modal de detalle; checkbox para ocultarlos. |
| Leyenda | `.legend` | Colores de cuentas + feriados. |
| Ficha de publicación | `#overlay`, `#postForm` | Panel lateral: título, cuenta, fecha, formato, estado, copy (botón copiar), notas, adjuntos, enlace, auditoría, eliminar. |
| Adjuntos | `#fileList`, `#assetLightbox` | Tarjetas con preview (imagen, video, documento), orden "n / total", ampliar, bajar, quitar. |
| Modal extra | `#extraModal` | Contenedor para Banco de ideas, Tareas y Biblioteca. |
| Toast | `#toast` | Mensajes breves. |

## 4. Datos y estados

- **Cuentas:** `inst` #004AA1, `agro` #0C670E, `cor` #DA5215, `super` **#C62828** (este hex de Super UAA, definido en V15, resuelve el pendiente del documento de contexto).
- **Estados (color solo en el texto):** draft #43FEF4, materials #FF9F2B, review #E8F81C, ready #1C6C26, published #00FB21.
- **Formatos:** Reel / Video, Post, Carrusel, Historia, Otro.
- **Claves de almacenamiento:** `uaa_planner_demo_v2` (publicaciones), `uaa_planner_ideas_v7`, `uaa_planner_tasks_v15`, `uaa_planner_dismissed_alerts_v12`, `uaa_planner_demo_user` (sessionStorage).

## 5. Real, simulado y faltante

| Función | En V15 | En el repo hoy | Fase destino |
|---|---|---|---|
| Login | Simulado (selector, sin contraseña) | **Real** con Supabase Auth + perfil/rol | 1 ✔ |
| Identidad / rol de Lorena | Por nombre `=== 'lorena'` | Por `profiles.role = 'manager'` | 1 ✔ |
| Publicaciones CRUD | localStorage | localStorage (sin cambios) | 2 |
| Drag & drop | localStorage | localStorage | 2 |
| Feriados | Hardcodeados (2026) | Igual, en `src/lib/specialDates.ts` | 2 |
| Resumen / KPIs | Datos locales | Datos locales | 2 |
| Banco de ideas | localStorage | localStorage | 3 |
| Tareas y privacidad | Simulada en el navegador | Simulada (con rol real) | 3 |
| Adjuntos | Data URL en localStorage (3 MB / 8 MB) | Igual | 4 (R2) |
| Sincronización | Evento `storage` (solo pestañas del mismo navegador) | Igual | 5 (Realtime) |
| Alertas descartables | localStorage por navegador | Igual | 6 |
| Menciones en portales | Placeholder | Placeholder (sin simular) | 6 |
| Exportar / importar JSON | Sí | Sí (a revisar con servidor) | 2 |
| Limpieza / papelera | No existe | No existe | 7 |

## 6. Cambios respecto de V15 (todos funcionales, sin rediseño)

1. Login: selector de usuario reemplazado por usuario + contraseña y mensaje de error genérico. Se reutilizan las clases `.login`, `.btn.primary` y `.login input`.
2. Textos que mencionaban "demo" o WordPress actualizados (pie de página, aviso de menciones, barra lateral, tareas).
3. Botón ↪ de la barra lateral: "Cambiar de usuario" pasa a ser "Cerrar sesión" (`signOut` real).
4. `<title>`: "UAA Planner | Demo V15" pasa a ser "UAA Planner".
5. Seguridad: los `src`/`href` de adjuntos solo aceptan URLs `data:`. Antes se insertaban sin validar.
6. Toast: se reinicia el temporizador si se muestran dos mensajes seguidos.

## 7. Observaciones

- La barra lateral de V15 muestra el logo + "Comunicación y marketing", sin el texto "UAA PLANNER" (ese texto aparece en la barra mobile). Se respeta V15 tal cual.
- No faltan assets: todo lo necesario estaba embebido en el HTML.
- Pendiente: capturas de referencia desktop/mobile (Playwright) para comparar visualmente en cada fase.
