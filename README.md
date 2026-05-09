# Sistema de Gestión de Vuelos Aéreos (API + Frontend)

Este proyecto es una práctica completa para el **Curso Back End**, cuyo objetivo es desarrollar un sistema integral orientado a la gestión de vuelos aéreos, reservas y usuarios.

El sistema se compone de dos partes fundamentales que se comunican entre sí:
- **Backend**: Una API RESTful construida con Node.js, Express y **Sequelize** como ORM para la gestión de la base de datos MySQL.
- **Frontend**: Una interfaz gráfica construida con React (Vite) para consumir la API y proveer una experiencia fluida a los administradores y clientes.

---

## Cumplimiento de Requerimientos

El proyecto cumple a cabalidad con todos los requerimientos solicitados en la práctica:
- **API - Sequelize**: Toda la comunicación con la base de datos se realiza a través de modelos de Sequelize.
- **Inicio de Sesión**: Se provee autenticación de usuarios mediante credenciales (email y contraseña con hash mediante bcrypt).
- **Registro de usuarios**: Sistema habilitado para registrar nuevos clientes.
- **Gestión de Vuelos**: Panel y API protegida para la creación, edición y administración de vuelos exclusiva para el rol `admin`.
- **Reserva de Vuelos**: Interfaz y API para la reserva de vuelos y asientos, exclusiva para el rol `client`.
- **Modelos de datos**: Entidades correctamente estructuradas (Users, Flights, Airplanes, Seats, Reservations) con relaciones consistentes.
- **Controladores y Rutas**: Funcionalidad estructurada utilizando el patrón MVC adaptado para API.
- **Integración con Frontend**: Una interfaz gráfica totalmente funcional y enlazada con los endpoints de la API.

---

## Arquitectura y Modelos de Datos

La estructura de datos ha sido modelada utilizando Sequelize, con integridad referencial, validaciones y relaciones estructuradas. A continuación se explica detalladamente cada uno de los modelos implementados:

### 1. Modelo `User`
**Propósito:** Gestionar la información de los usuarios del sistema, abarcando tanto a los clientes registrados como a los administradores.
- **Atributos Principales:**
  - `name`: Nombre completo del usuario.
  - `email`: Correo electrónico (único).
  - `passwordHash`: Contraseña encriptada utilizando `bcryptjs` (el sistema incluye un *hook* para encriptarla automáticamente antes de crear o actualizar).
  - `role`: Define el nivel de acceso al sistema (valores posibles: `admin` o `client`).
  - `isActive`: Estado de la cuenta (activa/inactiva).
- **Relaciones:**
  - `hasMany(Flight)`: Un usuario administrador puede crear múltiples vuelos (asociación a través de `createdBy`).
  - `hasMany(Reservation)`: Un usuario cliente puede tener múltiples reservas realizadas a su nombre.

### 2. Modelo `Flight`
**Propósito:** Almacenar la información referencial y logística de cada vuelo ofrecido en la plataforma.
- **Atributos Principales:**
  - `flightNumber`: Número de identificación del vuelo (Ej: "AV123").
  - `origin` y `destination`: Puntos de partida y llegada (el modelo valida que ambos no sean iguales).
  - `departureDatetime` y `arrivalDatetime`: Fechas y horas exactas. Existe una validación que asegura que la salida sea una fecha futura y la llegada sea posterior a la salida.
  - `price`: Costo base del vuelo por asiento.
  - `totalSeats` y `availableSeats`: Capacidad total y asientos actualmente disponibles.
  - `status`: Estado actual del vuelo (`scheduled`, `delayed`, `cancelled`, `completed`).
- **Relaciones:**
  - `belongsTo(User)`: Identifica qué administrador creó el vuelo.
  - `belongsTo(Airplane)`: Identifica qué avión está asignado para este vuelo en específico.
  - `hasMany(Reservation)`: Un vuelo puede estar asociado a múltiples reservas hechas por diferentes usuarios.

### 3. Modelo `Airplane`
**Propósito:** Representar la aeronave física asignada a un vuelo para estructurar gráficamente la asignación de asientos.
- **Atributos Principales:**
  - `model`: Modelo de la aeronave (Ej: "Boeing 737").
  - `rows`: Cantidad total de filas del avión.
  - `colsPerRow`: Cantidad de asientos o columnas por fila (usado para calcular la capacidad).
- **Relaciones:**
  - `hasMany(Flight)`: Un avión puede estar asignado a distintos vuelos a lo largo del tiempo.
  - `hasMany(Seat)`: Un avión se compone de múltiples asientos específicos.

### 4. Modelo `Seat`
**Propósito:** Representar un asiento individual dentro de un avión en específico, facilitando la reserva explícita de puestos.
- **Atributos Principales:**
  - `rowNumber`: Fila en la que se ubica el asiento.
  - `columnLetter`: Letra del asiento en la fila (Ej: "A", "B", "C").
  - `type`: Categoría del asiento (`economy`, `business`).
- **Relaciones:**
  - `belongsTo(Airplane)`: Un asiento pertenece a un único avión.
  - `belongsToMany(Reservation)`: Relación N:M, un asiento puede estar involucrado en múltiples reservas a lo largo del tiempo (para vuelos distintos), conectado a través de la tabla intermedia `ReservationSeat`.

### 5. Modelo `Reservation`
**Propósito:** Registrar las transacciones y reservas hechas por los clientes para vuelos específicos.
- **Atributos Principales:**
  - `seatsReserved`: Cantidad total de asientos apartados en esta transacción.
  - `totalPrice`: Precio total pagado por el cliente, derivado del precio del vuelo y la cantidad de asientos.
  - `status`: Estado actual de la reserva (`pending`, `confirmed`, `cancelled`).
  - `reservationDate`: Fecha de creación de la reserva.
- **Relaciones:**
  - `belongsTo(User)`: Pertenece al usuario cliente que la efectuó.
  - `belongsTo(Flight)`: Corresponde a un único vuelo programado.
  - `belongsToMany(Seat)`: Relación N:M con los asientos seleccionados, conectada a través de `ReservationSeat`.

### 6. Modelo Intermedio `ReservationSeat`
**Propósito:** Servir de tabla puente (`through`) en Sequelize para vincular qué asientos exactos fueron comprados dentro de una reserva específica. No contiene atributos adicionales relevantes más allá de las llaves foráneas correspondientes a `Reservation` y `Seat`.

---

## Ejecución del Proyecto

### Backend
1. Navega al directorio `Backend/`.
2. Ejecuta `npm install` para descargar las dependencias.
3. Copia el archivo `.env.example` a `.env` y configura tus variables de entorno (Base de Datos MySQL).
4. Ejecuta las migraciones y seeders: `npm run migrate` y luego `npm run seed`.
5. Levanta el servidor en entorno de desarrollo con `npm run dev`.

### Frontend
1. Navega al directorio `Frontend/`.
2. Ejecuta `npm install` para instalar las dependencias de React/Vite.
3. Asegúrate de configurar el archivo `.env` apuntando a la URL del backend (`VITE_API_URL=http://localhost:3000/api`).
4. Inicia el servidor de desarrollo utilizando `npm run dev`.

---

> **Nota Final:** La lógica del Backend incluye Middlewares de validación, Rate Limiters para seguridad, JWT para autenticación, y manejo estructurado de errores para asegurar una API robusta y confiable. El Frontend proporciona una Single Page Application fluida consumiendo esta API.
