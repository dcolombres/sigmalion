const express = require('express');
const Joi = require('joi');
const { checkAdmin } = require('../middleware/rbac');

module.exports = (prisma) => {
  const router = express.Router();

  const integracionSchema = Joi.object({
    nombre: Joi.string().required(),
    detalles: Joi.string().allow(null, '').optional(),
  });

  /**
   * @swagger
   * tags:
   *   name: Integraciones
   *   description: API for managing integrations
   */

  /**
   * @swagger
   * /integraciones:
   *   get:
   *     summary: Get all integrations with search and pagination
   *     tags: [Integraciones]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term for name or description
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
   *         description: A list of integrations
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 integraciones:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/IntegracionSummary'
   *                 totalCount:
   *                   type: integer
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       500:
   *         description: Internal server error
   */
  // GET all integrations with search and pagination
  router.get('/', checkAdmin, async (req, res) => {
    const { search, page, pageSize } = req.query;
    const take = parseInt(pageSize, 10) || 10; // Default page size to 10
    const skip = (parseInt(page, 10) - 1) * take || 0; // Default to first page

    let where = {};
    if (search) {
      where = {
        OR: [
          { nombre: { contains: search } },
          { detalles: { contains: search } },
        ],
      };
    }

    try {
      const [integraciones, totalCount] = await prisma.$transaction([
        prisma.integracion.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            nombre: true,
            detalles: true,
          },
        }),
        prisma.integracion.count({ where }),
      ]);
      res.json({ integraciones, totalCount });
    } catch (error) {
      console.error('Error fetching integrations:', error);
      res.status(500).json({ error: 'An error occurred while fetching integrations.' });
    }
  });

  /**
   * @swagger
   * /integraciones:
   *   post:
   *     summary: Create a new integration
   *     tags: [Integraciones]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/IntegracionCreate'
   *     responses:
   *       201:
   *         description: Integration created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Integracion'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       500:
   *         description: Internal server error
   */
  // Create a new integration
  router.post('/', checkAdmin, async (req, res) => {
    const { error, value } = integracionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const newIntegracion = await prisma.integracion.create({
        data: value,
      });
      res.status(201).json(newIntegracion);
    } catch (error) {
      console.error('Error creating integration:', error);
      res.status(500).json({ error: 'An error occurred while creating the integration.' });
    }
  });

  /**
   * @swagger
   * /integraciones/{id}:
   *   get:
   *     summary: Get a single integration by ID
   *     tags: [Integraciones]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Integration ID
   *     responses:
   *       200:
   *         description: Integration details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Integracion'
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       404:
   *         description: Integration not found
   *       500:
   *         description: Internal server error
   */
  // GET a single integration by ID
  router.get('/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const integracion = await prisma.integracion.findUnique({
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
      if (integracion) {
        res.json(integracion);
      } else {
        res.status(404).json({ error: 'Integration not found' });
      }
    } catch (error) {
      console.error('Error fetching integration:', error);
      res.status(500).json({ error: 'An error occurred while fetching integration.' });
    }
  });

  /**
   * @swagger
   * /integraciones/{id}:
   *   put:
   *     summary: Update an integration by ID
   *     tags: [Integraciones]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Integration ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/IntegracionUpdate'
   *     responses:
   *       200:
   *         description: Integration updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Integracion'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Integration not found
   *       500:
   *         description: Internal server error
   */
  // Update an integration
  router.put('/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { error, value } = integracionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const updatedIntegracion = await prisma.integracion.update({
        where: { id: parseInt(id, 10) },
        data: value
      });
      res.json(updatedIntegracion);
    } catch (error) {
      console.error('Error updating integration:', error);
      res.status(500).json({ error: 'An error occurred while updating integration.' });
    }
  });

  /**
   * @swagger
   * /integraciones/{id}:
   *   delete:
   *     summary: Delete an integration by ID
   *     tags: [Integraciones]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Integration ID
   *     responses:
   *       204:
   *         description: Integration deleted successfully
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Integration not found
   *       500:
   *         description: Internal server error
   */
  // Delete an integration
  router.delete('/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.integracion.delete({
        where: { id: parseInt(id, 10) },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting integration:', error);
      res.status(500).json({ error: 'An error occurred while deleting integration.' });
    }
  });

  return router;
};