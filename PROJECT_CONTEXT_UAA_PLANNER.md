# UAA Planner — Contexto del proyecto y especificación funcional

> Documento de traspaso para desarrollar UAA Planner con Claude Code desde Visual Studio Code.
>
> **Objetivo:** convertir la demo aprobada **UAA Planner V15** en una aplicación web independiente, multiusuario y segura, publicada en el subdominio `planner.uaa.com.ar`, sin depender de WordPress, **utilizando exclusivamente planes gratuitos** (GitHub + Cloudflare Pages + Supabase + Cloudflare R2).

---

## 1. Resumen ejecutivo

UAA Planner es una plataforma interna para el equipo de Comunicación y Marketing de la Unión Agrícola de Avellaneda (UAA).

Debe centralizar la planificación de contenidos y publicaciones de redes sociales, el calendario editorial, los materiales multimedia, las ideas, las tareas individuales y las alertas relevantes para la organización.

La aplicación debe conservar la identidad visual, la distribución, los componentes y las funcionalidades ya aprobadas en **UAA Planner V15**. La V15 es la referencia visual y funcional principal: no rediseñar ni simplificar módulos sin autorización.

La aplicación final debe:

- Funcionar en un subdominio propio, independiente de WordPress.
- Tener inicio de sesión real con usuarios y contraseñas individuales.
- Compartir los datos entre todos los integrantes del equipo.
- Permitir edición colaborativa y actualización automática en las pantallas abiertas.
- Ser responsive y usable desde PC, tablet y celular.
- Permitir subir, previsualizar, descargar y eliminar archivos multimedia.
- Tener permisos reales aplicados en el backend, no solamente ocultando elementos de la interfaz.

- Operar sin costos, dentro de los límites de los planes gratuitos, con herramientas para controlar y liberar espacio.

**Subdominio previsto:** `https://planner.uaa.com.ar/`

El subdominio fue creado en el hosting institucional (cPanel). Ya no se usará ese hosting para ejecutar la aplicación: el subdominio se apuntará mediante un registro DNS `CNAME` a Cloudflare Pages. Se requiere acceso a la zona DNS de `uaa.com.ar`.

---

## 2. Contexto y decisiones ya tomadas

1. El proyecto comenzó como una demo web y fue evolucionando hasta UAA Planner V15 mediante varias rondas de cambios visuales y funcionales.
2. Se intentó integrarlo como plugin de WordPress. Aparecieron conflictos de estilos, encabezado, pie de página y capas/modales con el tema del sitio.
3. Se decidió abandonar la integración con WordPress y alojar Planner como aplicación independiente en un subdominio del mismo hosting.
4. La decisión de usar el mismo hosting no implica compartir la instalación, los archivos ni la base de datos de WordPress.
5. Se propuso PHP + MySQL + JavaScript como arquitectura inicial porque es compatible con muchos hostings cPanel compartidos. Debe confirmarse contra las capacidades reales del proveedor antes de cerrar la arquitectura.
6. Se generó un ZIP piloto PHP/MySQL (`uaa-planner-app-piloto-v0.2.zip`). Es un prototipo inicial, no una versión lista para producción ni una implementación validada en el hosting.
7. El usuario quiere continuar el desarrollo con Claude Code desde Visual Studio Code y llevar el proyecto a un repositorio Git.
8. **(Nov 2026) Cambio de arquitectura:** se abandona PHP/MySQL/cPanel. La aplicación se aloja en GitHub y se despliega en servicios gratuitos:
   - **Cloudflare Pages** para el frontend y las funciones serverless (se descartó Vercel porque su plan Hobby no permite uso comercial/organizacional).
   - **Supabase** (PostgreSQL) para base de datos, autenticación (Supabase Auth) y sincronización en tiempo real (Supabase Realtime).
   - **Cloudflare R2** para imágenes y videos (10 GB gratuitos, sin costo de egreso).
   - **GitHub Actions** para tareas programadas: ping periódico a Supabase (evitar la pausa por inactividad), backup diario con `pg_dump`, monitoreo de menciones y actualización de feriados.
9. Se debe diseñar una **función de limpieza** (individual y masiva) para que la base de datos y el almacenamiento de archivos no superen los límites gratuitos.
10. El prototipo PHP 0.2 queda solo como referencia histórica; no se migra su código.

### Regla principal de producto

**Preservar todo lo aprobado en V15.** Los cambios futuros deben ser incrementales. No cambiar el diseño, la navegación, la identidad visual, los nombres de secciones o la experiencia sin una solicitud explícita.

---

## 3. Identidad visual y diseño

### 3.1 Tema general

- Tema oscuro (dark mode) en toda la aplicación.
- Color principal de la plataforma: `#004AA1`.
- Interfaz intuitiva, limpia, moderna y de uso cotidiano.
- Diseño responsive: en móvil la aplicación debe quedar centrada, correctamente dimensionada y sin desbordamientos horizontales.
- Mantener el estilo visual aprobado en V15.
- No mostrar la foto de la Casa Central de UAA como fondo o decoración; utilizar el logo institucional.
- Usar el logo UAA adjuntado/aprobado en el título y en la barra lateral según la versión V15 aprobada.

### 3.2 Barra lateral

La barra lateral debe mantener el diseño aprobado:

- Logo de UAA.
- Texto exacto:
  - `UAA PLANNER`
  - `Comunicación y marketing`
- No agregar textos adicionales al encabezado.
- Elementos de la barra lateral centrados, como se solicitó.
- No volver a agregar el rótulo `CALENDARIO EDITORIAL`.
- Los accesos rápidos aprobados incluyen los módulos de navegación acordados, entre ellos Resumen, Publicados y Tareas.
- Evitar duplicar en el área principal elementos que ya están disponibles en la barra lateral.
- Mantener la versión final aprobada de la barra, no recuperar elementos que se pidieron quitar.

### 3.3 Colores de cuentas

Cada cuenta/red debe identificarse consistentemente por su color:

| Cuenta visible | Identificador interno sugerido | Color |
|---|---|---|
| UAA Institucional | `inst` | `#004AA1` |
| UAA Agro | `agro` | `#0C670E` |
| UAA Corralón | `cor` | `#DA5215` |
| Super UAA | `super` | `#C62828` (definido en el CSS de V15) |

Nombres y etiquetas visibles:

- `UAA Institucional`
- `UAA Agro`
- `UAA Corralón`
- `Super UAA`

