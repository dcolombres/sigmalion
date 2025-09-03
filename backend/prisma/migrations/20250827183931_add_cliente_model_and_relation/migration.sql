/*
  Warnings:

  - You are about to drop the column `proyecto_id` on the `clientes` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_clientes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "uso_interno_equipo_desarrollo" BOOLEAN
);
INSERT INTO "new_clientes" ("cel_cliente", "cliente", "dependencia_uso", "estado", "fecha_inicio_desarrollo", "id", "mail_cliente", "nombre_interno", "nombre_publico", "observacion_general", "tipo", "uso_interno_equipo_desarrollo", "uso_interno_ministerio") SELECT "cel_cliente", "cliente", "dependencia_uso", "estado", "fecha_inicio_desarrollo", "id", "mail_cliente", "nombre_interno", "nombre_publico", "observacion_general", "tipo", "uso_interno_equipo_desarrollo", "uso_interno_ministerio" FROM "clientes";
DROP TABLE "clientes";
ALTER TABLE "new_clientes" RENAME TO "clientes";
CREATE TABLE "new_proyectos" (
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
    "ticketera_externa" TEXT,
    "clienteId" INTEGER,
    CONSTRAINT "proyectos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_proyectos" ("cantidad_recursos_asignados", "captura", "caratula", "categoria", "id", "origen_dependencia", "proyecto_activo", "recursos", "storyline", "subcategoria", "subsecretaria_direccion", "ticketera_externa", "ticketera_interna", "tier", "titulo_proyecto", "urls") SELECT "cantidad_recursos_asignados", "captura", "caratula", "categoria", "id", "origen_dependencia", "proyecto_activo", "recursos", "storyline", "subcategoria", "subsecretaria_direccion", "ticketera_externa", "ticketera_interna", "tier", "titulo_proyecto", "urls" FROM "proyectos";
DROP TABLE "proyectos";
ALTER TABLE "new_proyectos" RENAME TO "proyectos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
