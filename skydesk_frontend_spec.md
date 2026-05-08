# SkyDesk — Especificación Visual y Arquitectura Frontend
> Documento de contexto para la IA que construirá el frontend.
> Basarse en TODA esta especificación sin omitir ningún detalle.

---

## 1. IDENTIDAD DE MARCA

**Nombre del sistema:** SkyDesk
**Tagline:** *"Tu vuelo, a un clic de distancia."*
**Framework:** React + Vite
**Estilos:** CSS puro con variables CSS (no Tailwind)
**Iconos:** Lucide React

---

## 2. PALETA DE COLORES

```css
:root {
  /* Principales */
  --color-primary:        #1B3A6B; /* Midnight Blue — navbar, botones CTA, headers */
  --color-primary-hover:  #162F58; /* hover del primario */
  --color-primary-light:  #EFF6FF; /* fondos de botón secondary */
  --color-secondary:      #38BDF8; /* Sky Cyan — highlights, links activos, íconos */
  --color-accent:         #F59E0B; /* Sunrise Amber — pricing, badges especiales */

  /* Semánticos */
  --color-success:        #10B981; /* Emerald — reserva confirmada, vuelo disponible */
  --color-success-light:  #F0FDF4;
  --color-error:          #EF4444; /* Rose Red — cancelaciones, errores */
  --color-error-light:    #FEF2F2;
  --color-warning:        #F59E0B; /* Amber — vuelo demorado, warnings */
  --color-warning-light:  #FFFBEB;
  --color-info:           #3B82F6; /* Cerulean — tooltips, info */
  --color-info-light:     #EFF6FF;

  /* Neutros */
  --color-bg:             #F8FAFC; /* Off White — fondo de páginas */
  --color-surface:        #FFFFFF; /* Cards, modales, formularios */
  --color-text-primary:   #0F172A; /* Slate 900 — títulos, texto principal */
  --color-text-secondary: #64748B; /* Slate 500 — subtítulos, labels */
  --color-text-disabled:  #94A3B8;
  --color-border:         #E2E8F0; /* Slate 200 — borders */
  --color-border-hover:   #CBD5E1;
  --color-row-hover:      #F8FAFC;

  /* Sombras */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg:  0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04);
  --shadow-modal: 0 20px 40px rgba(0,0,0,0.15);

  /* Border radius */
  --radius-sm:  6px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-full: 999px;

  /* Transiciones */
  --transition-fast:   150ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   300ms ease;
}
```

---

## 3. TIPOGRAFÍA

**Fuente principal:** `Inter` (Google Fonts) — pesos: 400, 500, 600, 700
**Fuente de display:** `Plus Jakarta Sans` — pesos: 700, 800 (títulos grandes y nombre del sistema)

```css
/* Importar en index.html o globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
```

| Token | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| h1 | 36px / 2.25rem | 800, Plus Jakarta Sans | Título principal de página |
| h2 | 28px / 1.75rem | 700 | Sección principal |
| h3 | 22px / 1.375rem | 600 | Título de card / sub-sección |
| h4 | 18px / 1.125rem | 600 | Título de formulario |
| body | 15px / 0.9375rem | 400 | Texto general |
| small | 13px / 0.8125rem | 400 | Texto de apoyo, hints |
| caption | 11px / 0.6875rem | 500 | Labels de badges, timestamps |
| label | 13px / 0.8125rem | 500 | Labels de inputs, columnas de tabla |

---

## 4. ICONOGRAFÍA

**Librería:** `lucide-react`
**Instalación:** `npm install lucide-react`

| Contexto | Tamaño | strokeWidth |
|----------|--------|-------------|
| Inline en texto | 16px | 1.5 |
| Botones | 20px | 1.5 |
| Nav items | 24px | 1.5 |
| Feature icons / empty states | 32-48px | 1.5 |