Para Super UAA, la etiqueta visible debe ser solamente **“Super UAA”**. No mostrar el usuario de Instagram en el nombre de la cuenta. La cuenta corresponde a `@supermercadouaa`, pero ese handle no debe agregarse al rótulo visible si no estaba en V15.

Referencias de cuentas originales:
- Institucional: `@unionagricoladeavellaneda`
- Agro: `@agrouaa`
- Corralón: `@corralonferreteria.uaa`
- Super UAA: `@supermercadouaa`

### 3.4 Colores de estados de publicación

Aplicar los colores **al texto que muestra el estado**, no colorear toda la tarjeta ni cambiar el fondo de la publicación.

| Estado | Color de texto |
|---|---|
| Idea/Borrador | `#43FEF4` |
| Pendiente de materiales | `#FF9F2B` |
| En revisión | `#E8F81C` |
| Listo para publicar | `#1C6C26` |
| Publicado | `#00FB21` |

Conservar contraste suficiente con el tema oscuro. Si el color exacto presenta problemas de accesibilidad, mantener el color solicitado y resolver el contraste mediante peso tipográfico, borde o fondo neutro sin alterar el color del texto.

---

## 4. Usuarios, roles y permisos

Usuarios definidos:

- `damiano`
- `lorena`
- `cecilia`
- `emiliana`
- `erika`

No hay contraseñas definidas en este documento. Cada usuario debe establecer una contraseña individual y segura mediante un procedimiento de administración. Nunca guardar contraseñas en el repositorio, archivos de configuración versionados ni documentación.

### Roles

- **Lorena:** supervisora/manager.
- **Damiano, Cecilia, Emiliana y Erika:** miembros.

### Reglas de permisos

- Todos los usuarios autenticados pueden acceder al calendario compartido y colaborar con publicaciones, según las reglas generales del equipo.
- Todos pueden crear, editar y eliminar publicaciones de acuerdo con los permisos acordados por el equipo.
- Todos pueden cargar y gestionar materiales compartidos de publicaciones.
- Cada miembro ve únicamente sus propias tareas.
- Lorena puede ver las tareas de todos los integrantes.
- Lorena puede crear tareas y asignarlas a cualquiera de los integrantes.
- Lorena puede editar, completar y eliminar tareas de cualquier integrante.
- Un miembro puede crear, editar, completar y eliminar sus propias tareas.
- Un miembro no debe poder consultar, editar, marcar como completadas ni eliminar tareas ajenas.
- Las restricciones deben implementarse y validarse en el backend/API. Ocultar botones en el frontend no es suficiente.
- No debe existir un selector que permita suplantar a otro usuario. La identidad debe provenir de la sesión autenticada en el servidor.

---

## 5. Módulos y funcionalidades

### 5.1 Inicio de sesión

Implementado con **Supabase Auth** (email + contraseña):

- El usuario escribe su **nombre de usuario** (`damiano`, `lorena`, etc.). El frontend lo traduce a un email interno determinístico (por ejemplo `damiano@planner.uaa.com.ar`; definir dominio en Fase 1) y autentica contra Supabase Auth.
- **Registro público deshabilitado** (`Allow new users to sign up = off`). Los cinco usuarios se crean con un script de administración que usa la `service_role` key localmente, nunca desde el navegador.
- Confirmación de email desactivada para estas cuentas internas; cada usuario define su contraseña inicial mediante un enlace/flujo de administración.
- Contraseñas con hash gestionado por Supabase (bcrypt). Política de contraseña mínima configurada en el proyecto.
- Sesión con JWT de acceso corto + refresh token; cierre de sesión real con `signOut` (revoca el refresh token).
- Límite de intentos de login provisto por Supabase Auth (rate limits configurables).
- Mensajes de error genéricos (“Usuario o contraseña incorrectos”).
- La identidad para permisos proviene siempre de `auth.uid()` en la base de datos o del JWT verificado en las funciones; nunca de un campo enviado por el navegador.
- Como la API se autentica con header `Authorization: Bearer`, no se usan cookies de sesión propias y el riesgo CSRF clásico no aplica; aun así, configurar CORS restrictivo en las funciones.
- Pantalla de login con el diseño aprobado de V15.

### 5.2 Calendario editorial

Es el módulo central de la plataforma.

- Vista mensual/calendario al estilo de Metricool.
- Poder visualizar todas las cuentas juntas.
- Poder filtrar por una cuenta específica.
- Las publicaciones deben mostrar claramente la cuenta y el estado.
- Crear, editar, duplicar y eliminar publicaciones.
- Reprogramar publicaciones arrastrándolas de un día a otro (drag & drop).
- Al mover una publicación, persistir el nuevo día/fecha en el servidor.
- Permitir navegar por meses y fechas.
- Mostrar fechas importantes argentinas:
  - Feriados nacionales.
  - Días conmemorativos o “días de”.
  - Efemérides relevantes para Argentina y, cuando aplique, para el sector agropecuario/comercial.
- Diferenciar visualmente las efemérides de las publicaciones.
- Las fechas deben tener fuente y mecanismo de actualización verificable; no hardcodear como definitivas fechas variables sin indicar año/fuente.
- Conservar la vista aprobada en V15.

### 5.3 Publicaciones

Cada publicación debe poder incluir, como mínimo:

- Cuenta/red social.
- Fecha y, si aplica, hora planificada.
- Título o nombre interno.
- Copy/texto de la publicación.
- Descripción/observaciones.
- Estado.
- Material multimedia adjunto.
- Autor/creador y timestamps.
- Historial básico de creación/modificación recomendable.

Los usuarios del equipo deben poder crear, editar y eliminar publicaciones. Debe contemplarse validación de los datos del lado servidor.

### 5.4 Multimedia / biblioteca de imágenes y videos

La experiencia solicitada es similar a un gestor de contenido:

- Subir imágenes.
- Subir videos.
- Guardar los archivos en almacenamiento del servidor, no en `localStorage`.
- Ver vista previa del material desde la publicación.
- Para varias imágenes, mostrar carrusel.
- Para videos verticales/reels, mostrar preview apropiado.
- Mostrar miniaturas y permitir abrir una vista ampliada.
- Descargar y eliminar archivos según permisos.
- Permitir asociar uno o varios archivos a una publicación.
- Mostrar el material disponible en la vista de detalle/edición de la publicación.
- Validar extensión, MIME real, tamaño y contenido del archivo.
- Generar nombres de archivo no predecibles.
- Definir límites configurables para tamaño, cantidad y formatos.
- No confiar solamente en el `Content-Type` enviado por el navegador.
- Prever backups de la base de datos (los archivos dependen de la durabilidad de R2 + papelera; ver 5.13).

