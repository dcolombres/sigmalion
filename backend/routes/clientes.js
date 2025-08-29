const express = require('express');
const Joi = require('joi');

module.exports = (prisma, authenticateToken) => {
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

  // Obtener todos los clientes
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const clientes = await prisma.cliente.findMany();
      res.json(clientes);
    } catch (error) {
      console.error('Error fetching clientes:', error);
      res.status(500).json({ error: 'An error occurred while fetching clientes.' });
    }
  });

  // Crear un nuevo cliente
  router.post('/', authenticateToken, async (req, res) => {
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

  // Obtener un cliente por ID
  router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id: parseInt(id, 10) },
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

  // Actualizar un cliente
  router.put('/:id', authenticateToken, async (req, res) => {
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

  // Eliminar un cliente
  router.delete('/:id', authenticateToken, async (req, res) => {
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