Íconos clave del sistema:
- `Plane` — vuelos, logo
- `MapPin` — origen/destino
- `Calendar` — fechas
- `Clock` — horarios, delayed
- `Users` — asientos
- `CheckCircle` — confirmado, completado
- `XCircle` — cancelado
- `AlertCircle` — warning, pending
- `Edit` — editar vuelo
- `Trash2` — cancelar
- `LogOut` — logout
- `LayoutDashboard` — dashboard
- `BookOpen` — reservas
- `Plus` — crear nuevo
- `Search` — búsqueda
- `Filter` — filtros
- `ChevronRight`, `ChevronLeft` — paginación
- `Lock` — unauthorized

---

## 5. ESTILO VISUAL GENERAL

**Mood:** Professional Clean — minimalista, moderno, confiable. Inspirado en aerolíneas premium (Finnair, KLM) + SaaS como Linear y Notion.

**Principios:**
- Espaciado generoso: padding de cards `24px`, gaps entre secciones `32-48px`
- Sombras de una sola capa, sutiles — nunca dramáticas
- Jerarquía por color y peso tipográfico, no por bordes decorativos
- Fondos alternados entre `#F8FAFC` y `#FFFFFF` para separación visual
- Sin modo oscuro (versión académica)
- Transiciones funcionales: `200ms ease` para hovers, `300ms ease` para modales
- Cero animaciones decorativas — solo feedback inmediato

---

## 6. COMPONENTES BASE

### Botones

```
Primary:   bg #1B3A6B | text white   | hover #162F58 + shadow suave
Secondary: bg #EFF6FF  | text #1B3A6B | border 1px #BFDBFE | hover #DBEAFE
Ghost:     bg transparent | text #1B3A6B  | hover #F1F5F9 bg
Danger:    bg #FEF2F2   | text #EF4444  | border 1px #FECACA | hover bg #EF4444 + text white
Disabled:  bg #F1F5F9   | text #94A3B8  | cursor not-allowed

border-radius: 8px | padding: 10px 20px | font-weight: 500 | font-size: 14px
Loading state: spinner inline izquierdo + texto "Procesando..."
```

### Inputs

```
Base:     bg white | border 1.5px #E2E8F0 | radius 8px | padding 10px 14px
Focus:    border 1.5px #38BDF8 | box-shadow 0 0 0 3px rgba(56,189,248,0.15)
Error:    border #EF4444 | mensaje rojo debajo (12px)
Disabled: bg #F8FAFC | text #94A3B8
Label:    encima del input | 13px | font-weight 500 | color #374151
Helper:   texto debajo en gris | error text en rojo — nunca ambos simultáneos
```

### Cards

```
bg white | border 1px #E2E8F0 | border-radius 12px
shadow: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)
padding interno: 24px
Hover (clickeables): shadow más pronunciada + translateY(-1px) en 200ms
```

### Badges de Estado

| Estado | Fondo | Texto | Ícono Lucide |
|--------|-------|-------|--------------|
| `scheduled` | `#EFF6FF` | `#1D4ED8` | `Circle` |
| `delayed` | `#FFFBEB` | `#92400E` | `Clock` |
| `cancelled` | `#FEF2F2` | `#991B1B` | `XCircle` |
| `completed` | `#F1F5F9` | `#475569` | `CheckCircle` |
| `pending` | `#FFFBEB` | `#92400E` | `Clock` |
| `confirmed` | `#F0FDF4` | `#166534` | `CheckCircle` |

```
border-radius: 999px | padding: 3px 10px | font-size: 12px | font-weight: 500
Incluye ícono 14px a la izquierda del texto
```

### Navbar

```
bg #1B3A6B | height 64px | sticky top-0 | z-index alto

No autenticado:
  Izq: Logo (Plane icon blanco) + "SkyDesk" (Plus Jakarta Sans, blanco)
  Der: botón "Iniciar sesión" (ghost blanco) + botón "Registrarse" (secondary)

CLIENT:
  Izq: Logo + "SkyDesk"
  Centro: links "Inicio" | "Vuelos" | "Mis Reservas" (texto blanco, hover con underline)
  Der: nombre usuario | badge "Cliente" (azul claro) | botón Logout (LogOut icon)

ADMIN:
  Izq: Logo + "SkyDesk"
  Centro: links "Dashboard" | "Vuelos" | "Reservas"
  Der: nombre usuario | badge "Admin" (ámbar) | botón Logout
```