**Implementación con Cloudflare R2:**

- Bucket **privado** `uaa-planner-media` (sin acceso público ni dominio público).
- **Subida:** el frontend pide a una Pages Function (`POST /api/media/upload-url`) una URL prefirmada de `PUT` con vencimiento corto (≈5 min). La función verifica el JWT de Supabase y el permiso sobre la publicación, valida extensión/tamaño declarado/cantidad, genera la clave `posts/{post_id}/{uuid}.{ext}` y registra la fila en `post_media` con estado `pending`. El navegador sube directo a R2 (evita el límite de tamaño de cuerpo de las funciones).
- **Confirmación:** `POST /api/media/confirm` lee los primeros bytes del objeto en R2, valida *magic bytes* (MIME real) y tamaño real; si es válido pasa a `ready`, si no, borra el objeto y la fila.
- **Miniaturas:** se generan en el navegador antes de subir (canvas para imágenes, captura de un frame para videos) y se suben como objeto aparte de pocos KB. Las grillas, el calendario y los carruseles usan miniaturas; el archivo completo se carga solo en la vista ampliada o al descargar (ahorra operaciones y ancho de banda).
- **Visualización/descarga:** `GET /api/media/{id}` verifica JWT y permiso, y responde con el objeto vía binding de R2 (o redirección a URL prefirmada de corta duración).
- **Borrado:** siempre a través de la API/limpieza (5.13), nunca directo desde el navegador.
- Límites iniciales sugeridos (configurables): imágenes JPG/PNG/WebP hasta 10 MB; videos MP4/MOV hasta 100 MB; máximo 10 archivos por publicación.
- CORS del bucket restringido a `https://planner.uaa.com.ar` y al dominio de previews de Cloudflare Pages.

### 5.5 Estados de publicaciones

Estados requeridos:

1. Idea/Borrador.
2. Pendiente de materiales.
3. En revisión.
4. Listo para publicar.
5. Publicado.

Los colores de estado están definidos en la sección 3.4 y se aplican al texto del estado.

### 5.6 Resumen y publicados

Conservar los módulos de resumen y publicaciones realizadas que ya forman parte de la navegación aprobada.

El resumen debe evitar repetir componentes que ya se encuentran en el calendario o en la barra lateral. Los indicadores deben derivarse de los datos reales del servidor, no de valores de ejemplo.

### 5.7 Banco de ideas

- Sección de ideas para que el equipo registre propuestas de contenido.
- Crear, editar y eliminar ideas.
- Posibilidad de convertir una idea en una publicación del calendario.
- Persistencia compartida en servidor.
- Identificar autor y fecha de creación/modificación si corresponde.
- Respetar la interfaz V15.

### 5.8 Tareas

Módulo incluido en los accesos rápidos.

- Cada integrante puede cargar sus propias tareas.
- Las tareas tienen un checkbox para marcarlas realizadas.
- El usuario puede crear, editar, completar y eliminar sus tareas.
- Las tareas son privadas por usuario, excepto para Lorena.
- Lorena puede ver las tareas de todos y asignar tareas a otros usuarios.
- Debe ser claro quién es el responsable de cada tarea cuando Lorena ve el conjunto.
- Las tareas deben persistir en el servidor y sincronizarse entre sesiones/dispositivos.
- Una tarea debería contemplar título, descripción opcional, responsable, estado/completada, fecha de creación y vencimiento opcional.

### 5.9 Alertas y notificaciones

- Las alertas se muestran en la propia plataforma/calendario, sin depender inicialmente de notificaciones del sistema operativo.
- Ejemplo: “Falta 1 día para [publicación]”.
- Las alertas deben poder cancelarse/descartarse mediante un control visible.
- La acción de cancelar debe persistirse para que no reaparezca inmediatamente en otra sesión.
- Considerar recordatorios de publicaciones próximas, materiales faltantes y revisiones pendientes.
- Evitar alertas duplicadas.
- Diferenciar alertas activas, descartadas y resueltas.

### 5.10 Monitoreo de menciones en portales

Se solicitó una alerta cuando algún portal mencione a UAA, incluyendo términos como:

- `UAA`
- `Unión Agrícola de Avellaneda`
- `Union Agricola de Avellaneda`

La función debe detectar menciones en portales/noticias y generar una alerta dentro de Planner.

Importante:
- Esto requiere integrar una fuente externa de noticias/búsqueda, RSS, proveedor de monitoreo o servicio equivalente.
- No debe simularse como si funcionara si no existe una integración activa.
- Deben configurarse frecuencia, fuentes, deduplicación, enlaces, fecha de publicación y registro de coincidencias.
- Hay que analizar costos, cobertura, límites y términos de uso de la fuente antes de implementarla.
- La búsqueda debe contemplar variantes con/sin acentos y mayúsculas/minúsculas.
- El usuario quiere recibir la alerta dentro del calendario/plataforma.

### 5.11 Sincronización multiusuario

Requisito explícito: cuando otra persona realiza un cambio, debe aparecer automáticamente en las pantallas de los demás usuarios, sin que tengan que actualizar la página.

- La base de datos (Supabase) es la fuente de verdad.
- Toda modificación debe persistirse en la base de datos.
- Los clientes se suscriben a cambios con **Supabase Realtime** (`postgres_changes`) sobre `posts`, `post_media`, `ideas`, `tasks` y `notifications`. Realtime respeta RLS: cada usuario solo recibe los eventos de las filas que puede leer (un miembro no recibe cambios de tareas ajenas).
- Al reconectar (pérdida de red, pestaña suspendida) el cliente recarga el rango visible para no perder eventos.
- Evitar sobrescribir cambios concurrentes silenciosamente: columna `version` (entero) + `updated_at` en cada tabla editable. Las actualizaciones se hacen con `... WHERE id = :id AND version = :version_leida`; si no afecta filas, hay conflicto.
- Ante un conflicto, mostrar aviso con opción de recargar la versión actual o reintentar sobre ella.
- Mostrar feedback de guardado, error y estado de conexión en tiempo real.

### 5.12 Responsive y PWA

