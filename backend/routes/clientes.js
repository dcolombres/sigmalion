const express = require('express');
const Joi = require('joi');
const { checkAdmin } = require('../middleware/rbac');

module.exports = (prisma) => {
  const router = express.Router();

  const estadoProyectoEnumValues = ['Activo', 'Inactivo', 'En_Desarrollo', 'Mantenimiento'];

  const clienteSchema = Joi.object({
    cliente: Joi.string().allow(null, ''),
    mail_cliente: Joi.string().email().allow(null, ''), // Kept for data integrity
    datos_de_contacto: Joi.string().allow(null, ''),
    dependencia: Joi.string().allow(null, ''),
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
  }).unknown(true);

  // Obtener todos los clientes con búsqueda y paginación
  router.get('/', async (req, res, next) => {
    const { search, page, pageSize } = req.query;
    const take = parseInt(pageSize, 10) || 10;
    const skip = (parseInt(page, 10) - 1) * take || 0;

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
      next(error);
    }
  });

  // Crear un nuevo cliente
  router.post('/', checkAdmin, async (req, res, next) => {
    try {
      const { error, value } = clienteSchema.validate(req.body);
      if (error) {
        error.isJoi = true;
        throw error;
      }
      const nuevoCliente = await prisma.cliente.create({
        data: value,
      });
      res.status(201).json(nuevoCliente);
    } catch (error) {
      next(error);
    }
  });

  // Obtener un cliente por ID
  router.get('/:id', async (req, res, next) => {
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
      next(error);
    }
  });

  // Actualizar un cliente
  router.put('/:id', checkAdmin, async (req, res, next) => {
    const { id } = req.params;
    try {
      const { error, value } = clienteSchema.validate(req.body);
      if (error) {
        error.isJoi = true;
        throw error;
      }
      const clienteActualizado = await prisma.cliente.update({
        where: { id: parseInt(id, 10) },
        data: value,
      });
      res.json(clienteActualizado);
    } catch (error) {
      next(error);
    }
  });

  // Eliminar un cliente
  router.delete('/:id', checkAdmin, async (req, res, next) => {
    const { id } = req.params;
    try {
      await prisma.cliente.delete({
        where: { id: parseInt(id, 10) },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};