### Modales / ConfirmModal

```
Overlay: rgba(15,23,42,0.5) + backdrop-filter blur(4px)
Card: bg white | border-radius 16px | padding 32px | max-width 480px | centrado
Animación entrada: scale(0.95)→scale(1) + opacity 0→1 en 200ms
Header: título (h4) + botón X (ghost, esquina derecha)
Body: mensaje descriptivo
Footer: botón "Cancelar" (ghost) + botón de acción (primary o danger)
```

### Tablas (Admin)

```
Header: bg #F8FAFC | text #64748B | 12px | font-weight 600 | UPPERCASE | padding 12px 16px
Filas: bg white | hover #F8FAFC | border-bottom 1px #F1F5F9 | padding 12px 16px
Sin borders verticales entre columnas
Columna de acciones al final: íconos con tooltip (Edit icon, XCircle icon)
```

---

## 7. ARQUITECTURA DE PÁGINAS

### /login
- **Acceso:** Público (redirige si ya autenticado)
- **Layout:** Centrado vertical y horizontal, sin navbar
- **Componentes:** Logo grande arriba, card de formulario (max-width 400px), link "¿No tienes cuenta? Regístrate"
- **API:** `POST /api/auth/login`
- **Redirección éxito:** admin → `/admin/dashboard` | client → `/dashboard`
- **Validaciones:** Email formato válido, password no vacío, error genérico en 401

### /register
- **Acceso:** Público (redirige si ya autenticado)
- **Layout:** Centrado, sin navbar
- **Componentes:** Card de formulario (max-width 440px), barra de fortaleza de contraseña, link a login
- **API:** `POST /api/auth/register`
- **Redirección éxito:** → `/login` con toast "Cuenta creada, ahora inicia sesión"
- **Validaciones:** name 2-100, email válido, password min 8 + mayúscula + número, confirmación coincide

### /dashboard
- **Acceso:** Solo CLIENT
- **Componentes:**
  - Header: "Bienvenido, [nombre] 👋"
  - Sección "Mis últimas reservas": máx 3 ReservationCards, link "Ver todas"
  - Sección "Vuelos disponibles": máx 4 FlightCards, botón "Ver todos los vuelos"
- **API:** `GET /api/reservations` + `GET /api/flights`
- **Empty states:** si no hay reservas → "Aún no tienes reservas. ¡Busca un vuelo!" con botón a /flights

### /flights
- **Acceso:** Público
- **Componentes:**
  - Barra de búsqueda: inputs de Origen + Destino + fecha (filtra localmente)
  - Filtros: precio min/max (slider o inputs), ordenar por precio/fecha
  - Grid de FlightCards (2 cols desktop, 1 col mobile)
  - Paginación: 10 por página
  - Empty state si no hay resultados
- **API:** `GET /api/flights`
- **Sin navbar de búsqueda externa — todo el filtrado es en el frontend sobre los datos ya cargados**

### /flights/:id
- **Acceso:** Público (reserva requiere auth)
- **Componentes:**
  - Card grande: número de vuelo, StatusBadge, ruta `Origen ✈ Destino`, fechas, duración, precio por asiento
  - Sección de reserva:
    - Selector numérico de asientos (1-9, max: available_seats)
    - Precio total calculado en tiempo real
    - Botón "Reservar" (disabled si no autenticado o vuelo sin asientos)
  - ConfirmModal con resumen completo
- **API:** `GET /api/flights/:id`, `POST /api/reservations`
- **Si no autenticado:** botón muestra "Inicia sesión para reservar" → redirect a /login?redirect=/flights/:id
- **Post-login redirect:** volver a /flights/:id automáticamente

### /reservations
- **Acceso:** Solo CLIENT
- **Componentes:**
  - Header "Mis Reservas" + contador total
  - Lista de ReservationCards ordenadas por fecha desc
  - Botón "Cancelar" por card (visible si status ≠ 'cancelled' Y departure > now)
  - ConfirmModal antes de cancelar