- Diseño adaptable a desktop, tablet y móvil.
- En móvil, la interfaz debe quedar centrada, sin columnas cortadas ni scroll horizontal inesperado.
- Mantener accesibles los controles principales y los formularios.
- Se desea evaluar la posibilidad de instalar Planner como PWA en la pantalla de inicio de celulares y computadoras.
- La PWA es una mejora posterior; no debe bloquear la entrega de la aplicación web responsive.
- Si se incorpora service worker, no cachear respuestas privadas ni datos autenticados de manera insegura.

### 5.13 Gestión de espacio y limpieza de datos

Objetivo: que la base de datos (Supabase, 500 MB) y los archivos (R2, 10 GB) nunca superen los límites gratuitos, con borrado **individual** y **masivo (bulk)** controlado.

**Monitor de uso (visible para Lorena):**
- Tamaño de la base: función `storage_usage()` que devuelve `pg_database_size()` y tamaño por tabla.
- Uso de R2: suma de `size_bytes` de `post_media` + miniaturas (la tabla es la fuente de verdad), contrastada periódicamente con el listado real del bucket.
- Barras de uso respecto del límite y alertas automáticas al **70 %** (aviso) y **90 %** (crítico) en el módulo de alertas.

**Borrado individual:**
- Al eliminar una publicación, idea, tarea o archivo se aplica **borrado lógico** (`deleted_at`) y el elemento pasa a la **Papelera**.
- Desde la Papelera se puede **restaurar** o **eliminar definitivamente**.
- La papelera se vacía automáticamente después de **N días** (sugerido: 30, configurable).
- Permisos: los mismos de cada módulo (un miembro solo puede borrar sus tareas; las publicaciones y materiales los gestiona el equipo).

**Limpieza masiva (solo Lorena):**
- Pantalla “Limpieza” con filtros combinables, por ejemplo:
  - Publicaciones en estado `Publicado` anteriores a una fecha / con más de X meses.
  - Por cuenta (Institucional, Agro, Corralón, Super UAA).
  - **Solo material multimedia**: elimina los archivos originales de publicaciones viejas pero conserva la publicación, el copy y la miniatura como registro histórico (es la opción que más espacio libera).
  - Videos de más de X MB.
  - Tareas completadas hace más de X meses.
  - Ideas descartadas/archivadas.
  - Alertas descartadas o resueltas, menciones de portales y `audit_logs` más antiguos que X días.
- Flujo obligatorio en dos pasos:
  1. **Vista previa (dry-run):** muestra cantidad de registros, archivos y espacio que se liberaría, sin borrar nada.
  2. **Confirmación explícita** (escribir la palabra de confirmación) y ejecución.
- Opción de **exportar a JSON/CSV** los registros afectados antes de borrar.
- Cada ejecución queda registrada en `audit_logs` (quién, cuándo, filtros, cantidades, bytes liberados).

**Consistencia entre base y R2:**
- La base nunca borra un objeto de R2 directamente: al purgar un archivo se inserta su clave en la cola `storage_deletions`.
- Una Pages Function / job programado procesa la cola con reintentos y marca cada borrado como completado.
- Barrido semanal de **huérfanos**: objetos en R2 sin fila en `post_media` (por ejemplo, subidas `pending` abandonadas por más de 24 h) se eliminan.

**Implementación:**
- Funciones Postgres `cleanup_preview(filtros jsonb)` y `cleanup_execute(filtros jsonb, confirmacion text)` con `SECURITY DEFINER`, que verifican internamente que `auth.uid()` sea un manager.
- Purga automática de papelera y datos efímeros mediante `pg_cron` (disponible en Supabase) o GitHub Actions.
- Nota: en PostgreSQL el espacio de filas borradas se reutiliza tras el `autovacuum`, pero el tamaño reportado puede no bajar de inmediato. Mostrarlo así en el monitor para no generar confusión.

---

## 6. Arquitectura técnica

Todos los servicios operan en **planes gratuitos**. Verificar los límites vigentes de cada proveedor al iniciar la Fase 1, porque pueden cambiar.

```text
            GitHub (repo + Actions)
              │ push a main / PR
              ▼
  Cloudflare Pages ── planner.uaa.com.ar (CNAME)
  ├─ Frontend estático (Vite build)
  └─ Pages Functions (/api/*) ──► Cloudflare R2 (bucket privado de media)
              │                         ▲
              │ JWT de Supabase          │ URLs prefirmadas (PUT/GET)
              ▼                         │
          Navegador ────────────────────┘
              │
              ▼
           Supabase
           ├─ Auth      (login de los 5 usuarios, registro deshabilitado)
           ├─ Postgres  (tablas + RLS + funciones + pg_cron)
           └─ Realtime  (sincronización entre pantallas)

  GitHub Actions (programadas):
  ├─ keepalive      → consulta liviana a Supabase cada 3 días
  ├─ db-backup      → pg_dump diario, cifrado, subido a bucket R2 de backups
  ├─ news-monitor   → menciones de UAA en portales cada N horas
  └─ holidays-sync  → feriados/efemérides argentinas (anual + revisión mensual)
```

### Componentes

| Capa | Tecnología | Notas |
|---|---|---|
| Repositorio / CI | **GitHub** + GitHub Actions | Repo privado (2.000 min/mes de Actions gratis; sobra para este uso). |
| Frontend | **Vite + TypeScript sin framework**, HTML/CSS de V15 | Decidido en Fase 0: V15 usa plantillas `innerHTML` sobre ids fijos; portar a TS puro conserva el diseño sin reescribir markup. Cliente `@supabase/supabase-js`. |
| Hosting | **Cloudflare Pages** (plan Free) | Builds automáticos desde GitHub, previews por rama, dominio propio con HTTPS gratuito. |
| API propia | **Cloudflare Pages Functions** (Workers) | Solo para lo que Supabase no resuelve: R2 (firmar URLs, validar, servir, borrar). Límite gratuito ≈100.000 requests/día y CPU acotado por request: mantener las funciones livianas. |
| Base de datos | **Supabase Postgres** (Free) | ≈500 MB. Lógica de permisos con **RLS**. Migraciones con Supabase CLI. |
| Autenticación | **Supabase Auth** | Email interno + contraseña; registro público deshabilitado. |
| Tiempo real | **Supabase Realtime** | `postgres_changes` filtrado por RLS. |
| Archivos | **Cloudflare R2** (Free) | ≈10 GB, egreso gratuito. Requiere registrar medio de pago en Cloudflare para activar R2 aunque se use el plan gratuito: configurar alertas de uso. |
| Tareas programadas | **GitHub Actions** cron + `pg_cron` | Ver sección 6.3. |
| Feriados | ArgentinaDatos API / Nager.Date (a validar) | Se importan a `important_dates` con fuente y año. |
| Menciones | Google News RSS / GDELT (a validar) | Revisar términos de uso y cobertura antes de implementar. |
| Tests | Vitest (unidad), Playwright (E2E), pgTAP o tests SQL (RLS) | Incluir pruebas negativas de permisos. |

