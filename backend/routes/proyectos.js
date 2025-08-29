const express = require('express');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');

module.exports = (prisma, authenticateToken) => {
  const router = express.Router();

  const tierEnumValues = ['UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO'];
  const categoriaProyectoEnumValues = ['Aplicativo', 'Servicio', 'Sistema', 'Plataforma', 'Formulario', 'Registro', 'Tableros', 'APP_Mobile', 'Microservicio', 'API', 'Otra'];
  const subcategoriaProyectoEnumValues = ['web', 'mobile', 'cms', 'monitor', 'procesos', 'envio_masivo', 'datos', 'plataforma', 'asesoramiento', 'otra', null];

  // Joi schema for project creation
  const projectSchema = Joi.object({
    titulo_proyecto: Joi.string().required(),
    storyline: Joi.string().allow(null, '').optional(),
    proyecto_activo: Joi.boolean().default(false),
    origen_dependencia: Joi.string().allow(null, '').optional(),
    subsecretaria_direccion: Joi.string().allow(null, '').optional(),
    categoria: Joi.string().valid(...categoriaProyectoEnumValues).allow(null, '').optional(),
    subcategoria: Joi.string().valid(...subcategoriaProyectoEnumValues).allow(null, '').optional(),
    recursos: Joi.string().allow(null, '').optional(),
    urls: Joi.string().uri().allow(null, '').optional(),
    captura: Joi.string().allow(null, '').optional(),
    caratula: Joi.string().allow(null, '').optional(),
    ticketera_interna: Joi.string().allow(null, '').optional(),
    ticketera_externa: Joi.string().allow(null, '').optional(),
    tier: Joi.string().valid(...tierEnumValues).allow(null, '').optional(),
    cantidad_recursos_asignados: Joi.number().integer().min(0).default(0).optional(),
    clienteId: Joi.number().integer().allow(null).optional(),
  });


  // Function to parse enums from schema.prisma
  const getEnumsFromSchema = () => {
    try {
      const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const enums = {};
      const enumRegex = /enum\s+(\w+)\s+\{([^}]+)\}/g;
      let match;
      while ((match = enumRegex.exec(schemaContent)) !== null) {
        const enumName = match[1];
        const enumValues = match[2].trim().split(/\s+/).map(v => v.split(' ')[0]);
        enums[enumName] = enumValues;
      }
      return enums;
    } catch (error) {
      console.error('Error reading or parsing schema.prisma:', error);
      return null;
    }
  };

  // GET all enums
  router.get('/enums', authenticateToken, (req, res) => {
    const enums = getEnumsFromSchema();
    if (enums) {
      res.json(enums);
    } else {
      res.status(500).json({ error: 'Could not retrieve enums.' });
    }
  });

  // GET all projects with search and pagination
  router.get('/', authenticateToken, async (req, res) => {
    console.log('🔵 GET /api/proyectos handler hit');
    const { page, pageSize } = req.query;
    console.log('📦 Query params - page:', page, 'pageSize:', pageSize);
    const take = parseInt(pageSize, 10) || 10; // Default page size to 10
    const skip = (parseInt(page, 10) - 1) * take || 0; // Default to first page

    let where = {};

    console.log('🔍 Where clause:', where);

    try {
      const [proyectos, totalCount] = await prisma.$transaction([
        prisma.proyecto.findMany({
          where,
          skip,
          take,
          include: {
            staff: true,
            cliente: true,
            tecnologias: true,
            backend_details: true,
            frontend_details: true,
            infraestructura: true,
            licencias: true,
            integraciones: true,
          },
        }),
        prisma.proyecto.count({ where }),
      ]);
      console.log('✅ Projects fetched. Count:', proyectos.length, 'Total:', totalCount);
      res.json({ proyectos, totalCount });
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      res.status(500).json({ error: 'An error occurred while fetching projects.' });
    }
  });

  // Create a new project
  router.post('/', authenticateToken, async (req, res) => {
    const { error, value } = projectSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { titulo_proyecto, storyline, proyecto_activo, origen_dependencia, subsecretaria_direccion, categoria, subcategoria, tier, cantidad_recursos_asignados, recursos, urls, captura, caratula, ticketera_interna, ticketera_externa, clienteId } = value;
    try {
      const newProyecto = await prisma.proyecto.create({
        data: {
          titulo_proyecto,
          storyline,
          proyecto_activo,
          origen_dependencia,
          subsecretaria_direccion,
          categoria,
          subcategoria,
          tier,
          cantidad_recursos_asignados,
          recursos,
          urls,
          captura,
          caratula,
          ticketera_interna,
          ticketera_externa,
          cliente: clienteId ? { connect: { id: clienteId } } : undefined,
        },
      });
      res.status(201).json(newProyecto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while creating the project.' });
    }
  });

  // GET a single project by ID with all relations
  router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const proyecto = await prisma.proyecto.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
          cliente: true,
          staff: true,
          tecnologias: true,
          backend_details: true,
          frontend_details: true,
          infraestructura: true,
          licencias: true,
          integraciones: true,
        },
      });
      if (proyecto) {
        res.json(proyecto);
      } else {
        res.status(404).json({ error: 'Proyecto not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: `An error occurred while fetching project ${id}` });
    }
  });

  // Update a project
  router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { error, value } = projectSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { titulo_proyecto, storyline, proyecto_activo, origen_dependencia, subsecretaria_direccion, categoria, subcategoria, tier, cantidad_recursos_asignados, recursos, urls, captura, caratula, ticketera_interna, ticketera_externa, clienteId } = value;
    try {
      const updatedProyecto = await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          titulo_proyecto,
          storyline,
          proyecto_activo,
          origen_dependencia,
          subsecretaria_direccion,
          categoria,
          subcategoria,
          tier,
          cantidad_recursos_asignados,
          recursos,
          urls,
          captura,
          caratula,
          ticketera_interna,
          ticketera_externa,
          cliente: clienteId ? { connect: { id: clienteId } } : undefined,
        },
      });
      res.json(updatedProyecto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: `An error occurred while updating project ${id}` });
    }
  });

  // Delete a project
  router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.proyecto.delete({
        where: { id: parseInt(id, 10) },
      });
      res.status(204).send(); // No content
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: `An error occurred while deleting project ${id}` });
    }
  });

  // --- Project Sub-entity Endpoints (One-to-One) ---

  // Create/Update client details for a project
  router.put('/:id/cliente', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const clienteData = req.body;

    try {
      const updatedProject = await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          cliente: {
            upsert: {
              create: clienteData,
              update: clienteData,
            },
          },
        },
        include: {
          cliente: true, // Include the updated client data in the response
        },
      });
      res.json(updatedProject.cliente);
    } catch (error) {
      console.error('Error upserting client details:', error);
      res.status(500).json({ error: 'An error occurred while updating client details.' });
    }
  });

  // Create/Update tecnologias details for a project
  router.put('/:id/tecnologias', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const tecnologiasData = req.body;

    try {
      const updatedProject = await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          tecnologias: {
            upsert: {
              create: tecnologiasData,
              update: tecnologiasData,
            },
          },
        },
        include: {
          tecnologias: true,
        },
      });
      res.json(updatedProject.tecnologias);
    } catch (error) {
      console.error('Error upserting tecnologias details:', error);
      res.status(500).json({ error: 'An error occurred while updating tecnologias details.' });
    }
  });

  // Create/Update infraestructura details for a project
  router.put('/:id/infraestructura', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const infraestructuraData = req.body;

    try {
      const updatedProject = await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          infraestructura: {
            upsert: {
              create: infraestructuraData,
              update: infraestructuraData,
            },
          },
        },
        include: {
          infraestructura: true,
        },
      });
      res.json(updatedProject.infraestructura);
    } catch (error) {
      console.error('Error upserting infraestructura details:', error);
      res.status(500).json({ error: 'An error occurred while updating infraestructura details.' });
    }
  });

  // Create/Update licencias details for a project
  router.put('/:id/licencias', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const licenciasData = req.body;

    try {
      const updatedProject = await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          licencias: {
            upsert: {
              create: licenciasData,
              update: licenciasData,
            },
          },
        },
        include: {
          licencias: true,
        },
      });
      res.json(updatedProject.licencias);
    } catch (error) {
      console.error('Error upserting licencias details:', error);
      res.status(500).json({ error: 'An error occurred while updating licencias details.' });
    }
  });

  // Create/Update backend_details for a project
  router.put('/:id/backend-details', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const backendDetailsData = req.body;

    try {
      const updatedProject = await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          backend_details: {
            upsert: {
              create: backendDetailsData,
              update: backendDetailsData,
            },
          },
        },
        include: {
          backend_details: true,
        },
      });
      res.json(updatedProject.backend_details);
    } catch (error) {
      console.error('Error upserting backend details:', error);
      res.status(500).json({ error: 'An error occurred while updating backend details.' });
    }
  });

  // Create/Update frontend_details for a project
  router.put('/:id/frontend-details', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const frontendDetailsData = req.body;

    try {
      const updatedProject = await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          frontend_details: {
            upsert: {
              create: frontendDetailsData,
              update: frontendDetailsData,
            },
          },
        },
        include: {
          frontend_details: true,
        },
      });
      res.json(updatedProject.frontend_details);
    } catch (error) {
      console.error('Error upserting frontend details:', error);
      res.status(500).json({ error: 'An error occurred while updating frontend details.' });
    }
  });

  // --- Project Staff Endpoints (Many-to-Many) ---

  // Add a staff member to a project
  router.post('/:id/staff', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { staffId } = req.body;
    try {
      await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          staff: {
            connect: { id: parseInt(staffId, 10) },
          },
        },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error adding staff to project:', error);
      res.status(500).json({ error: 'An error occurred while adding staff.' });
    }
  });

  // Remove a staff member from a project
  router.delete('/:id/staff/:staffId', authenticateToken, async (req, res) => {
    const { id, staffId } = req.params;
    try {
      await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          staff: {
            disconnect: { id: parseInt(staffId, 10) },
          },
        },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error removing staff from project:', error);
      res.status(500).json({ error: 'An error occurred while removing staff.' });
    }
  });

  // --- Project Integrations Endpoints (Many-to-Many) ---

  // Assign an integration to a project
  router.post('/:id/integraciones', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { integracionId } = req.body;
    try {
      await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          integraciones: {
            connect: { id: parseInt(integracionId, 10) },
          },
        },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error assigning integration to project:', error);
      res.status(500).json({ error: 'An error occurred while assigning integration.' });
    }
  });

  // Remove an integration from a project
  router.delete('/:id/integraciones/:integracionId', authenticateToken, async (req, res) => {
    const { id, integracionId } = req.params;
    try {
      await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          integraciones: {
            disconnect: { id: parseInt(integracionId, 10) },
          },
        },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error removing integration from project:', error);
      res.status(500).json({ error: 'An error occurred while removing integration.' });
    }
  });

  return router;
};