- **API:** `GET /api/reservations`, `PUT /api/reservations/:id/cancel`
- **Empty state:** "No tienes reservas aún" + botón a /flights

### /admin/dashboard
- **Acceso:** Solo ADMIN
- **Componentes:**
  - 4 Metric Cards: "Vuelos activos", "Total reservas", "Reservas confirmadas", "Ingresos totales ($)"
  - Tabla "Últimos 5 vuelos" con columnas: número, ruta, estado, ocupación %
  - Tabla "Últimas 5 reservas" con columnas: cliente, vuelo, asientos, estado
- **API:** `GET /api/flights`, `GET /api/reservations/all`

### /admin/flights
- **Acceso:** Solo ADMIN
- **Componentes:**
  - Header + botón "+ Nuevo Vuelo" (primary, top-right)
  - Tabla con: Número | Ruta | Salida | Precio | Asientos | Ocupación | Estado | Acciones
  - Filtro por status (select)
  - Paginación 10 por página
  - Acciones inline: Edit icon → /admin/flights/:id/edit | XCircle → ConfirmModal cancelar
- **API:** `GET /api/flights`, `DELETE /api/flights/:id`

### /admin/flights/new
- **Acceso:** Solo ADMIN
- **Componentes:** FlightForm vacío, botón "Guardar" + "Cancelar" (→ /admin/flights)
- **API:** `POST /api/flights`
- **Redirect éxito:** /admin/flights + toast "Vuelo creado exitosamente"

### /admin/flights/:id/edit
- **Acceso:** Solo ADMIN
- **Componentes:** FlightForm pre-llenado, StatusBadge actual, botón danger "Cancelar Vuelo" separado del form
- **API:** `GET /api/flights/:id`, `PUT /api/flights/:id`, `DELETE /api/flights/:id`
- **Redirect éxito:** /admin/flights + toast correspondiente

### /admin/reservations
- **Acceso:** Solo ADMIN
- **Componentes:**
  - Tabla: ID | Cliente | Vuelo | Asientos | Total | Estado | Fecha
  - Filtros: select por status + input search por número de vuelo
  - Paginación
  - Botón cancelar por fila con ConfirmModal
- **API:** `GET /api/reservations/all`, `PUT /api/reservations/:id/cancel`

### /unauthorized
- **Componentes:** Ícono Lock grande (64px, color primario), título "Sin acceso", descripción, botón "Volver al inicio"
- **Sin navbar**

### /404
- **Componentes:** Ícono Plane grande con trayectoria interrumpida, "404", "Esta página no existe", botón "Volver al inicio"
- **Sin navbar**

---

## 8. COMPONENTES REUTILIZABLES

### `<Navbar />`
Detecta el estado de autenticación del `AuthContext`. Renderiza variante según rol (ver sección Navbar arriba). Links con `NavLink` de React Router (clase activa con underline blanco).

### `<ProtectedRoute role="client|admin" />`
- Lee `AuthContext.user` y `AuthContext.isLoading`
- Si `isLoading` → muestra `<LoadingSpinner fullPage />`
- Si no autenticado → redirect a `/login`
- Si autenticado pero rol incorrecto → redirect a `/unauthorized`

### `<FlightCard flight={} />`
```
┌─────────────────────────────────┐
│ AV101                [scheduled]│
│ San José ✈ Ciudad de México     │
│ Salida: 15 May, 08:30           │
│ Llegada: 15 May, 11:30 (3h)     │
│ $185.00          150 asientos   │
│ [        Ver vuelo        ]     │
└─────────────────────────────────┘
```
Props: `flight` objeto completo. Botón navega a `/flights/:id`.

### `<ReservationCard reservation={} onCancel={} />`
```
┌─────────────────────────────────┐
│ Vuelo AV101          [confirmed]│
│ San José → Ciudad de México     │
│ 15 May 2025, 08:30              │
│ 2 asientos          $370.00     │
│ Reservado: 10 May 2025          │
│                  [Cancelar]     │
└─────────────────────────────────┘
```