### Entornos

- **Local:** Vite dev server + Supabase CLI (Docker) o un proyecto Supabase de desarrollo.
- **Staging:** proyecto Supabase #1 + preview de Cloudflare Pages (rama `develop` o PRs).
- **Producción:** proyecto Supabase #2 + Cloudflare Pages en `planner.uaa.com.ar` (rama `main`).
- El plan gratuito de Supabase permite 2 proyectos activos: exactamente staging + producción.
- Un bucket R2 por entorno (`uaa-planner-media-staging`, `uaa-planner-media`) y uno para backups (`uaa-planner-backups`).

### 6.1 Estructura del repositorio

Orientativa; ajustar en Fase 0/1 según el código V15:

```text
uaa-planner/
├── README.md
├── PROJECT_CONTEXT.md
├── .gitignore
├── .env.example                  # sin secretos
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.ts
│   ├── lib/                      # supabase client, api, realtime, utils
│   ├── modules/                  # calendario, publicaciones, ideas, tareas, alertas, limpieza…
│   ├── components/
│   └── styles/                   # CSS de V15
├── public/
│   └── assets/                   # logo UAA, íconos, fuentes
├── functions/                    # Cloudflare Pages Functions
│   └── api/
│       ├── _middleware.ts        # verificación JWT + CORS
│       └── media/                # upload-url, confirm, [id], delete
├── supabase/
│   ├── config.toml
│   ├── migrations/               # SQL versionado
│   ├── seed.sql                  # solo datos de prueba ficticios
│   └── tests/                    # tests de RLS
├── scripts/
│   └── create-users.ts           # alta de usuarios con service_role (uso local)
├── .github/workflows/
│   ├── ci.yml                    # lint, tests, build
│   ├── db-migrate.yml            # supabase db push (staging/prod)
│   ├── keepalive.yml
│   ├── db-backup.yml
│   ├── news-monitor.yml
│   └── holidays-sync.yml
├── tests/                        # Vitest + Playwright
└── docs/
```

### 6.2 Esquema de datos

Migraciones versionadas en `supabase/migrations/`. Todas las tablas con **RLS habilitado**, claves foráneas e índices. Tablas editables con `created_at`, `updated_at`, `created_by`, `version` y `deleted_at` (papelera).

| Tabla | Propósito |
|---|---|
| `profiles` | 1:1 con `auth.users`: `username`, nombre visible, `role` (`manager`/`member`). |
| `social_accounts` | `inst`, `agro`, `cor`, `super`: nombre visible, handle, color. |
| `posts` | Publicaciones: cuenta, fecha/hora, título, copy, observaciones, estado, autor. |
| `post_media` | Archivos en R2: clave, clave de miniatura, MIME, tamaño, dimensiones/duración, orden, estado (`pending`/`ready`). |
| `ideas` | Banco de ideas; referencia opcional a la publicación generada. |
| `tasks` | Tareas: título, descripción, `assignee_id`, `created_by`, completada, vencimiento. |
| `notifications` | Alertas (publicación próxima, faltan materiales, revisión, mención, uso de espacio). Clave de deduplicación única. |
| `notification_dismissals` | Descartes por usuario. |
| `important_dates` | Feriados/efemérides: fecha, tipo, nombre, fuente, año. |
| `news_mentions` | Menciones: URL (única por hash), título, medio, fecha, término coincidente. |
| `storage_deletions` | Cola de objetos R2 a borrar (5.13). |
| `audit_logs` | Registro de acciones relevantes, incluidas las limpiezas. |
| `app_settings` | Límites configurables (tamaños, días de papelera, umbrales de alerta). |

**Políticas RLS clave:**
- `posts`, `post_media`, `ideas`, `social_accounts`, `important_dates`, `news_mentions`: lectura y escritura para cualquier usuario autenticado del equipo.
- `tasks`: un miembro lee/edita/borra solo filas con `assignee_id = auth.uid()`; un manager accede a todas y puede insertar con cualquier `assignee_id`. Un miembro solo puede insertar tareas asignadas a sí mismo.
- `profiles.role` no puede ser modificado por el propio usuario.
- Las funciones de limpieza masiva y el monitor de uso solo se ejecutan si el usuario es manager.
- No usar la `service_role` key en el frontend ni en Pages Functions expuestas salvo donde sea imprescindible (cola de borrado), y nunca en el navegador.

### 6.3 Tareas programadas (GitHub Actions)

| Workflow | Frecuencia | Qué hace |
|---|---|---|
| `keepalive.yml` | Cada 3 días | Consulta liviana a la API de Supabase (por ejemplo, una RPC `ping()`) en staging y producción para evitar la pausa por 7 días de inactividad. |
| `db-backup.yml` | Diario (madrugada AR) | `supabase db dump` / `pg_dump` (esquema + datos + roles), comprime, **cifra** (age/gpg) y sube a `uaa-planner-backups` en R2. Regla de ciclo de vida en R2: conservar 30 diarios; opcionalmente uno mensual por 12 meses. |
| `news-monitor.yml` | Cada 6 h (ajustable) | Consulta fuentes de noticias, normaliza acentos/mayúsculas, deduplica por URL y crea `news_mentions` + `notifications`. |
| `holidays-sync.yml` | Mensual | Actualiza feriados y efemérides del año en curso y el siguiente. |

Además, con `pg_cron` dentro de Supabase: generación diaria de alertas de publicaciones próximas / materiales faltantes, purga de papelera y datos efímeros, y control de umbrales de espacio.

Consideraciones:
- Los secretos (`SUPABASE_DB_URL`, `SUPABASE_SERVICE_ROLE_KEY`, claves de R2, clave de cifrado del backup) van en **GitHub Secrets**, nunca en el repo.
- GitHub puede desactivar workflows programados en repositorios sin actividad durante 60 días; revisar el estado de los workflows periódicamente y que fallen de forma visible (notificación por email de GitHub).
- **Probar la restauración** de un backup en staging al menos una vez antes de producción y luego periódicamente.
- Los archivos de R2 no tienen backup externo gratuito; la protección es la durabilidad de R2 + papelera con retención + confirmación en borrados masivos.

