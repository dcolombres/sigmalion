-- CreateTable
CREATE TABLE "proyectos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo_proyecto" TEXT NOT NULL,
    "proyecto_activo" BOOLEAN,
    "storyline" TEXT,
    "origen_dependencia" TEXT,
    "subsecretaria_direccion" TEXT,
    "categoria" TEXT,
    "subcategoria" TEXT,
    "tier" TEXT,
    "cantidad_recursos_asignados" INTEGER,
    "recursos" TEXT,
    "urls" TEXT,
    "captura" TEXT,
    "caratula" TEXT,
    "ticketera_interna" TEXT,
    "ticketera_externa" TEXT
);

-- CreateTable
CREATE TABLE "staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre_completo" TEXT NOT NULL,
    "contrato" TEXT,
    "rol" TEXT,
    "nombres" TEXT,
    "apellidos" TEXT,
    "activo" BOOLEAN,
    "comentario" TEXT,
    "modalidad" TEXT,
    "experiencia" TEXT,
    "origen" TEXT,
    "email" TEXT,
    "skills" TEXT,
    "desempeno_ley_dto" TEXT,
    "hhee" TEXT,
    "ur" TEXT,
    "coordinacion" TEXT,
    "presencialidad" TEXT,
    "cumpleanos" TEXT,
    "edad" INTEGER
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proyecto_id" INTEGER NOT NULL,
    "cliente" TEXT,
    "mail_cliente" TEXT,
    "cel_cliente" TEXT,
    "observacion_general" TEXT,
    "nombre_publico" TEXT,
    "nombre_interno" TEXT,
    "tipo" TEXT,
    "fecha_inicio_desarrollo" DATETIME,
    "estado" TEXT,
    "dependencia_uso" TEXT,
    "uso_interno_ministerio" BOOLEAN,
    "uso_interno_equipo_desarrollo" BOOLEAN,
    CONSTRAINT "clientes_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "backend_details" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proyecto_id" INTEGER NOT NULL,
    "lenguaje_principal_bckend" TEXT,
    "version_utilizada" TEXT,
    "lenguaje_secundario" TEXT,
    "framework_bckend" TEXT,
    "otras_librerias" TEXT,
    CONSTRAINT "backend_details_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "frontend_details" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proyecto_id" INTEGER NOT NULL,
    "lenguaje_principal_frontend" TEXT,
    "framework_frontend" TEXT,
    "otras_librerias_requeridas" TEXT,
    "herramientas_desarrollo" TEXT,
    "ide_compiladores" TEXT,
    "version_ide_comp" TEXT,
    "modo_licenciamiento" TEXT,
    CONSTRAINT "frontend_details_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "infraestructura" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proyecto_id" INTEGER NOT NULL,
    "arq_hardware" TEXT,
    "hosting_en_data_center" BOOLEAN,
    "virtualizado" BOOLEAN,
    "ubicacion_servidor" TEXT,
    "servidor_web" TEXT,
    "nombre_comercial_srv" TEXT,
    "version_srv" TEXT,
    "hosting_srv" BOOLEAN,
    "virtualizado_srv" BOOLEAN,
    "ubicacion_srv" TEXT,
    "escalado_srv" TEXT,
    "entorno_cliente_so_soportadas" TEXT,
    "navegadores_versiones" TEXT,
    "req_instalar_paq_adicionales" BOOLEAN,
    "paquetes_adicionales_necesarios" TEXT,
    "modelo_seguridad" TEXT,
    "posee_entorno_test" BOOLEAN,
    "test_automatico" BOOLEAN,
    "ubicacion_doc_deploy" TEXT,
    CONSTRAINT "infraestructura_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "licencias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proyecto_id" INTEGER NOT NULL,
    "herramientas_desarrollo" TEXT,
    "ide_compiladores" TEXT,
    "version_ide_comp" TEXT,
    "modo_licenciamiento_ide" TEXT,
    "base_datos_nombre_comercial" TEXT,
    "version_bd" TEXT,
    "modo_licencia_bd" TEXT,
    "tipo_licencia_bd" TEXT,
    "herramienta_desarrollo_bd" TEXT,
    "tamano_actual" TEXT,
    "tamano_max_permitido" TEXT,
    "servidor_que_aloja" TEXT,
    "mantenimiento" TEXT,
    "backup_periodico" BOOLEAN,
    "depuracion_automatica" BOOLEAN,
    "responsable_mantenimiento" TEXT,
    "contiene_store_procedure" BOOLEAN,
    "servidor_ejecucion_so" TEXT,
    "version_so" TEXT,
    CONSTRAINT "licencias_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tecnologias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proyecto_id" INTEGER NOT NULL,
    "lenguaje_desarrollo" TEXT,
    "base_datos" TEXT,
    "control_versiones" TEXT,
    "tamano_bd" TEXT,
    "alojamiento_infra" TEXT,
    "label" TEXT,
    "mantenimiento_soporte" TEXT,
    "status_pmo" TEXT,
    "status_salud" TEXT,
    "changelog" TEXT,
    "ano_inicio_sistema" INTEGER,
    "usuarios_internos" INTEGER,
    "usuarios_externos" INTEGER,
    CONSTRAINT "tecnologias_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "integraciones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_StaffProyectos" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_StaffProyectos_A_fkey" FOREIGN KEY ("A") REFERENCES "proyectos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StaffProyectos_B_fkey" FOREIGN KEY ("B") REFERENCES "staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ProyectoIntegraciones" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ProyectoIntegraciones_A_fkey" FOREIGN KEY ("A") REFERENCES "integraciones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProyectoIntegraciones_B_fkey" FOREIGN KEY ("B") REFERENCES "proyectos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_proyecto_id_key" ON "clientes"("proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "backend_details_proyecto_id_key" ON "backend_details"("proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "frontend_details_proyecto_id_key" ON "frontend_details"("proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "infraestructura_proyecto_id_key" ON "infraestructura"("proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "licencias_proyecto_id_key" ON "licencias"("proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "tecnologias_proyecto_id_key" ON "tecnologias"("proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_StaffProyectos_AB_unique" ON "_StaffProyectos"("A", "B");

-- CreateIndex
CREATE INDEX "_StaffProyectos_B_index" ON "_StaffProyectos"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProyectoIntegraciones_AB_unique" ON "_ProyectoIntegraciones"("A", "B");

-- CreateIndex
CREATE INDEX "_ProyectoIntegraciones_B_index" ON "_ProyectoIntegraciones"("B");