### `<StatusBadge status="scheduled|delayed|cancelled|completed|pending|confirmed" />`
Mapeo de status → colores + ícono Lucide según tabla de la sección 6.

### `<LoadingSpinner variant="fullPage|section|inline" />`
- `fullPage`: ocupa toda la pantalla, centrado
- `section`: centrado en su contenedor, min-height 200px
- `inline`: 16px, dentro de botón

### `<ErrorState message="" onRetry={} />`
Ícono AlertCircle + mensaje + botón "Intentar de nuevo".

### `<ConfirmModal title="" message="" confirmLabel="" confirmVariant="danger|primary" onConfirm={} onClose={} isLoading={} />`
Siempre presente en el DOM, controlado por estado. Loading state en botón de confirmar mientras se procesa.

### `<Toast />`
Notificaciones top-right, auto-dismiss 3 segundos. Variantes: success (verde), error (rojo), info (azul). Stack de múltiples toasts.

### `<SkeletonCard />` / `<SkeletonTable />`
Placeholders animados (shimmer effect) mientras cargan datos. Usar en lugar de spinners en listas y tablas.

### `<FlightForm flight={null|objeto} onSubmit={} isLoading={} />`
Formulario reutilizable para crear Y editar vuelos. Si recibe `flight` → modo edición pre-llenado.

---

## 9. FLUJOS DE USUARIO

**Flujo 1 — Cliente reserva un vuelo:**
```
/flights → click FlightCard → /flights/:id
→ seleccionar asientos (precio actualiza en tiempo real)
→ click "Reservar" → ConfirmModal resumen
→ POST /api/reservations [loading]
→ Éxito: toast "¡Reserva creada!" + redirect /reservations
→ Error SP: toast rojo con mensaje exacto del SP
```

**Flujo 2 — Admin crea vuelo:**
```
/admin/flights → click "+ Nuevo Vuelo" → /admin/flights/new
→ llenar form (validación live)
→ errores visibles → botón bloqueado
→ todo válido → click "Guardar" [loading]
→ POST /api/flights
→ Éxito: toast "Vuelo AV101 creado" + redirect /admin/flights
→ Error (duplicado): toast rojo "El número de vuelo ya existe"
```

**Flujo 3 — Cliente cancela reserva:**
```
/reservations → click "Cancelar" en ReservationCard
→ ConfirmModal: "¿Cancelar reserva en vuelo AV101?"
→ click "Sí, cancelar" [loading en botón modal]
→ PUT /api/reservations/:id/cancel
→ Éxito: badge actualiza a "cancelled" + toast "Reserva cancelada"
→ Error: toast rojo con mensaje del SP
```

**Flujo 4 — No autenticado intenta reservar:**
```
/flights/:id → click "Reservar"
→ NO hace request
→ toast/banner: "Inicia sesión para reservar"
→ redirect /login?redirect=/flights/:id
→ login exitoso → redirect de vuelta a /flights/:id
→ usuario completa reserva normalmente
```

---

## 10. VALIDACIONES FRONTEND DETALLADAS

### Login
| Campo | Regla | Mensaje |
|-------|-------|---------|
| email | formato RFC 5322 | "Ingresa un email válido" |
| email | no vacío | "El email es requerido" |
| password | no vacío | "La contraseña es requerida" |
| (respuesta 401) | — | "Credenciales incorrectas" |

### Registro
| Campo | Regla | Mensaje |
|-------|-------|---------|
| name | no vacío | "El nombre es requerido" |
| name | 2-100 chars | "Mínimo 2 caracteres" / "Máximo 100 caracteres" |
| email | formato válido | "Ingresa un email válido" |
| password | min 8 chars | "Mínimo 8 caracteres" |
| password | 1 mayúscula | "Debe contener una mayúscula" |
| password | 1 número | "Debe contener un número" |
| confirmPassword | igual a password | "Las contraseñas no coinciden" |

Barra de fortaleza: `Débil` (roja) → `Media` (ámbar) → `Fuerte` (verde) — calculada por longitud + variedad.