### 6.4 Límites gratuitos de referencia (verificar vigencia)

| Servicio | Límite principal | Mitigación |
|---|---|---|
| Supabase DB | ≈500 MB | Monitor de uso + limpieza (5.13). Sin binarios en la base. |
| Supabase egress | ≈5 GB/mes | Consultas por rango visible, sin `select *` innecesarios. |
| Supabase inactividad | Pausa tras 7 días | `keepalive.yml`. |
| Supabase backups | No incluidos en Free | `db-backup.yml`. |
| Cloudflare R2 | ≈10 GB, ≈1 M operaciones de escritura y ≈10 M de lectura por mes | Miniaturas, límites de tamaño, limpieza de media. |
| Pages Functions | ≈100.000 requests/día | Servir miniaturas cacheables; solo media pasa por funciones. |
| GitHub Actions | 2.000 min/mes (repo privado) | Workflows cortos. |

---

## 7. Seguridad: requisitos no negociables

- HTTPS obligatorio (Cloudflare Pages lo provee en el dominio propio).
- No subir contraseñas, claves API ni credenciales de base de datos a Git. Proveer `.env.example` sin secretos y excluir `.env*` reales en `.gitignore`.
- Secretos de CI en GitHub Secrets; secretos de Pages Functions en variables cifradas de Cloudflare.
- La `anon key` de Supabase es pública por diseño: **toda** la seguridad de datos depende de RLS. Ninguna tabla del esquema `public` puede quedar sin RLS (agregar un test que lo verifique).
- La `service_role` key nunca llega al navegador.
- Registro público de Supabase Auth deshabilitado.
- Validación de entrada en la base (constraints, `CHECK`, tipos, longitudes) y en las Pages Functions.
- Escape de salida para prevenir XSS (no usar `innerHTML` con datos de usuarios; el copy de las publicaciones es texto libre).
- Content Security Policy y headers de seguridad vía `_headers` de Cloudflare Pages.
- CORS restrictivo en Pages Functions y en el bucket R2.
- Pages Functions: verificar firma, expiración y audiencia del JWT de Supabase en cada request.
- Validar autorización en operaciones de lectura, edición, borrado y descarga de archivos.
- Claves de R2 generadas por el servidor (UUID); nunca usar el nombre de archivo enviado por el usuario como ruta.
- Validar archivos por extensión permitida, MIME detectado (magic bytes) y tamaño real.
- URLs prefirmadas con vencimiento corto.
- Limitar tamaños, cantidad y frecuencia de subida.
- Registrar errores sin exponer stack traces al usuario.
- Backups diarios cifrados de la base y prueba de restauración.
- Borrados masivos solo para manager, con vista previa, confirmación y auditoría.
- Realizar pruebas de autorización negativas (por ejemplo, Damiano intenta leer, editar o recibir por Realtime una tarea de Erika; un miembro intenta ejecutar la limpieza masiva o cambiar su propio rol).

---

## 8. Estado del prototipo PHP/MySQL 0.2

> **Nota (Nov 2026):** con el cambio a Cloudflare Pages + Supabase, este prototipo **no se migra**. Puede consultarse solo como referencia de la adaptación de la interfaz V15. La fuente de diseño sigue siendo V15.

Se generó un archivo llamado:

`uaa-planner-app-piloto-v0.2.zip`

Contenido y comportamiento previstos en ese prototipo:

- `index.php`: interfaz V15 adaptada para sesión autenticada.
- `login.php` y `logout.php`: inicio y cierre de sesión.
- `api.php`: endpoints JSON iniciales para publicaciones, ideas y tareas.
- `private/bootstrap.php`: conexión PDO, sesión, CSRF y utilidades.
- `private/config.example.php`: ejemplo de configuración.
- `private/.htaccess`: intenta bloquear acceso directo a `private`.
- `schema.sql`: tablas iniciales.
- `setup.php`: instalador temporal para crear las cinco cuentas.
- `LEEME_PRIMERO.txt`: notas de instalación y limitaciones.

### Limitaciones conocidas de ese prototipo

Este ZIP debe considerarse **código de arranque experimental**, no producto listo para producción.

- No fue instalado ni validado en el hosting real.
- La interfaz V15 fue adaptada inicialmente, pero necesita una revisión visual y funcional completa.
- El formulario/login visual del prototipo no necesariamente reproduce el login final aprobado de V15.
- La subida multimedia está deshabilitada.
- El endpoint de datos usa payloads JSON por registro en una implementación inicial; se debe revisar y normalizar antes de producción.
- El polling está planteado cada 10 segundos; no es sincronización instantánea.
- No hay resolución de conflictos concurrentes.
- No está implementado el monitoreo real de noticias.
- No están terminadas las alertas persistentes/cancelables.
- El instalador debe eliminarse después de crear tablas/usuarios.
- Debe verificarse el bloqueo de `private` desde una URL pública; no confiar únicamente en la existencia de `.htaccess`.
- Se debe revisar que las acciones de drag & drop y los formularios persistan correctamente en la API.
- Se debe revisar la asignación de tareas de Lorena y la privacidad de miembros con pruebas reales.
- No subir información sensible ni habilitar al equipo hasta completar la auditoría de seguridad.

Claude Code debe inspeccionar el código real del repositorio antes de asumir que todas estas funciones están implementadas. Este documento describe objetivos y contexto, no certifica que el prototipo los cumpla.

---

## 9. Plan de desarrollo

Etapas pequeñas y verificables, con commits/PRs separados. Cada fase se prueba en staging (preview de Cloudflare Pages + Supabase staging) antes de pasar a `main`. Ninguna fase usa datos reales hasta completar la Fase 9.

### Fase 0 — Inventario de V15 y cuentas

1. Agregar al repo los archivos originales de V15 (HTML/CSS/JS, logo, íconos, fuentes) en `reference/v15/`.
2. Inventariar componentes, vistas, formularios, navegación, colores y comportamiento.
3. Mapa de funcionalidades: qué es real, qué está simulado (`localStorage`, usuarios demo) y qué falta.
4. Capturas de referencia desktop y mobile (Playwright) para comparar en cada fase.
5. **Decidir React vs. JavaScript/TypeScript puro** según la estructura de V15 (preferir la opción que permita portar la UI con menos cambios).
6. El usuario crea las cuentas: GitHub (repo privado), Cloudflare (Pages + R2, con alertas de uso), Supabase (proyectos staging y producción).

