/*
  Warnings:

  - You are about to drop the `licencias` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "licencias";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "databases" (
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
    CONSTRAINT "databases_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "databases_proyecto_id_key" ON "databases"("proyecto_id");
