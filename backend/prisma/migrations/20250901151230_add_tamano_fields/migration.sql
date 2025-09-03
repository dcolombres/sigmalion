/*
  Warnings:

  - You are about to drop the column `tamano_actual` on the `licencias` table. All the data in the column will be lost.
  - You are about to drop the column `tamano_max_permitido` on the `licencias` table. All the data in the column will be lost.
  - You are about to drop the column `tamano_bd` on the `tecnologias` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_licencias" (
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
    "tamano_actual_value" REAL,
    "tamano_actual_unit" TEXT,
    "tamano_max_permitido_value" REAL,
    "tamano_max_permitido_unit" TEXT,
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
INSERT INTO "new_licencias" ("backup_periodico", "base_datos_nombre_comercial", "contiene_store_procedure", "depuracion_automatica", "herramienta_desarrollo_bd", "herramientas_desarrollo", "id", "ide_compiladores", "mantenimiento", "modo_licencia_bd", "modo_licenciamiento_ide", "proyecto_id", "responsable_mantenimiento", "servidor_ejecucion_so", "servidor_que_aloja", "tipo_licencia_bd", "version_bd", "version_ide_comp", "version_so") SELECT "backup_periodico", "base_datos_nombre_comercial", "contiene_store_procedure", "depuracion_automatica", "herramienta_desarrollo_bd", "herramientas_desarrollo", "id", "ide_compiladores", "mantenimiento", "modo_licencia_bd", "modo_licenciamiento_ide", "proyecto_id", "responsable_mantenimiento", "servidor_ejecucion_so", "servidor_que_aloja", "tipo_licencia_bd", "version_bd", "version_ide_comp", "version_so" FROM "licencias";
DROP TABLE "licencias";
ALTER TABLE "new_licencias" RENAME TO "licencias";
CREATE UNIQUE INDEX "licencias_proyecto_id_key" ON "licencias"("proyecto_id");
CREATE TABLE "new_tecnologias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proyecto_id" INTEGER NOT NULL,
    "lenguaje_desarrollo" TEXT,
    "base_datos" TEXT,
    "control_versiones" TEXT,
    "tamano_bd_value" REAL,
    "tamano_bd_unit" TEXT,
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
INSERT INTO "new_tecnologias" ("alojamiento_infra", "ano_inicio_sistema", "base_datos", "changelog", "control_versiones", "id", "label", "lenguaje_desarrollo", "mantenimiento_soporte", "proyecto_id", "status_pmo", "status_salud", "usuarios_externos", "usuarios_internos") SELECT "alojamiento_infra", "ano_inicio_sistema", "base_datos", "changelog", "control_versiones", "id", "label", "lenguaje_desarrollo", "mantenimiento_soporte", "proyecto_id", "status_pmo", "status_salud", "usuarios_externos", "usuarios_internos" FROM "tecnologias";
DROP TABLE "tecnologias";
ALTER TABLE "new_tecnologias" RENAME TO "tecnologias";
CREATE UNIQUE INDEX "tecnologias_proyecto_id_key" ON "tecnologias"("proyecto_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
