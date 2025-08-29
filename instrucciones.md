# Instrucciones para Desarrolladores

Este documento proporciona una guía más detallada para desarrolladores que trabajan en el proyecto SIGMALION.

## 1. Estructura del Proyecto

El proyecto está organizado en una estructura de monorepo simple con dos directorios principales:

-   `backend/`: Contiene el servidor Node.js (Express, Prisma).
-   `frontend/`: Contiene la aplicación Vue.js (Vite, Vue Router, Pinia).

## 2. Backend (Node.js, Express, Prisma)

### Dependencias Clave
-   `express`: Framework web para Node.js.
-   `prisma`: ORM para interactuar con la base de datos.
-   `bcryptjs`: Para el hashing de contraseñas.
-   `jsonwebtoken`: Para la autenticación JWT.
-   `cors`: Middleware para habilitar Cross-Origin Resource Sharing.
-   `dotenv`: Para cargar variables de entorno desde un archivo `.env`.

### Archivos Clave
-   `backend/index.js`: Punto de entrada del servidor, define rutas y middleware.
-   `backend/prisma/schema.prisma`: Define el esquema de la base de datos y los modelos de Prisma.
-   `backend/prisma/dev.db`: Archivo de la base de datos SQLite (generado por Prisma).
-   `backend/.env`: Variables de entorno (ej. `JWT_SECRET`).

### Gestión de la Base de Datos (Prisma)

-   **Modificar el Esquema:** Edita `backend/prisma/schema.prisma` para añadir o modificar modelos/campos.
-   **Crear Migraciones:** Después de modificar el esquema, genera una nueva migración:
    ```bash
    cd backend
    npx prisma migrate dev --name nombre_de_tu_migracion
    ```
    Esto creará un nuevo archivo de migración SQL y lo aplicará a tu `dev.db`.
-   **Generar Cliente Prisma:** Si solo cambiaste el esquema y no necesitas una migración (ej. solo cambiaste un `@@map`), puedes regenerar el cliente:
    ```bash
    cd backend
    npx prisma generate
    ```

### Rutas Protegidas

Las rutas en `backend/index.js` que requieren autenticación utilizan el middleware `authenticateToken`. Asegúrate de aplicarlo a cualquier nueva ruta que deba ser protegida.

## 3. Frontend (Vue.js, Vite, Pinia)

### Dependencias Clave
-   `vue`: Framework progresivo de JavaScript.
-   `vite`: Herramienta de construcción rápida para desarrollo web.
-   `vue-router`: Para la gestión de rutas en la SPA.
-   `pinia`: Gestor de estado para Vue.js.
-   `axios`: Cliente HTTP para hacer peticiones a la API.
-   `jwt-decode`: **(No utilizado directamente, decodificación manual implementada)** Para decodificar tokens JWT en el cliente.

### Archivos Clave
-   `frontend/src/main.js`: Punto de entrada de la aplicación Vue, inicializa Pinia y Vue Router.
-   `frontend/src/App.vue`: Componente raíz de la aplicación, contiene la navegación principal y el `RouterView`.
-   `frontend/src/router/index.js`: Define todas las rutas del frontend y los guardias de navegación.
-   `frontend/src/stores/auth.js`: Store de Pinia para la gestión de la autenticación (token, usuario, login/logout).
-   `frontend/src/views/`: Contiene los componentes de vista (páginas). **Ahora incluyen funcionalidades de búsqueda y paginación.**
-   `frontend/src/components/`: Contiene componentes reutilizables.

### Gestión de Estado (Pinia)

-   Los stores de Pinia se encuentran en `frontend/src/stores/`. Utiliza `defineStore` para crear nuevos stores para gestionar el estado global de la aplicación.

### Peticiones a la API

-   Todas las peticiones HTTP se realizan utilizando `axios`. El interceptor de Axios configurado en `auth.js` añade automáticamente el token JWT a las cabeceras de las peticiones si el usuario está autenticado.

### Guardias de Ruta

-   Las rutas con `meta: { requiresAuth: true }` en `frontend/src/router/index.js` están protegidas. El `router.beforeEach` se encarga de redirigir a los usuarios no autenticados a la página de login.

## 4. Flujo de Autenticación

1.  **Registro:** `POST /api/auth/register` (backend) -> `RegisterView.vue` (frontend).
2.  **Login:** `POST /api/auth/login` (backend) -> `LoginView.vue` (frontend).
    -   El backend devuelve un JWT.
    -   El frontend guarda el JWT en `localStorage` y en el store de Pinia.
    -   El interceptor de Axios adjunta este token a futuras peticiones.
3.  **Acceso a Rutas Protegidas:** El middleware `authenticateToken` (backend) y los guardias de ruta (frontend) verifican el token.
4.  **Logout:** `authStore.logout()` borra el token y redirige al login.

## 5. Consideraciones Adicionales

-   **Validación de Datos:** Implementar validación de datos más robusta tanto en el frontend (para UX) como en el backend (para seguridad y consistencia de datos).
-   **Manejo de Errores:** Mejorar el manejo de errores en el frontend para mostrar mensajes más amigables al usuario.
-   **Estilos:** La aplicación utiliza estilos básicos. Considerar la integración de un framework CSS (ej. Tailwind CSS, Bootstrap) o un sistema de diseño.
-   **Testing:** Añadir pruebas unitarias y de integración para el backend y el frontend.

