# SigmaLion: Resumen Técnico del Sistema

## Arquitectura General
SigmaLion es una aplicación web de pila completa (full-stack) que sigue una arquitectura cliente-servidor. El frontend es una Single Page Application (SPA) que consume una API RESTful desarrollada en el backend.

## Tecnologías Clave

### Frontend
*   **Framework:** Vue.js 3 (con Composition API y `<script setup>`)
*   **Manejo de Estado:** Pinia (la librería de manejo de estado recomendada para Vue.js)
*   **Enrutamiento:** Vue Router
*   **Estilos/UI:** Bootstrap 5 (para componentes UI y sistema de grillas), CSS personalizado.
*   **Comunicación con API:** Axios (cliente HTTP basado en promesas)
*   **Herramientas de Desarrollo:** Vite (bundler rápido), ESLint (para linting de código), Prettier (para formato de código), Vitest (para pruebas unitarias).
*   **Parseo de CSV:** PapaParse (para el parseo de archivos CSV en el cliente)

### Backend
*   **Entorno de Ejecución:** Node.js
*   **Framework Web:** Express.js (para construir la API RESTful)
*   **Base de Datos:** SQLite (para desarrollo y pruebas, configurable para otras bases de datos relacionales como PostgreSQL, MySQL, SQL Server con Prisma)
*   **ORM (Object-Relational Mapper):** Prisma (para interactuar con la base de datos de manera segura y tipada)
*   **Autenticación:** JSON Web Tokens (JWT) para la autenticación de usuarios.
*   **Autorización:** Middleware de control de acceso basado en roles (RBAC) para gestionar permisos de usuario (USER, ADMIN, SUPERADMIN).
*   **Hashing de Contraseñas:** bcryptjs (para almacenar contraseñas de forma segura)
*   **Validación de Esquemas:** Joi (para la validación de datos de entrada en los endpoints de la API)
*   **Manejo de Archivos (temporal):** Multer (para la subida de archivos, aunque el importador de proyectos ahora procesa JSON directamente)
*   **Generación de CSV:** json2csv (para exportar datos a formato CSV)
*   **Documentación de API:** Swagger/OpenAPI (implementado con `swagger-jsdoc` para anotaciones en código y `swagger-ui-express` para la interfaz de usuario interactiva).

## Base de Datos
*   **Tipo:** Relacional.
*   **Prisma Schema:** Define los modelos de datos (`Proyecto`, `Staff`, `Cliente`, `Integracion`, `Usuario`, `BackendDetails`, `FrontendDetails`, `Infraestructura`, `Databases`, `Tecnologias`) y sus relaciones. Incluye enums para campos con valores predefinidos (ej. `EstadoProyecto`, `RolStaff`, `CategoriaProyecto`, `ModalidadStaff`, `ExperienciaStaff`, `Tier`, `Unit`).
*   **Migraciones:** Gestionadas por Prisma Migrate para mantener el esquema de la base de datos sincronizado con los modelos de Prisma.

## Despliegue y Entorno
*   **Variables de Entorno:** Utiliza archivos `.env` para la configuración sensible (ej. `JWT_SECRET`, `DATABASE_URL`).
*   **Servidor:** Se ejecuta en un puerto configurable (por defecto 3000).

## Características Destacadas
*   **API RESTful:** Interfaz clara y bien definida para la comunicación entre frontend y backend.
*   **Validación de Datos:** Rigurosa validación de entrada en el backend para asegurar la integridad de los datos.
*   **Seguridad:** Autenticación basada en JWT y autorización RBAC para proteger los recursos de la API.
*   **Importación/Exportación de Datos:** Funcionalidades para importar datos de proyectos, staff, clientes e integraciones desde CSV (con validación previa en frontend) y exportar datos a CSV.
*   **Documentación Interactiva:** Swagger UI proporciona una interfaz interactiva para explorar y probar los endpoints de la API.
*   **Dashboard Dinámico:** Visualización de métricas clave del sistema en tiempo real.
