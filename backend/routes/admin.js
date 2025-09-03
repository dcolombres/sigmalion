const express = require('express');
const { Parser } = require('json2csv');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { checkAdmin } = require('../middleware/rbac');

// Configurar multer para guardar archivos subidos en una carpeta 'uploads'
const upload = multer({ dest: 'uploads/' });

function adminRoutes(prisma) {
    const router = express.Router();

    // Ruta para descargar la plantilla de proyectos
    router.get('/proyectos/template', checkAdmin, (req, res) => {
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
    router.post('/proyectos/import', checkAdmin, async (req, res) => {
        const proyectosParaCrear = req.body;

        try {
            const result = await prisma.proyecto.createMany({
                data: proyectosParaCrear,
            });

            res.json({ message: `Importación completada. Se crearon ${result.count} nuevos proyectos.` });

        } catch (error) {
            console.error('Error al importar proyectos:', error);
            console.error('Datos que se intentaron crear:', proyectosParaCrear);
            res.status(500).json({ error: 'Ocurrió un error durante la importación.', details: error.message });
        }
    });

    // --- RUTAS PARA STAFF ---

    // Ruta para descargar la plantilla de staff
    router.get('/staff/template', checkAdmin, (req, res) => {
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
    router.post('/staff/import', checkAdmin, upload.single('file'), (req, res) => {
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
                    console.error('Datos que se intentaron crear:', staffParaCrear);
                    res.status(500).json({ error: 'Ocurrió un error durante la importación.', details: error.message });
                } finally {
                    fs.unlinkSync(filePath);
                }
            });
    });

    // --- RUTAS PARA CLIENTES ---
    router.get('/clientes/template', checkAdmin, (req, res) => {
        try {
            const fields = [
                'cliente', 'mail_cliente', 'cel_cliente', 'observacion_general', 'nombre_publico', 
                'nombre_interno', 'tipo', 'fecha_inicio_desarrollo', 'estado', 'dependencia_uso', 
                'uso_interno_ministerio', 'uso_interno_equipo_desarrollo'
            ];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse();

            res.header('Content-Type', 'text/csv');
            res.attachment('plantilla_clientes.csv');
            res.send(csv);
        } catch (error) {
            console.error('Error al generar la plantilla de clientes CSV:', error);
            res.status(500).json({ error: 'No se pudo generar la plantilla.' });
        }
    });

    router.post('/clientes/import', checkAdmin, async (req, res) => {
        const clientesParaCrear = req.body;

        try {
            const result = await prisma.cliente.createMany({
                data: clientesParaCrear,
            });

            res.json({ message: `Importación completada. Se crearon ${result.count} nuevos clientes.` });

        } catch (error) {
            console.error('Error al importar clientes:', error);
            console.error('Datos que se intentaron crear:', clientesParaCrear);
            res.status(500).json({ error: 'Ocurrió un error durante la importación.', details: error.message });
        }
    });

    // --- RUTAS PARA INTEGRACIONES ---
    router.get('/integraciones/template', checkAdmin, (req, res) => {
        try {
            const fields = ['nombre', 'detalles'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse();

            res.header('Content-Type', 'text/csv');
            res.attachment('plantilla_integraciones.csv');
            res.send(csv);
        } catch (error) {
            console.error('Error al generar la plantilla de integraciones CSV:', error);
            res.status(500).json({ error: 'No se pudo generar la plantilla.' });
        }
    });

    router.post('/integraciones/import', checkAdmin, async (req, res) => {
        const integracionesParaCrear = req.body;

        try {
            const result = await prisma.integracion.createMany({
                data: integracionesParaCrear,
            });

            res.json({ message: `Importación completada. Se crearon ${result.count} nuevas integraciones.` });

        } catch (error) {
            console.error('Error al importar integraciones:', error);
            console.error('Datos que se intentaron crear:', integracionesParaCrear);
            res.status(500).json({ error: 'Ocurrió un error durante la importación.', details: error.message });
        }
    });

    // --- RUTAS PARA EXPORTACIÓN ---
    router.get('/:dataType/export', checkAdmin, async (req, res) => {
        const { dataType } = req.params;
        let data;
        let filename;
        let fields;

        try {
            switch (dataType) {
                case 'proyectos':
                    data = await prisma.proyecto.findMany();
                    filename = 'proyectos.csv';
                    fields = [
                        'id', 'titulo_proyecto', 'proyecto_activo', 'storyline', 'origen_dependencia', 
                        'subsecretaria_direccion', 'categoria', 'subcategoria', 'recursos', 'urls', 
                        'captura', 'caratula', 'ticketera_interna', 'ticketera_externa', 'tier', 
                        'cantidad_recursos_asignados', 'clienteId'
                    ];
                    break;
                case 'staff':
                    data = await prisma.staff.findMany();
                    filename = 'staff.csv';
                    fields = [
                        'id', 'nombre_completo', 'contrato', 'rol', 'nombres', 'apellidos', 'activo', 
                        'comentario', 'modalidad', 'experiencia', 'origen', 'email', 'skills', 
                        'desempeno_ley_dto', 'hhee', 'ur', 'coordinacion', 'presencialidad', 
                        'cumpleanos', 'edad'
                    ];
                    break;
                case 'clientes':
                    data = await prisma.cliente.findMany();
                    filename = 'clientes.csv';
                    fields = [
                        'id', 'cliente', 'mail_cliente', 'cel_cliente', 'observacion_general', 
                        'nombre_publico', 'nombre_interno', 'tipo', 'fecha_inicio_desarrollo', 
                        'estado', 'dependencia_uso', 'uso_interno_ministerio', 'uso_interno_equipo_desarrollo'
                    ];
                    break;
                case 'integraciones':
                    data = await prisma.integracion.findMany();
                    filename = 'integraciones.csv';
                    fields = ['id', 'nombre', 'detalles'];
                    break;
                default:
                    return res.status(400).json({ error: 'Tipo de datos no válido para exportación.' });
            }

            const json2csvParser = new Parser({ fields });
            const csvData = json2csvParser.parse(data);

            res.header('Content-Type', 'text/csv');
            res.attachment(filename);
            res.send(csvData);

        } catch (error) {
            console.error(`Error al exportar ${dataType}:`, error);
            res.status(500).json({ error: `Ocurrió un error durante la exportación de ${dataType}.`, details: error.message });
        }
    });

    return router;
}

module.exports = adminRoutes;