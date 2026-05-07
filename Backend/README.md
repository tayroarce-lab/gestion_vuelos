# 🛫 API — Sistema de Gestión de Vuelos Aéreos

Backend REST para gestión de usuarios, vuelos y reservas. Construido con **Node.js + Express + Sequelize + MySQL**.

---

## 📋 Prerequisitos

- Node.js 18+
- MySQL 8.0+
- Base de datos `vuelos_db` ya creada con sus vistas, stored procedures y triggers

---

## ⚙️ Instalación

```bash
# 1. Entrar a la carpeta del backend
cd Backend

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env a partir del ejemplo
copy .env.example .env
```

---

## 🔧 Configuración del `.env`

Edita el archivo `.env` con tus valores reales:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=vuelos_db
DB_USER=root
DB_PASS=tu_password_mysql

# Mínimo 64 caracteres. Genera uno con:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=tu_secret_aqui

COOKIE_MAX_AGE=86400000
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Correr en Desarrollo

```bash
npm run dev
```

El servidor se levantará en `http://localhost:3000`.

---

## 🌱 Ejecutar el Seed (solo desarrollo)

> ⚠️ **ADVERTENCIA**: El seed usa `force: true` y **borra todas las tablas** antes de recrearlas.
> Úsalo solo en un ambiente limpio de desarrollo.

```bash
npm run seed
```

Crea los siguientes usuarios de prueba:

| Rol    | Email                  | Contraseña   |
|--------|------------------------|--------------|
| Admin  | admin@vuelos.com       | Admin123!    |
| Client | juan@cliente.com       | Client123!   |
| Client | maria@cliente.com      | Maria456!    |

---

## 📡 Endpoints de la API

### AUTH

| Método | Ruta                    | Rol         | Descripción                      |
|--------|-------------------------|-------------|----------------------------------|
| POST   | `/api/auth/register`   | Público     | Registrar nuevo cliente          |
| POST   | `/api/auth/login`      | Público     | Login — emite JWT en cookie      |
| POST   | `/api/auth/logout`     | Autenticado | Cierra sesión (limpia cookie)    |
| GET    | `/api/auth/me`         | Autenticado | Perfil del usuario actual        |

### FLIGHTS

| Método | Ruta                    | Rol    | Descripción                      |
|--------|-------------------------|--------|----------------------------------|
| GET    | `/api/flights`          | Público| Vuelos disponibles (vista DB)    |
| GET    | `/api/flights/:id`      | Público| Detalle de un vuelo              |
| POST   | `/api/flights`          | Admin  | Crear vuelo                      |
| PUT    | `/api/flights/:id`      | Admin  | Actualizar vuelo                 |
| DELETE | `/api/flights/:id`      | Admin  | Cancelar vuelo (soft delete)     |

### RESERVATIONS

| Método | Ruta                           | Rol          | Descripción                    |
|--------|--------------------------------|--------------|--------------------------------|
| GET    | `/api/reservations`            | Client       | Mis reservas                   |
| GET    | `/api/reservations/all`        | Admin        | Todas las reservas             |
| POST   | `/api/reservations`            | Client       | Crear reserva                  |
| PUT    | `/api/reservations/:id/cancel` | Client/Admin | Cancelar reserva               |

---

## 🧪 Ejemplos JSON para Postman

### Registrar usuario
```json
POST /api/auth/register
{
  "name": "Ana López",
  "email": "ana@ejemplo.com",
  "password": "Password1"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "admin@vuelos.com",
  "password": "Admin123!"
}
```

### Crear vuelo (Admin)
```json
POST /api/flights
{
  "flightNumber": "VL010",
  "origin": "Guatemala City",
  "destination": "Cancún",
  "departureDatetime": "2026-06-01T08:00:00.000Z",
  "arrivalDatetime": "2026-06-01T10:30:00.000Z",
  "price": 299.99,
  "totalSeats": 150
}
```

### Crear reserva (Client)
```json
POST /api/reservations
{
  "flightId": 1,
  "seatsReserved": 2
}
```

### Cancelar reserva
```json
PUT /api/reservations/1/cancel
(no body requerido)
```

---

## 🔒 Seguridad

- JWT almacenado en **httpOnly cookie** (inaccesible desde JavaScript del browser)
- `sameSite: 'strict'` para prevenir CSRF
- `bcrypt` con saltRounds 12 para contraseñas
- Protección contra **timing attacks** en login
- Rate limiting: 5 intentos de login / 15min, 3 registros / hora
- `helmet()` con headers de seguridad HTTP completos
- CORS restringido al `FRONTEND_URL` configurado

---

## 📁 Estructura del Proyecto

```
Backend/
├── config/          # Configuración de DB y constantes
├── controllers/     # Lógica de negocio por módulo
├── middlewares/     # Auth, roles y validación
├── models/          # Modelos Sequelize con asociaciones
├── routes/          # Definición de rutas y validadores
├── seeders/         # Script de datos iniciales
├── utils/           # Helper de respuestas estándar
├── app.js           # Express app (middlewares + rutas)
└── server.js        # Punto de entrada
```
