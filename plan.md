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
    -   Configurar un pipeline de despliegie continuo (CI/CD) si es necesario.

## Propuesta de Mejoras para la Gestión de Datos (2025-09-03)

A continuación se presenta un plan para robustecer y mejorar la arquitectura de gestión de datos del sistema, basado en el análisis del estado actual.

### Sugerencias Estratégicas

1.  **Manejo de Errores Centralizado (Backend):** Implementar un middleware de Express que intercepte todos los errores (especialmente los de Prisma), los clasifique y envíe respuestas estandarizadas y claras al frontend (ej. `409 Conflict` para duplicados, en lugar de `500 Internal Server Error`).
2.  **Validación Sincronizada con la Base de Datos:** Adoptar herramientas que generen automáticamente los esquemas de validación (Joi) a partir del `schema.prisma`. Esto garantiza que la validación siempre esté sincronizada con la base de datos, eliminando errores manuales.
3.  **Validación Proactiva (Frontend):** Añadir validaciones en tiempo real en la interfaz de usuario. Por ejemplo, verificar si un email ya existe mientras el usuario lo escribe, proporcionando feedback inmediato.
4.  **Consistencia de la Base de Datos:** Migrar el entorno de desarrollo de SQLite a PostgreSQL para que coincida con el entorno de producción, evitando así errores específicos del entorno.

### Plan de Implementación por Fases

**Fase 1: Estabilidad Inmediata (Manejo de Errores y Corrección)**

-   **Tarea 1.1:** Crear el middleware `errorHandler.js` en el backend para la gestión centralizada de errores.
-   **Tarea 1.2:** Refactorizar las rutas (empezando por `staff.js`) para utilizar el nuevo middleware y devolver errores semánticos (ej. `409`).
-   **Tarea 1.3:** Actualizar el frontend para manejar estos nuevos errores y mostrar mensajes descriptivos al usuario.

**Fase 2: Sincronización y Prevención**

-   **Tarea 2.1:** Investigar e integrar una herramienta de generación de esquemas (ej. `joi-prisma-generator`) en el flujo de desarrollo del backend.
-   **Tarea 2.2:** Crear un endpoint en el backend para validaciones asíncronas (ej. `POST /api/staff/check-email`).
-   **Tarea 2.3:** Implementar la lógica en el frontend para consumir el endpoint de validación y dar feedback en tiempo real.

**Fase 3: Mejoras Arquitectónicas a Largo Plazo**

-   **Tarea 3.1:** Planificar y documentar el proceso de migración de la base de datos de desarrollo a PostgreSQL.
-   **Tarea 3.2:** Realizar un estudio de viabilidad sobre la migración de la API de REST a GraphQL, evaluando pros y contras para el futuro del proyecto.
