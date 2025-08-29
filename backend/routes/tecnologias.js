const express = require('express');
const Joi = require('joi');

module.exports = (prisma, authenticateToken) => {
  const router = express.Router();

  const tecnologiasSchema = Joi.object({
    proyecto_id: Joi.number().integer().required(),
    lenguaje_desarrollo: Joi.string().allow(null, ''),
    base_datos: Joi.string().allow(null, ''),
    control_versiones: Joi.string().allow(null, ''),
    tamano_bd: Joi.string().allow(null, ''),
    alojamiento_infra: Joi.string().allow(null, ''),
    label: Joi.string().allow(null, ''),
    mantenimiento_soporte: Joi.string().allow(null, ''),
    status_pmo: Joi.string().allow(null, ''),
    status_salud: Joi.string().allow(null, ''),
    changelog: Joi.string().allow(null, ''),
    ano_inicio_sistema: Joi.number().integer().allow(null),
    usuarios_internos: Joi.number().integer().allow(null),
    usuarios_externos: Joi.number().integer().allow(null),
  });

  // GET all tecnologias
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const tecnologias = await prisma.tecnologias.findMany();
      res.json(tecnologias);
    } catch (error) {
      console.error('Error fetching tecnologias:', error);
      res.status(500).json({ error: 'An error occurred while fetching tecnologias.' });
    }
  });

  // Create a new tecnologias entry
  router.post('/', authenticateToken, async (req, res) => {
    const { error, value } = tecnologiasSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const newTecnologias = await prisma.tecnologias.create({
        data: value,
      });
      res.status(201).json(newTecnologias);
    } catch (error) {
      console.error('Error creating tecnologias:', error);
      res.status(500).json({ error: 'An error occurred while creating the tecnologias entry.' });
    }
  });

  // GET a single tecnologias entry by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const tecnologias = await prisma.tecnologias.findUnique({
        where: { id: parseInt(id, 10) },
      });
      if (tecnologias) {
        res.json(tecnologias);
      } else {
        res.status(404).json({ error: 'Tecnologias entry not found' });
      }
    } catch (error) {
      console.error('Error fetching tecnologias entry:', error);
      res.status(500).json({ error: 'An error occurred while fetching tecnologias entry.' });
    }
  });

  // Update a tecnologias entry
  router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { error, value } = tecnologiasSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const updatedTecnologias = await prisma.tecnologias.update({
        where: { id: parseInt(id, 10) },
        data: value,
      });
      res.json(updatedTecnologias);
    } catch (error) {
      console.error('Error updating tecnologias entry:', error);
      res.status(500).json({ error: 'An error occurred while updating tecnologias entry.' });
    }
  });

  // Delete a tecnologias entry
  router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.tecnologias.delete({
        where: { id: parseInt(id, 10) },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting tecnologias entry:', error);
      res.status(500).json({ error: 'An error occurred while deleting tecnologias entry.' });
    }
  });

  return router;
};