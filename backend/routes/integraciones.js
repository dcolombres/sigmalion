const express = require('express');
const Joi = require('joi');

module.exports = (prisma, authenticateToken) => {
  const router = express.Router();

  const integracionSchema = Joi.object({
    nombre: Joi.string().required(),
    detalles: Joi.string().required(),
  });

  // GET all integrations with search and pagination
  router.get('/', authenticateToken, async (req, res) => {
    const { search, page, pageSize } = req.query;
    const take = parseInt(pageSize, 10) || 10; // Default page size to 10
    const skip = (parseInt(page, 10) - 1) * take || 0; // Default to first page

    let where = {};
    if (search) {
      where = {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    try {
      const [integraciones, totalCount] = await prisma.$transaction([
        prisma.integracion.findMany({
          where,
          skip,
          take,
        }),
        prisma.integracion.count({ where }),
      ]);
      res.json({ integraciones, totalCount });
    } catch (error) {
      console.error('Error fetching integrations:', error);
      res.status(500).json({ error: 'An error occurred while fetching integrations.' });
    }
  });

  // Create a new integration
  router.post('/', authenticateToken, async (req, res) => {
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

  // GET a single integration by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const integracion = await prisma.integracion.findUnique({
        where: { id: parseInt(id, 10) },
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

  // Update an integration
  router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { error, value } = integracionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const updatedIntegracion = await prisma.integracion.update({
        where: { id: parseInt(id) },
        data: value
      });
      res.json(updatedIntegracion);
    } catch (error) {
      console.error('Error updating integration:', error);
      res.status(500).json({ error: 'An error occurred while updating integration.' });
    }
  });

  // Delete an integration
  router.delete('/:id', authenticateToken, async (req, res) => {
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