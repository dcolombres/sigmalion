const express = require('express');
const Joi = require('joi');
const { checkAdmin } = require('../middleware/rbac');

module.exports = (prisma) => {
  const router = express.Router();

  const estadoProyectoEnumValues = ['Activo', 'Inactivo', 'En_Desarrollo', 'Mantenimiento'];

  const clienteSchema = Joi.object({
    cliente: Joi.string().allow(null, ''),
    mail_cliente: Joi.string().email().allow(null, ''),
    cel_cliente: Joi.string().allow(null, ''),
    observacion_general: Joi.string().allow(null, ''),
    nombre_publico: Joi.string().allow(null, ''),
    nombre_interno: Joi.string().allow(null, ''),
    tipo: Joi.string().allow(null, ''),
    fecha_inicio_desarrollo: Joi.date().iso().allow(null),
    estado: Joi.string().valid(...estadoProyectoEnumValues).allow(null, ''),
    dependencia_uso: Joi.string().allow(null, ''),
    uso_interno_ministerio: Joi.boolean().allow(null),
    uso_interno_equipo_desarrollo: Joi.boolean().allow(null),
  });

  /**
   * @swagger
   * tags:
   *   name: Clientes
   *   description: API for managing clients
   */

  /**
   * @swagger
   * /clientes:
   *   get:
   *     summary: Get all clients with search and pagination
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term for client name
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
   *     responses:
   *       200:
   *         description: A list of clients
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 clientes:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ClienteSummary'
   *                 totalCount:
   *                   type: integer
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       500:
   *         description: Internal server error
   */
  // Obtener todos los clientes con búsqueda y paginación
  router.get('/', async (req, res) => {
    const { search, page, pageSize } = req.query;
    const take = parseInt(pageSize, 10) || 10; // Tamaño de página por defecto: 10
    const skip = (parseInt(page, 10) - 1) * take || 0; // Por defecto, primera página

    let where = {};
    if (search) {
      where = {
        OR: [
          { cliente: { contains: search } },
          { nombre_publico: { contains: search } },
          { nombre_interno: { contains: search } },
        ],
      };
    }

    try {
      const [clientes, totalCount] = await prisma.$transaction([
        prisma.cliente.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            cliente: true,
            nombre_publico: true,
            nombre_interno: true,
            tipo: true,
            estado: true,
            fecha_inicio_desarrollo: true,
          },
        }),
        prisma.cliente.count({ where }),
      ]);
      res.json({ clientes, totalCount });
    } catch (error) {
      console.error('Error fetching clientes:', error);
      res.status(500).json({ error: 'An error occurred while fetching clientes.' });
    }
  });

  /**
   * @swagger
   * /clientes:
   *   post:
   *     summary: Create a new client
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ClienteCreate'
   *     responses:
   *       201:
   *         description: Client created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Cliente'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       500:
   *         description: Internal server error
   */
  // Crear un nuevo cliente
  router.post('/', checkAdmin, async (req, res) => {
    const { error, value } = clienteSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const nuevoCliente = await prisma.cliente.create({
        data: value,
      });
      res.status(201).json(nuevoCliente);
    } catch (error) {
      console.error('Error creating cliente:', error);
      res.status(500).json({ error: 'An error occurred while creating the cliente.' });
    }
  });

  /**
   * @swagger
   * /clientes/{id}:
   *   get:
   *     summary: Get a single client by ID
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Client ID
   *     responses:
   *       200:
   *         description: Client details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Cliente'
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       404:
   *         description: Client not found
   *       500:
   *         description: Internal server error
   */
  // Obtener un cliente por ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
          proyectos: {
            select: {
              id: true,
              titulo_proyecto: true,
            },
          },
        },
      });
      if (cliente) {
        res.json(cliente);
      } else {
        res.status(404).json({ error: 'Cliente not found' });
      }
    } catch (error) {
      console.error('Error fetching cliente:', error);
      res.status(500).json({ error: 'An error occurred while fetching cliente.' });
    }
  });

  /**
   * @swagger
   * /clientes/{id}:
   *   put:
   *     summary: Update a client by ID
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Client ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ClienteUpdate'
   *     responses:
   *       200:
   *         description: Client updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Cliente'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Client not found
   *       500:
   *         description: Internal server error
   */
  // Actualizar un cliente
  router.put('/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { error, value } = clienteSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const clienteActualizado = await prisma.cliente.update({
        where: { id: parseInt(id, 10) },
        data: value,
      });
      res.json(clienteActualizado);
    } catch (error) {
      console.error('Error updating cliente:', error);
      res.status(500).json({ error: 'An error occurred while updating cliente.' });
    }
  });

  /**
   * @swagger
   * /clientes/{id}:
   *   delete:
   *     summary: Delete a client by ID
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Client ID
   *     responses:
   *       204:
   *         description: Client deleted successfully
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Client not found
   *       500:
   *         description: Internal server error
   */
  // Eliminar un cliente
  router.delete('/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.cliente.delete({
        where: { id: parseInt(id, 10) },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting cliente:', error);
      res.status(500).json({ error: 'An error occurred while deleting cliente.' });
    }
  });

  return router;
};