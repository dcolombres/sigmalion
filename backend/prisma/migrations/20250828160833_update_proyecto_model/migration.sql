-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_proyectos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo_proyecto" TEXT NOT NULL,
    "proyecto_activo" BOOLEAN DEFAULT false,
    "storyline" TEXT,
    "origen_dependencia" TEXT,
    "subsecretaria_direccion" TEXT,
    "categoria" TEXT,
    "subcategoria" TEXT,
    "recursos" TEXT,
    "urls" TEXT,
    "captura" TEXT,
    "caratula" TEXT,
    "ticketera_interna" TEXT,
    "ticketera_externa" TEXT,
    "tier" TEXT,
    "cantidad_recursos_asignados" INTEGER DEFAULT 0,
    "clienteId" INTEGER,
    CONSTRAINT "proyectos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_proyectos" ("cantidad_recursos_asignados", "captura", "caratula", "categoria", "clienteId", "id", "origen_dependencia", "proyecto_activo", "recursos", "storyline", "subcategoria", "subsecretaria_direccion", "ticketera_externa", "ticketera_interna", "tier", "titulo_proyecto", "urls") SELECT "cantidad_recursos_asignados", "captura", "caratula", "categoria", "clienteId", "id", "origen_dependencia", "proyecto_activo", "recursos", "storyline", "subcategoria", "subsecretaria_direccion", "ticketera_externa", "ticketera_interna", "tier", "titulo_proyecto", "urls" FROM "proyectos";
DROP TABLE "proyectos";
ALTER TABLE "new_proyectos" RENAME TO "proyectos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