**Entregable:** inventario documentado en `docs/v15-inventario.md` y decisión de framework.

### Fase 1 — Base técnica, seguridad y operación

1. Scaffold Vite + TypeScript, ESLint/Prettier, Vitest, `.gitignore`, `.env.example`.
2. Conectar el repo a Cloudflare Pages (previews por rama, `main` → producción).
3. Supabase CLI: `supabase/migrations` inicial con `profiles`, `social_accounts`, `app_settings`, `audit_logs` y RLS.
4. Supabase Auth: registro deshabilitado, script `scripts/create-users.ts` para los cinco usuarios y roles (Lorena = manager).
5. Login con nombre de usuario (UI V15), logout, guardia de rutas, carga del perfil/rol.
6. `_middleware.ts` de Pages Functions: verificación de JWT + CORS + headers de seguridad.
7. Workflows: `ci.yml`, `db-migrate.yml`, **`keepalive.yml`** y **`db-backup.yml`** (con bucket R2 de backups, cifrado y retención).
8. Prueba de restauración del backup en staging.
9. Tests: ninguna tabla sin RLS; acceso anónimo rechazado; un usuario no puede cambiar su rol.

**Criterio de aceptación:** los cinco usuarios inician sesión; sin sesión no hay acceso a datos; el keepalive y el backup diario corren en verde y el backup se pudo restaurar.

### Fase 2 — Calendario y publicaciones

1. Migraciones `posts` (con `version`, `deleted_at`) y datos de `social_accounts` (4 cuentas y colores).
2. Portar la vista de calendario de V15: mensual, todas las cuentas o filtro por cuenta, navegación por meses.
3. CRUD de publicaciones: crear, editar, duplicar, eliminar (a papelera).
4. Drag & drop persistente.
5. Estados con colores exactos aplicados al texto.
6. Migración `important_dates` + `holidays-sync.yml` con fuente y año registrados; diferenciación visual de efemérides.
7. Resumen y Publicados con datos reales.

**Criterio de aceptación:** una publicación creada o movida persiste al recargar; los filtros funcionan; los feriados muestran su fuente.

### Fase 3 — Tareas y banco de ideas

1. Migración `ideas` + CRUD + conversión de idea en publicación.
2. Migración `tasks` con RLS de privacidad y rol manager.
3. UI de tareas con checkbox; vista de Lorena con responsable visible y asignación.
4. Tests SQL de RLS: Damiano no puede leer/editar/completar/borrar tareas de Erika; Lorena sí; un miembro no puede crear tareas para otro.

**Criterio de aceptación:** todos los casos de permisos pasan, incluso llamando a la API de Supabase directamente sin la UI.

### Fase 4 — Multimedia con Cloudflare R2

1. Buckets R2 por entorno con CORS restringido.
2. Migración `post_media`.
3. Pages Functions: `upload-url`, `confirm` (magic bytes + tamaño), `GET /api/media/:id`, `delete`.
4. Miniaturas generadas en el navegador (imagen y frame de video).
5. Previews en la publicación: miniaturas, carrusel para varias imágenes, preview vertical para reels, vista ampliada y descarga.
6. Límites configurables desde `app_settings`.
7. Tests: acceso sin JWT rechazado, archivo con extensión falsa rechazado, URL vencida rechazada.

**Criterio de aceptación:** se suben, previsualizan, descargan y eliminan imágenes y videos; sin sesión no se accede a ningún archivo.

### Fase 5 — Sincronización en tiempo real y conflictos

1. Suscripciones de Supabase Realtime por módulo.
2. Recarga del rango visible al reconectar.
3. Control optimista de concurrencia con `version`.
4. Aviso de conflicto con opción recargar/reintentar.
5. Indicador de estado de conexión y guardado.
6. Prueba con dos navegadores y dos usuarios distintos; verificar que un miembro no recibe eventos de tareas ajenas.

**Criterio de aceptación:** los cambios de un usuario aparecen en la pantalla de otro sin recargar; dos ediciones simultáneas no se pisan en silencio.

### Fase 6 — Alertas y menciones en portales

1. Migraciones `notifications` y `notification_dismissals` con clave de deduplicación.
2. Generación diaria con `pg_cron`: publicaciones próximas (“Falta 1 día para…”), materiales faltantes y revisiones pendientes.
3. UI de alertas en la plataforma/calendario con botón visible para descartar; distinguir activas, descartadas y resueltas.
4. Evaluar fuentes de noticias (cobertura, términos de uso, límites) y documentar la elegida.
5. `news-monitor.yml`: búsqueda de “UAA”, “Unión Agrícola de Avellaneda” y variantes sin acento, deduplicación por URL, alerta con enlace a la nota original.

**Criterio de aceptación:** las alertas descartadas no reaparecen en otra sesión; una mención real detectada genera una alerta con enlace. Si no hay fuente activa, la UI no simula la función.

### Fase 7 — Gestión de espacio y limpieza

1. Columnas `deleted_at` en todas las tablas editables (si no se agregaron antes) y módulo **Papelera**: restaurar / eliminar definitivamente.
2. Cola `storage_deletions` + procesador con reintentos.
3. Función `storage_usage()` y monitor de uso para Lorena (base y R2 respecto de los límites).
4. Alertas automáticas al 70 % y 90 % de cada límite.
5. Funciones `cleanup_preview` / `cleanup_execute` con los filtros de la sección 5.13, incluida la opción “solo multimedia”.
6. Pantalla de **Limpieza** con dry-run, exportación JSON/CSV, confirmación escrita y registro en `audit_logs`.
7. Purga automática de papelera y datos efímeros (`pg_cron`) y barrido semanal de huérfanos en R2.
8. Tests: un miembro no puede ejecutar la limpieza masiva; el dry-run no borra nada; tras ejecutar, los objetos de R2 se eliminan y no quedan huérfanos.

**Criterio de aceptación:** Lorena puede ver el uso de espacio, liberar espacio de forma individual o masiva con vista previa, y los totales de base y R2 coinciden con lo real.

### Fase 8 — PWA y calidad

1. Manifest + service worker que cachea solo assets estáticos (nunca respuestas de Supabase ni media privada).
2. Pruebas responsive reales (celular, tablet, desktop) contra las capturas de V15.
3. Revisión de seguridad completa (sección 7) y pruebas negativas.
4. Revisión de consumo frente a los límites gratuitos (sección 6.4).

