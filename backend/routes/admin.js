const express = require('express');
const { Parser } = require('json2csv');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// Configurar multer para guardar archivos subidos en una carpeta 'uploads'
const upload = multer({ dest: 'uploads/' });

function adminRoutes(prisma, authenticateToken) {
    const router = express.Router();

    // Aplicar middleware de autenticación a todas las rutas de admin
    router.use(authenticateToken);

    // Ruta para descargar la plantilla de proyectos
    router.get('/proyectos/template', (req, res) => {
        try {
            const fields = [
                'titulo_proyecto', 
                'proyecto_activo', 
                'storyline', 
                'origen_dependencia', 
                'subsecretaria_direccion', 
                'categoria', 
                'subcategoria', 
                'recursos', 
                'urls', 
                'captura', 
                'caratula', 
                'ticketera_interna', 
                'ticketera_externa', 
                'tier', 
                'cantidad_recursos_asignados', 
                'clienteId'
            ];
            
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(); // Sin datos, solo cabeceras

            res.header('Content-Type', 'text/csv');
            res.attachment('plantilla_proyectos.csv');
            res.send(csv);
        } catch (error) {
            console.error('Error al generar la plantilla CSV:', error);
            res.status(500).json({ error: 'No se pudo generar la plantilla.' });
        }
    });

    // Ruta para importar proyectos desde un CSV
    router.post('/proyectos/import', upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
        }

        const results = [];
        const filePath = req.file.path;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // Mapear y transformar los datos del CSV al formato del schema de Prisma
                    const proyectosParaCrear = results.map(row => ({
                        titulo_proyecto: row.titulo_proyecto,
                        proyecto_activo: row.proyecto_activo ? row.proyecto_activo.toLowerCase() === 'true' : false,
                        storyline: row.storyline,
                        origen_dependencia: row.origen_dependencia,
                        subsecretaria_direccion: row.subsecretaria_direccion,
                        categoria: row.categoria,
                        subcategoria: row.subcategoria,
                        recursos: row.recursos,
                        urls: row.urls,
                        captura: row.captura,
                        caratula: row.caratula,
                        ticketera_interna: row.ticketera_interna,
                        ticketera_externa: row.ticketera_externa,
                        tier: row.tier || null,
                        cantidad_recursos_asignados: row.cantidad_recursos_asignados ? parseInt(row.cantidad_recursos_asignados, 10) : 0,
                        clienteId: row.clienteId ? parseInt(row.clienteId, 10) : null,
                    }));

                    const result = await prisma.proyecto.createMany({
                        data: proyectosParaCrear,
                    });

                    res.json({ message: `Importación completada. Se crearon ${result.count} nuevos proyectos.` });

                } catch (error) {
                    console.error('Error al importar proyectos:', error);
                    res.status(500).json({ error: 'Ocurrió un error durante la importación.' });
                } finally {
                    // Limpiar el archivo subido
                    fs.unlinkSync(filePath);
                }
            });
    });

    // --- RUTAS PARA STAFF ---

    // Ruta para descargar la plantilla de staff
    router.get('/staff/template', (req, res) => {
        try {
            const fields = [
                'nombre_completo', 'contrato', 'rol', 'nombres', 'apellidos', 'activo', 
                'comentario', 'modalidad', 'experiencia', 'origen', 'email', 'skills', 
                'desempeno_ley_dto', 'hhee', 'ur', 'coordinacion', 'presencialidad', 
                'cumpleanos', 'edad'
            ];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse();

            res.header('Content-Type', 'text/csv');
            res.attachment('plantilla_staff.csv');
            res.send(csv);
        } catch (error) {
            console.error('Error al generar la plantilla de staff CSV:', error);
            res.status(500).json({ error: 'No se pudo generar la plantilla.' });
        }
    });

    // Ruta para importar staff desde un CSV
    router.post('/staff/import', upload.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
        }

        const results = [];
        const filePath = req.file.path;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // --- Funciones de mapeo para Enums ---
                    const mapRol = (rol) => {
                        const rolLower = rol?.toLowerCase();
                        if (!rolLower) return null;
                        if (rolLower.includes('dev')) return 'Developer';
                        if (rolLower.includes('qa')) return 'QA';
                        if (rolLower.includes('pm')) return 'PM';
                        if (rolLower.includes('design') || rolLower.includes('diseño') || rolLower.includes('ux/ui')) return 'Designer';
                        if (rolLower.includes('devops')) return 'DevOps';
                        return null; // O un valor por defecto si se prefiere
                    };

                    const mapModalidad = (modalidad) => {
                        const modLower = modalidad?.toLowerCase();
                        if (!modLower) return null;
                        if (modLower.includes('full')) return 'Full_time';
                        if (modLower.includes('part')) return 'Part_time';
                        if (modLower.includes('contractor')) return 'Contractor';
                        return null;
                    };

                    const mapExperiencia = (exp) => {
                        const expLower = exp?.toLowerCase();
                        if (!expLower) return null;
                        if (expLower.includes('jr') || expLower.includes('junior')) return 'Junior';
                        if (expLower.includes('mid') || expLower.includes('semisr') || expLower.includes('semi-sr')) return 'Mid';
                        if (expLower.includes('sr') || expLower.includes('senior')) return 'Senior';
                        return null;
                    };

                    const staffParaCrear = results.map(row => ({
                        nombre_completo: row.nombre_completo,
                        contrato: row.contrato,
                        rol: mapRol(row.rol),
                        nombres: row.nombres,
                        apellidos: row.apellidos,
                        activo: row.activo ? row.activo.toLowerCase() === 'true' : false,
                        comentario: row.comentario,
                        modalidad: mapModalidad(row.modalidad),
                        experiencia: mapExperiencia(row.experiencia),
                        origen: row.origen,
                        email: row.email,
                        skills: row.skills,
                        desempeno_ley_dto: row.desempeno_ley_dto,
                        hhee: row.hhee,
                        ur: row.ur,
                        coordinacion: row.coordinacion,
                        presencialidad: row.presencialidad,
                        cumpleanos: row.cumpleanos,
                        edad: row.edad ? parseInt(row.edad, 10) : null,
                    }));

                    const result = await prisma.staff.createMany({
                        data: staffParaCrear,
                    });

                    res.json({ message: `Importación completada. Se crearon ${result.count} nuevos registros de staff.` });

                } catch (error) {
                    console.error('Error al importar staff:', error);
                    res.status(500).json({ error: 'Ocurrió un error durante la importación.' });
                } finally {
                    fs.unlinkSync(filePath);
                }
            });
    });

    return router;
}

module.exports = adminRoutes;
