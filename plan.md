# Plan de Desarrollo Pendiente

Este documento detalla las fases y tareas restantes en el desarrollo del proyecto SIGMALION.

## Mañana

- **Corregir el guardado del markdown** en la sección de Integraciones.
- **Revisar todos los campos de Proyectos y sus subsecciones** para que quede con precisión cuáles son numéricos, cuáles tienen límites de caracteres, cuáles son booleanos, etc.
- **Continuar con los ajustes estéticos**.
- **Trabajar el módulo usuarios a partir de un simple RBAC**.

## Fase 1: Completar Gestión de Datos (Pendiente)

-   **Gestión de Usuarios:**
    -   Verificar el funcionamiento completo del CRUD de usuarios (listar, crear, ver detalle, editar, borrar).

## Fase 2: Mejoras de Gestión (Filtros, Búsqueda, Paginación)

-   **Filtros y Búsqueda:**
    -   Implementar funcionalidad de filtrado y búsqueda en las listas de:
        -   Proyectos (`HomeView.vue`)
        -   Staff (`StaffListView.vue`)
        -   Integraciones (`IntegracionesListView.vue`)
        -   Usuarios (`UsersListView.vue`)
-   **Paginación:**
    -   Implementar paginación en las listas de:
        -   Proyectos (`HomeView.vue`)
        -   Staff (`StaffListView.vue`)
        -   Integraciones (`IntegracionesListView.vue`)
        -   Usuarios (`UsersListView.vue`)

## Fase 3: Mejoras de UI/UX

-   **Estilización General:**
    -   Aplicar un framework CSS (ej. Bootstrap, Tailwind CSS) o definir un sistema de diseño más robusto para mejorar la estética general de la aplicación.
    -   Revisar y mejorar la consistencia de estilos en todos los componentes.
-   **Notificaciones:**
    -   Implementar un sistema de notificaciones (toasts, alertas) para informar al usuario sobre el éxito o fracaso de las operaciones CRUD.
-   **Navegación y Layout:**
    -   Mejorar la navegación principal y el layout general de la aplicación para una mejor experiencia de usuario.
-   **Integración de Activos Visuales:**
    -   Integrar las imágenes SVG proporcionadas (`frontend/src/img/icon.svg`, `frontend/src/img/logosigma.svg`) en el diseño de la aplicación.
    -   Configurar una de las imágenes SVG como favicon.

## Fase 4: Preparación para Despliegue

-   **Configuración de Entorno:**
    -   Configurar variables de entorno específicas para producción (ej. `NODE_ENV`, `DATABASE_URL` para PostgreSQL).
-   **Optimización del Frontend:**
    -   Optimizar los assets del frontend para producción (minificación, tree-shaking, etc.).
-   **Servidor de Producción:**
    -   Configurar un servidor de producción (ej. Nginx, PM2) para servir la aplicación backend.
-   **Base de Datos en la Nube:**
    -   Migrar la base de datos SQLite a una base de datos PostgreSQL en la nube (ej. Heroku Postgres, Render, Supabase).
-   **Despliegue:**
    -   Configurar un pipeline de despliegue continuo (CI/CD) si es necesario.

