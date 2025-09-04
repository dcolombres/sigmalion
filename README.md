# Sistema de Inventario de Proyectos y Recursos

Bienvenido al sistema de gestión de inventario. Esta aplicación full-stack está diseñada para catalogar y gestionar proyectos, personal y recursos asociados.

## Arquitectura

El sistema sigue una arquitectura cliente-servidor desacoplada:

-   **Backend:** Una API RESTful construida con **Node.js** y **Express.js**. Se encarga de toda la lógica de negocio y la comunicación con la base de datos.
-   **Frontend:** Una Single-Page Application (SPA) construida con **React.js**. Consume los datos de la API del backend y los presenta en una interfaz de usuario interactiva.
-   **Base de Datos:** **PostgreSQL**, una base de datos relacional de código abierto, robusta y escalable.

---

## Guía de Instalación y Puesta en Marcha

Sigue estos pasos para montar un entorno de desarrollo local completo.

### 1. Prerrequisitos

Asegúrate de tener el siguiente software instalado en tu máquina:

-   [**Node.js**](https://nodejs.org/) (que incluye **npm**, el gestor de paquetes de Node).

### 2. Puesta en Marcha

Con los prerrequisitos instalados, puedes levantar todo el entorno. Abre dos terminales en la raíz del proyecto.

**Terminal 1: Iniciar el Backend**

Este comando instalará las dependencias (si es necesario), aplicará las migraciones de la base de datos e iniciará el servidor del backend.

```bash
cd backend && if [ ! -d "node_modules" ]; then npm install; fi && npx prisma migrate deploy && node index.js
```

**Terminal 2: Iniciar el Frontend**

Este comando instalará las dependencias (si es necesario) e iniciará el servidor de desarrollo del frontend.

```bash
cd frontend && if [ ! -d "node_modules" ]; then npm install; fi && npm run dev
```

Después de unos momentos, los servidores estarán listos:
-   **Backend API:** La Terminal 1 mostrará que el servidor está escuchando en un puerto (ej. `3001`).
-   **Frontend App:** La Terminal 2 mostrará la URL para acceder a la aplicación (ej. `http://localhost:5173`).

### ¡Listo!

Ya tienes todo el entorno de desarrollo montado y listo para empezar a trabajar en nuevas funcionalidades.