### Reserva
| Campo | Regla | Mensaje |
|-------|-------|---------|
| seatsReserved | 1-9 | "Entre 1 y 9 asientos" |
| seatsReserved | ≤ available_seats | "Solo hay X asientos disponibles" |
| seatsReserved | entero positivo | "Ingresa un número válido" |

Precio total = `precio_vuelo × asientos` actualizado en tiempo real.

### Crear/Editar Vuelo
| Campo | Regla | Mensaje |
|-------|-------|---------|
| flightNumber | no vacío, max 10, sin espacios, alfanumérico | "Solo letras y números, máximo 10 caracteres" |
| origin | no vacío, min 2 | "El origen es requerido" |
| destination | no vacío, min 2, ≠ origin | "El destino debe ser distinto al origen" |
| departureDatetime | fecha futura | "La fecha de salida debe ser futura" |
| arrivalDatetime | posterior a departure | "La llegada debe ser posterior a la salida" |
| price | float > 0, max 2 decimales | "Ingresa un precio válido mayor a 0" |
| totalSeats | entero 1-500 | "Entre 1 y 500 asientos" |

Comportamiento: validar `onChange` + `onBlur`, limpiar error al corregir, botón submit disabled si hay cualquier error visible.

---

## 11. ESTRUCTURA DE CARPETAS

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── client.js              ← fetch wrapper + manejo global errores
│   │   ├── auth.api.js
│   │   ├── flights.api.js
│   │   └── reservations.api.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── SkeletonCard.jsx
│   │   │   └── SkeletonTable.jsx
│   │   ├── flights/
│   │   │   ├── FlightCard.jsx
│   │   │   └── FlightForm.jsx
│   │   └── reservations/
│   │       └── ReservationCard.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useToast.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── client/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── FlightsPage.jsx
│   │   │   ├── FlightDetailPage.jsx
│   │   │   └── ReservationsPage.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── AdminFlightsPage.jsx
│   │   │   ├── AdminFlightFormPage.jsx
│   │   │   └── AdminReservationsPage.jsx
│   │   ├── UnauthorizedPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── router/
│   │   ├── AppRouter.jsx
│   │   └── ProtectedRoute.jsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   ├── utils/
│   │   ├── formatters.js          ← fechas, precios, duración de vuelo
│   │   └── validators.js          ← funciones de validación reutilizables
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## 12. ESTADO DE AUTENTICACIÓN (AuthContext)

```jsx
// Provee:
{
  user: { id, name, email, role } | null,
  isAuthenticated: boolean,
  isLoading: boolean,     // true mientras verifica cookie en /api/auth/me
  login: async (credentials) => void,
  logout: async () => void,
}

// Al montar la app: llamar GET /api/auth/me automáticamente
// Si responde con usuario → setUser(data)
// Si 401 → setUser(null)
// isLoading: true hasta que resuelva
```

---

## 13. SERVICIO API CENTRALIZADO

```js
// src/api/client.js
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request(method, endpoint, body = null) {
  const options = {
    method,
    credentials: 'include',        // ← CRÍTICO: envía cookies httpOnly
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API_BASE + endpoint, options);
  const data = await res.json();

  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));  // el contexto escucha esto
    throw data;
  }
  if (res.status === 403) {
    window.location.href = '/unauthorized';
    throw data;
  }
  if (res.status >= 500) {
    // toast global de error de servidor
    window.dispatchEvent(new CustomEvent('toast:error', { detail: 'Error del servidor' }));
    throw data;
  }
  if (!res.ok) throw data;
  return data;
}

export const api = {
  get:    (endpoint)        => request('GET',    endpoint),
  post:   (endpoint, body)  => request('POST',   endpoint, body),
  put:    (endpoint, body)  => request('PUT',    endpoint, body),
  delete: (endpoint)        => request('DELETE', endpoint),
};
```

---

## 14. DEPENDENCIAS NPM

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "vite": "^5",
    "@vitejs/plugin-react": "^4"
  }
}
```

**Sin otras dependencias externas.** CSS puro con variables, fetch nativo, React Router para routing. Sin Redux, sin Axios, sin librerías de UI externas.