### Fase 9 — Producción

1. Migrar el esquema a Supabase producción y crear los usuarios reales.
2. Configurar `planner.uaa.com.ar` como dominio propio en Cloudflare Pages (CNAME en la zona DNS de `uaa.com.ar`).
3. Verificar que los backups de producción corren y se pueden restaurar.
4. Documentar despliegue, rollback (redeploy de un build anterior en Pages + restauración de backup) y operación (`docs/operacion.md`).
5. Habilitar al equipo.

---

## 10. Criterios generales de aceptación

La aplicación no se considera lista para el equipo hasta que se cumpla todo lo siguiente:

- [ ] Conserva visualmente la V15 aprobada en desktop.
- [ ] Conserva visualmente la V15 aprobada en móvil, con layout centrado.
- [ ] Mantiene logo, título y barra lateral exactos.
- [ ] Mantiene los cuatro nombres y colores de cuentas.
- [ ] Mantiene colores de estado aplicados solo al texto.
- [ ] Login real para los cinco usuarios.
- [ ] Ningún usuario puede suplantar a otro.
- [ ] Calendario compartido y persistente.
- [ ] Filtros por cuenta y vista de todas las cuentas.
- [ ] Drag & drop persistente.
- [ ] Efemérides/feriados de Argentina.
- [ ] CRUD de publicaciones.
- [ ] Banco de ideas compartido.
- [ ] Tareas privadas por miembro.
- [ ] Lorena puede ver y asignar tareas a todos.
- [ ] Multimedia con preview, carrusel/reel, descarga y permisos.
- [ ] Alertas cancelables y persistentes.
- [ ] Menciones en portales con fuente real integrada.
- [ ] Actualización automática entre usuarios.
- [ ] Manejo de conflictos de edición.
- [ ] HTTPS, backups, logs y seguridad revisados.
- [ ] Pruebas de autorización y de archivos completadas.
- [ ] No depende de WordPress ni de sus plugins/tema.
- [ ] Keepalive de Supabase funcionando en staging y producción.
- [ ] Backup diario cifrado funcionando y restauración probada.
- [ ] Papelera, limpieza individual y masiva con vista previa y auditoría.
- [ ] Monitor de uso de base y R2 con alertas al 70 % / 90 %.
- [ ] Operación completa dentro de los planes gratuitos.

---

## 11. Instrucciones para Claude Code

Antes de modificar código:

1. Leer este archivo completo.
2. Inspeccionar el repositorio y los assets existentes.
3. Identificar cuál es el archivo fuente auténtico de V15.
4. No inventar ni reemplazar el diseño si no se encuentra un asset.
5. No afirmar que una función está implementada sin comprobarla en el código.
6. Separar claramente lo implementado, lo parcial y lo pendiente.
7. Proponer un plan pequeño antes de cambios amplios.
8. Mantener cambios incrementales y probar después de cada etapa.
9. Crear migraciones versionadas; evitar cambios de esquema manuales sin registrar.
10. No modificar WordPress ni archivos del sitio institucional.
11. No introducir secretos ni datos reales de usuarios en el repositorio.
12. No usar datos reales de publicaciones mientras el entorno no esté asegurado.
13. No cambiar el diseño aprobado por iniciativa propia.
14. Si una decisión depende de un límite o capacidad de un proveedor (Cloudflare, Supabase, GitHub), verificarla en la documentación vigente antes de cerrarla.
15. Documentar cada nueva funcionalidad y sus pruebas.
16. Toda tabla nueva lleva RLS y tests de permisos en la misma migración/PR.
17. No elegir soluciones que requieran planes pagos sin consultar primero.

### Primer prompt recomendado para Claude Code

```text
Leé PROJECT_CONTEXT.md completo antes de hacer cambios.

Estamos desarrollando UAA Planner como una aplicación independiente para
planner.uaa.com.ar, preservando exactamente el diseño y las funcionalidades
aprobadas en UAA Planner V15.

Primero inspeccioná todo el repositorio, identificá el HTML/CSS/JS y assets
originales de V15, y revisá el prototipo PHP/MySQL si está presente.

No empieces rediseñando ni reescribiendo todo. Entregá primero:
1. Inventario de archivos y tecnologías.
2. Mapa de pantallas y funcionalidades V15.
3. Qué está implementado, qué está simulado y qué falta.
4. Problemas de seguridad y arquitectura encontrados.
5. Plan incremental para convertirlo en una aplicación multiusuario real
   compatible con el hosting cPanel.

No asumas que el prototipo 0.2 está listo para producción. No publiques,
no despliegues y no modifiques WordPress. No inventes credenciales.
```

---

## 12. Datos que todavía faltan confirmar

- Acceso a la zona DNS de `uaa.com.ar` para crear el `CNAME` de `planner` (¿lo gestiona cPanel o un tercero?).
- Cuentas creadas: GitHub, Cloudflare (Pages + R2 activado) y Supabase (2 proyectos).
- Región del proyecto Supabase (sugerido: São Paulo, `sa-east-1`, por latencia).
- Dominio del email interno para Supabase Auth (por ejemplo `@planner.uaa.com.ar`).
- Límites finales de tamaño de imágenes y videos, y días de retención de la papelera.
- Fuente de noticias elegida para el monitoreo de menciones.
- Fuente de feriados/efemérides elegida.

**Resuelto en Fase 0 (Nov 2026):**
- Framework: **TypeScript sin framework + Vite** (ver `docs/v15-inventario.md`).
- V15 original y logos incorporados al repo (`reference/v15/`, `public/assets/img/`).
- Color de Super UAA: `#C62828`.

No incluir aquí nombres de usuario del hosting, contraseñas, credenciales MySQL, tokens, claves API ni datos personales sensibles.

---

## 13. Archivos de referencia que deben agregarse al repositorio

Para que Claude Code pueda reconstruir fielmente la V15, incluir en el repositorio (siempre que se tengan los archivos originales):

- HTML original de UAA Planner V15.
- CSS original.
- JavaScript original.
- Logo UAA utilizado en la barra lateral.
- Otros iconos, fuentes e imágenes propias de la interfaz.
- ZIP piloto PHP/MySQL 0.2, si se decide conservarlo como referencia histórica.
- Capturas de pantalla de las pantallas aprobadas (desktop y móvil).

No asumir que el archivo ZIP piloto contiene todos los recursos originales ni que es la fuente definitiva del diseño.

---

**Fin del documento.**
