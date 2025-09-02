# Changelog
# SIGMA - Sistema Integral de Gestión y Monitoreo de Activos
## SIGMALION

Todos los cambios notables de este proyecto serán documentados en este archivo.

## [0.2.2] - 2025-08-29

### Mejorado
- Mejorado el botón para colapsar el sidebar con dos propuestas de diseño.
- Movida la sección de información de usuario debajo del menú del sidebar.
- Reemplazado "Usuario" por el nombre del usuario y reducido el tamaño de la sección de información de usuario.
- Aumentado el tamaño de los logos en el pie de página del sidebar.
- Actualizado el estilo del texto del pie de página.

## [0.2.1] - 2025-08-27

### Añadido
- Campo `detalles` con soporte Markdown a la sección de Integraciones.
- Posibilidad de colapsar el sidebar para mostrar solo los íconos.

### Corregido
- Espaciado entre el sidebar y el contenido principal.
- Logo en la vista de Login.
- Eliminado el footer y movido su contenido al sidebar.
- Error 500 al guardar una integración.

## [0.2.0] - 2025-08-27

### Añadido
- Funcionalidad de búsqueda y filtrado para los listados de Usuarios, Proyectos, Staff e Integraciones.
- Funcionalidad de paginación para los listados de Usuarios, Proyectos, Staff e Integraciones.

### Corregido
- Error "Missing required param 'id'" en `UsersListView.vue`.
- Error "TypeError: Cannot read properties of null (reading 'split')" en `auth.js`.
- El servidor backend no iniciaba debido a la falta de la llamada `app.listen()`.
- Problemas generales de visibilidad de listados debido a errores de HMR.

## [0.1.0] - 2025-08-26

### Añadido
- Configuración inicial del proyecto (Backend: Node.js/Express/Prisma/SQLite, Frontend: Vue.js/Vite).
- Autenticación JWT completa (Registro, Login, Protección de rutas en Backend y Frontend).
- Gestión CRUD completa para Proyectos (Listar, Crear, Editar, Borrar).
- Página de detalle de Proyecto con gestión de Cliente, Tecnologías, Infraestructura, Licencias, BackendDetails, FrontendDetails (Ver y Editar todos los campos).
- Gestión de Staff en página de detalle de Proyecto (Asignar/Quitar staff).
- Gestión CRUD completa para Staff (Listar, Crear, Editar, Borrar).
- Documentación inicial (README.md, instrucciones.md).

### Corregido
- Errores de importación en el router del frontend.
- Problemas de `jwt-decode` con Vite (implementación de decodificador JWT manual).
- Errores de duplicación de código en componentes del frontend.