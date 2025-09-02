const express = require('express');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');

module.exports = (prisma, authenticateToken, checkAdmin) => {
  console.log('proyectosRoutes function called');
  const router = express.Router();

  const tierEnumValues = ['UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO'];
  const categoriaProyectoEnumValues = ['Aplicativo', 'Servicio', 'Sistema', 'Plataforma', 'Formulario', 'Registro', 'Tableros', 'APP_Mobile', 'Microservicio', 'API', 'Otra'];
  const subcategoriaProyectoEnumValues = ['web', 'mobile', 'cms', 'monitor', 'procesos', 'envio_masivo', 'datos', 'plataforma', 'asesoramiento', 'otra', null];

  // Joi schema for project creation
  const projectSchema = Joi.object({
    titulo_proyecto: Joi.string().required(),
    storyline: Joi.string().max(400).allow(null, '').optional(),
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

  const databasesSchema = Joi.object({
    herramientas_desarrollo: Joi.string().allow(null, ''),
    ide_compiladores: Joi.string().allow(null, ''),
    version_ide_comp: Joi.string().allow(null, ''),
    modo_licenciamiento_ide: Joi.string().allow(null, ''),
    base_datos_nombre_comercial: Joi.string().allow(null, ''),
    version_bd: Joi.string().allow(null, ''),
    modo_licencia_bd: Joi.string().allow(null, ''),
    tipo_licencia_bd: Joi.string().allow(null, ''),
    herramienta_desarrollo_bd: Joi.string().allow(null, ''),
    tamano_actual_value: Joi.number().allow(null),
    tamano_actual_unit: Joi.string().valid('MB', 'GB').allow(null, ''),
    tamano_max_permitido_value: Joi.number().allow(null),
    tamano_max_permitido_unit: Joi.string().valid('MB', 'GB').allow(null, ''),
    servidor_que_aloja: Joi.string().allow(null, ''),
    mantenimiento: Joi.string().allow(null, ''),
    backup_periodico: Joi.boolean().allow(null),
    depuracion_automatica: Joi.boolean().allow(null),
    responsable_mantenimiento: Joi.string().allow(null, ''),
    contiene_store_procedure: Joi.boolean().allow(null),
    servidor_ejecucion_so: Joi.string().allow(null, ''),
    version_so: Joi.string().allow(null, ''),
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

  /**
   * @swagger
   * tags:
   *   name: Proyectos
   *   description: API for managing projects
   */

  /**
   * @swagger
   * /proyectos/enums:
   *   get:
   *     summary: Get all enum values from schema.prisma
   *     tags: [Proyectos]
   *     responses:
   *       200:
   *         description: A list of enum values
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               additionalProperties:
   *                 type: array
   *                 items:
   *                   type: string
   *       500:
   *         description: Server error
   */
  router.get('/enums', (req, res) => {
    const enums = getEnumsFromSchema();
    if (enums) {
      res.json(enums);
    } else {
      res.status(500).json({ error: 'Could not retrieve enums.' });
    }
  });

  /**
   * @swagger
   * /proyectos:
   *   get:
   *     summary: Get all projects with search and pagination
   *     tags: [Proyectos]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of items per page
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term for project title, storyline, origin, or sub-direction
   *       - in: query
   *         name: sortKey
   *         schema:
   *           type: string
   *           default: id
   *         description: Field to sort by
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: asc
   *         description: Sort order
   *     responses:
   *       200:
   *         description: A list of projects
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 proyectos:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ProyectoSummary'
   *                 totalCount:
   *                   type: integer
   *       500:
   *         description: Server error
   */
  router.get('/', async (req, res) => {
    console.log('🔵 GET /api/proyectos handler hit');
    const { page, pageSize, search, sortKey, sortOrder } = req.query;
    console.log('📦 Query params - page:', page, 'pageSize:', pageSize);
    console.log('Sorting by:', sortKey, sortOrder);
    const take = parseInt(pageSize, 10) || 10; // Default page size to 10
    const skip = (parseInt(page, 10) - 1) * take || 0; // Default to first page

    let where = {};
    if (search) {
      where = {
        OR: [
          { titulo_proyecto: { contains: search } },
          { storyline: { contains: search } },
          { origen_dependencia: { contains: search } },
          { subsecretaria_direccion: { contains: search } },
        ],
      };
    }

    console.log('🔍 Where clause:', where);

    try {
      const [proyectos, totalCount] = await prisma.$transaction([
        prisma.proyecto.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortKey || 'id']: sortOrder || 'asc',
          },
          select: {
            id: true,
            titulo_proyecto: true,
            storyline: true,
            cliente: {
              select: {
                cliente: true,
              },
            },
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

  /**
   * @swagger
   * /proyectos:
   *   post:
   *     summary: Create a new project
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ProyectoCreate'
   *     responses:
   *       201:
   *         description: Project created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Proyecto'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       500:
   *         description: Internal server error
   */
  router.post('/', authenticateToken, checkAdmin, async (req, res) => {
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

  /**
   * @swagger
   * /proyectos/{id}/cliente:
   *   put:
   *     summary: Update client details for a project
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ClienteUpdate'
   *     responses:
   *       200:
   *         description: Client details updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Cliente'
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project not found
   *       500:
   *         description: Internal server error
   */
  // Create/Update client details for a project
  router.put('/:id/cliente', authenticateToken, checkAdmin, async (req, res) => {
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
      console.error(`Error upserting client details for project ${id}:`, error);
      res.status(500).json({ error: 'An error occurred while updating client details.', details: error.message });
    }
  });

  /**
   * @swagger
   * /proyectos/{id}/tecnologias:
   *   put:
   *     summary: Update tecnologias details for a project
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TecnologiasUpdate'
   *     responses:
   *       200:
   *         description: Tecnologias details updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Tecnologias'
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project not found
   *       500:
   *         description: Internal server error
   */
  // Create/Update tecnologias details for a project
  router.put('/:id/tecnologias', authenticateToken, checkAdmin, async (req, res) => {
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
      console.error(`Error upserting tecnologias details for project ${id}:`, error);
      res.status(500).json({ error: 'An error occurred while updating tecnologias details.', details: error.message });
    }
  });

  /**
   * @swagger
   * /proyectos/{id}/infraestructura:
   *   put:
   *     summary: Update infraestructura details for a project
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InfraestructuraUpdate'
   *     responses:
   *       200:
   *         description: Infraestructura details updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Infraestructura'
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project not found
   *       500:
   *         description: Internal server error
   */
  // Create/Update infraestructura details for a project
  router.put('/:id/infraestructura', authenticateToken, checkAdmin, async (req, res) => {
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
      console.error(`Error upserting infraestructura details for project ${id}:`, error);
      res.status(500).json({ error: 'An error occurred while updating infraestructura details.', details: error.message });
    }
  });

  /**
   * @swagger
   * /proyectos/{id}/databases:
   *   put:
   *     summary: Update databases details for a project
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DatabasesUpdate'
   *     responses:
   *       200:
   *         description: Databases details updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Databases'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project not found
   *       500:
   *         description: Internal server error
   */
  // Create/Update databases details for a project
  router.put('/:id/databases', authenticateToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { error, value: databasesData } = databasesSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const updatedProject = await prisma.proyecto.update({
        where: { id: parseInt(id, 10) },
        data: {
          databases: {
            upsert: {
              create: databasesData,
              update: databasesData,
            },
          },
        },
        include: {
          databases: true,
        },
      });
      res.json(updatedProject.databases);
    } catch (error) {
      console.error(`Error upserting databases details for project ${id}:`, error);
      res.status(500).json({ error: 'An error occurred while updating databases details.', details: error.message });
    }
  });

  /**
   * @swagger
   * /proyectos/{id}/backend-details:
   *   put:
   *     summary: Update backend details for a project
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BackendDetailsUpdate'
   *     responses:
   *       200:
   *         description: Backend details updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BackendDetails'
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project not found
   *       500:
   *         description: Internal server error
   */
  // Create/Update backend_details for a project
  router.put('/:id/backend-details', authenticateToken, checkAdmin, async (req, res) => {
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
      console.error(`Error upserting backend details for project ${id}:`, error);
      res.status(500).json({ error: 'An error occurred while updating backend details.', details: error.message });
    }
  });

  /**
   * @swagger
   * /proyectos/{id}/frontend-details:
   *   put:
   *     summary: Update frontend details for a project
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/FrontendDetailsUpdate'
   *     responses:
   *       200:
   *         description: Frontend details updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FrontendDetails'
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project not found
   *       500:
   *         description: Internal server error
   */
  // Create/Update frontend_details for a project
  router.put('/:id/frontend-details', authenticateToken, checkAdmin, async (req, res) => {
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
      console.error(`Error upserting frontend details for project ${id}:`, error);
      res.status(500).json({ error: 'An error occurred while updating frontend details.', details: error.message });
    }
  });

  /**
   * @swagger
   * /proyectos/{id}/staff:
   *   post:
   *     summary: Add a staff member to a project
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - staffId
   *             properties:
   *               staffId:
   *                 type: integer
   *                 description: ID of the staff member to add
   *     responses:
   *       204:
   *         description: Staff member added successfully
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project or Staff member not found
   *       500:
   *         description: Internal server error
   */
  // Add a staff member to a project
  router.post('/:id/staff', authenticateToken, checkAdmin, async (req, res) => {
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

  /**
   * @swagger
   * /proyectos/{id}/staff/{staffId}:
   *   delete:
   *     summary: Remove a staff member from a project
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *       - in: path
   *         name: staffId
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID of the staff member to remove
   *     responses:
   *       204:
   *         description: Staff member removed successfully
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project or Staff member not found
   *       500:
   *         description: Internal server error
   */
  // Remove a staff member from a project
  router.delete('/:id/staff/:staffId', authenticateToken, checkAdmin, async (req, res) => {
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

  /**
   * @swagger
   * /proyectos/{id}/integraciones:
   *   post:
   *     summary: Assign an integration to a project
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - integracionId
   *             properties:
   *               integracionId:
   *                 type: integer
   *                 description: ID of the integration to assign
   *     responses:
   *       204:
   *         description: Integration assigned successfully
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project or Integration not found
   *       500:
   *         description: Internal server error
   */
  // Assign an integration to a project
  router.post('/:id/integraciones', authenticateToken, checkAdmin, async (req, res) => {
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

  /**
   * @swagger
   * /proyectos/{id}/integraciones/{integracionId}:
   *   delete:
   *     summary: Remove an integration from a project
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *       - in: path
   *         name: integracionId
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID of the integration to remove
   *     responses:
   *       204:
   *         description: Integration removed successfully
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project or Integration not found
   *       500:
   *         description: Internal server error
   */
  // Remove an integration from a project
  router.delete('/:id/integraciones/:integracionId', authenticateToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { integracionId } = req.params;
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

  /**
   * @swagger
   * /proyectos/{id}:
   *   get:
   *     summary: Get a single project by ID with all relations
   *     tags: [Proyectos]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *     responses:
   *       200:
   *         description: Project details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Proyecto'
   *       404:
   *         description: Project not found
   *       500:
   *         description: Internal server error
   */
  // GET a single project by ID with all relations
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const proyecto = await prisma.proyecto.findUnique({
        where: { id: parseInt(id, 10) },
        select: {
            id: true,
            titulo_proyecto: true,
            storyline: true,
            proyecto_activo: true,
            origen_dependencia: true,
            subsecretaria_direccion: true,
            categoria: true,
            subcategoria: true,
            recursos: true,
            urls: true,
            captura: true,
            caratula: true,
            ticketera_interna: true,
            ticketera_externa: true,
            tier: true,
            cantidad_recursos_asignados: true,
            cliente: { select: { id: true, cliente: true } },
            staff: { select: { id: true, nombre_completo: true } },
            tecnologias: {
              select: {
                id: true,
                lenguaje_desarrollo: true,
                base_datos: true,
                control_versiones: true,
                tamano_bd_value: true,
                tamano_bd_unit: true,
                alojamiento_infra: true,
                label: true,
                mantenimiento_soporte: true,
                status_pmo: true,
                status_salud: true,
                changelog: true,
                ano_inicio_sistema: true,
                usuarios_internos: true,
                usuarios_externos: true,
              }
            },
            backend_details: true,
            frontend_details: true,
            infraestructura: true,
            databases: {
              select: {
                id: true,
                herramientas_desarrollo: true,
                ide_compiladores: true,
                version_ide_comp: true,
                modo_licenciamiento_ide: true,
                base_datos_nombre_comercial: true,
                version_bd: true,
                modo_licencia_bd: true,
                tipo_licencia_bd: true,
                herramienta_desarrollo_bd: true,
                tamano_actual_value: true,
                tamano_actual_unit: true,
                tamano_max_permitido_value: true,
                tamano_max_permitido_unit: true,
                servidor_que_aloja: true,
                mantenimiento: true,
                backup_periodico: true,
                depuracion_automatica: true,
                responsable_mantenimiento: true,
                contiene_store_procedure: true,
                servidor_ejecucion_so: true,
                version_so: true,
              }
            },
            integraciones: { select: { id: true, nombre: true } },
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

  /**
   * @swagger
   * /proyectos/{id}:
   *   put:
   *     summary: Update a project by ID
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ProyectoUpdate'
   *     responses:
   *       200:
   *         description: Project updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Proyecto'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project not found
   *       500:
   *         description: Internal server error
   */
  // Update a project
  router.put('/:id', authenticateToken, checkAdmin, async (req, res) => {
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

  /**
   * @swagger
   * /proyectos/{id}:
   *   delete:
   *     summary: Delete a project by ID
   *     tags: [Proyectos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Project ID
   *     responses:
   *       204:
   *         description: Project deleted successfully
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Project not found
   *       500:
   *         description: Internal server error
   */
  // Delete a project
  router.delete('/:id', authenticateToken, checkAdmin, async (req, res) => {
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

  return router;
};