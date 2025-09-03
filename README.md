# SIGMA - Sistema Integral de Gestión y Monitoreo de Activos
## SIGMALION Project

## Descripción
Este proyecto es un sistema de gestión para la base de datos `sigma_db.sql`, desarrollado con un stack moderno para backend y frontend.

## Stack Tecnológico
-   **Backend:** Node.js, Express.js, Prisma ORM
-   **Frontend:** Vue.js 3 (con Vite, Vue Router, Pinia)
-   **Base de Datos:** SQLite (para desarrollo local, fácilmente adaptable a PostgreSQL)
-   **Autenticación:** JSON Web Tokens (JWT)

## Prerrequisitos
Antes de empezar, asegúrate de tener instalado:
-   [Node.js](https://nodejs.org/en/) (versión 18 o superior, se recomienda la LTS)
-   [npm](https://www.npmjs.com/) (viene con Node.js)

## Primeros Pasos

Sigue estos pasos para poner el proyecto en marcha en tu máquina local.

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd SIGMALION
```

### 2. Configuración del Backend

Navega al directorio `backend` e instala las dependencias:
```bash
cd backend
npm install
```

### 3. Configuración de la Base de Datos

Este proyecto utiliza SQLite para desarrollo, lo que significa que la base de datos es un archivo local (`dev.db`). Prisma se encarga de la gestión del esquema.

Para inicializar la base de datos y generar el cliente Prisma:
```bash
cd backend
npx prisma migrate dev --name init
```
Esto creará el archivo `prisma/dev.db` y generará el código necesario para interactuar con la DB.

### 4. Configuración del Frontend

Navega al directorio `frontend` e instala las dependencias:
```bash
cd ../frontend
npm install
```

### 5. Configuración de Autenticación (JWT Secret)

Crea un archivo `.env` en el directorio `backend` (si no existe) y añade tu secreto JWT. **Asegúrate de que sea una cadena larga y aleatoria.**
```
JWT_SECRET=tu_secreto_super_seguro_aqui
```

### 6. Iniciar el Servidor del Backend

En una terminal, desde el directorio raíz del proyecto (`SIGMALION/`):
```bash
node backend/index.js &
```
El servidor se iniciará en `http://localhost:3000`. Asegúrate de que el servidor esté corriendo en segundo plano para que la terminal quede libre.

### 7. Iniciar el Servidor de Desarrollo del Frontend

En **otra terminal**, desde el directorio `frontend`:
```bash
cd frontend
npm run dev &
```
El servidor de desarrollo se iniciará (usualmente en `http://localhost:5173`). Asegúrate de que el servidor esté corriendo en segundo plano para que la terminal quede libre.

### 8. Acceder a la Aplicación

Abre tu navegador y ve a la URL del frontend (ej. `http://localhost:5173`).

## Autenticación

Las rutas de la API están protegidas. Deberás registrarte e iniciar sesión para acceder a la mayoría de las funcionalidades.
-   **Registro:** Ve a `/register` en el frontend.
-   **Login:** Ve a `/login` en el frontend.

## Endpoints de la API (Backend)

## Funcionalidades Implementadas

### Gestión de Usuarios

-   **CRUD Completo:** Listar, Crear, Ver Detalle, Editar y Borrar usuarios.
-   **Búsqueda y Filtrado:** Funcionalidad de búsqueda por nombre o email.
-   **Paginación:** Navegación por páginas en el listado de usuarios.

### Gestión de Proyectos

-   **Búsqueda y Filtrado:** Funcionalidad de búsqueda por título o storyline.
-   **Paginación:** Navegación por páginas en el listado de proyectos.

### Gestión de Staff

-   **Búsqueda y Filtrado:** Funcionalidad de búsqueda por nombre, email o rol.
-   **Paginación:** Navegación por páginas en el listado de staff.

### Gestión de Integraciones

-   **Búsqueda y Filtrado:** Funcionalidad de búsqueda por nombre.
-   **Paginación:** Navegación por páginas en el listado de integraciones.

**Autenticación:**
-   `POST /api/auth/register`
-   `POST /api/auth/login`

**Proyectos:**
-   `GET /api/proyectos`
-   `POST /api/proyectos`
-   `GET /api/proyectos/:id`
-   `PUT /api/proyectos/:id`
-   `DELETE /api/proyectos/:id`
-   `PUT /api/proyectos/:id/cliente`
-   `PUT /api/proyectos/:id/tecnologias`
-   `PUT /api/proyectos/:id/infraestructura`
-   `PUT /api/proyectos/:id/licencias`
-   `PUT /api/proyectos/:id/backend-details`
-   `PUT /api/proyectos/:id/frontend-details`
-   `POST /api/proyectos/:id/staff` (Asignar staff)
-   `DELETE /api/proyectos/:id/staff/:staffId` (Quitar staff)

**Staff (Maestro):**
-   `GET /api/staff`
-   `POST /api/staff`
-   `GET /api/staff/:id`
-   `PUT /api/staff/:id`
-   `DELETE /api/staff/:id`



Para Trabaja la DB de PRISMA

Terminal desde Backend: npx prisma studio

Para registro de users

curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "nombre": "SUPERADMIN",
  "email": "superadmin@superadmin.com",
  "password": "superadmin"
}'