const express = require('express');
const Joi = require('joi');

module.exports = (prisma, authenticateToken) => {
  const router = express.Router();

  const rolStaffEnumValues = ['Developer', 'QA', 'PM', 'Designer', 'DevOps'];
  const modalidadStaffEnumValues = ['Full_time', 'Part_time', 'Contractor'];
  const experienciaStaffEnumValues = ['Junior', 'Mid', 'Senior'];

  const staffSchema = Joi.object({
    nombre_completo: Joi.string().required(),
    contrato: Joi.string().allow(null, ''),
    rol: Joi.string().valid(...rolStaffEnumValues).allow(null, ''),
    nombres: Joi.string().allow(null, ''),
    apellidos: Joi.string().allow(null, ''),
    activo: Joi.boolean().allow(null),
    comentario: Joi.string().allow(null, ''),
    modalidad: Joi.string().valid(...modalidadStaffEnumValues).allow(null, ''),
    experiencia: Joi.string().valid(...experienciaStaffEnumValues).allow(null, ''),
    origen: Joi.string().allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    skills: Joi.string().allow(null, ''),
    desempeno_ley_dto: Joi.string().allow(null, ''),
    hhee: Joi.string().allow(null, ''),
    ur: Joi.string().allow(null, ''),
    coordinacion: Joi.string().allow(null, ''),
    presencialidad: Joi.string().allow(null, ''),
    cumpleanos: Joi.string().allow(null, ''),
    edad: Joi.number().integer().min(0).allow(null),
  });

  // GET all staff members with search and pagination
  router.get('/', authenticateToken, async (req, res) => {
    const { search, page, pageSize } = req.query;
    const take = parseInt(pageSize, 10) || 10; // Default page size to 10
    const skip = (parseInt(page, 10) - 1) * take || 0; // Default to first page

    let where = {};
    if (search) {
      where = {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { rol: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    try {
      const [staff, totalCount] = await prisma.$transaction([
        prisma.staff.findMany({
          where,
          skip,
          take,
        }),
        prisma.staff.count({ where }),
      ]);
      res.json({ staff, totalCount });
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ error: 'An error occurred while fetching staff.' });
    }
  });

  // Create a new staff member
  router.post('/', authenticateToken, async (req, res) => {
    const { error, value } = staffSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const newStaff = await prisma.staff.create({
        data: value,
      });
      res.status(201).json(newStaff);
    } catch (error) {
      console.error('Error creating staff member:', error);
      res.status(500).json({ error: 'An error occurred while creating the staff member.' });
    }
  });

  // GET a single staff member by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const staff = await prisma.staff.findUnique({
        where: { id: parseInt(id, 10) },
      });
      if (staff) {
        res.json(staff);
      } else {
        res.status(404).json({ error: 'Staff member not found' });
      }
    } catch (error) {
      console.error('Error fetching staff member:', error);
      res.status(500).json({ error: 'An error occurred while fetching staff member.' });
    }
  });

  // Update a staff member
  router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { error, value } = staffSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const updatedStaff = await prisma.staff.update({
        where: { id: parseInt(id, 10) },
        data: value,
      });
      res.json(updatedStaff);
    } catch (error) {
      console.error('Error updating staff member:', error);
      res.status(500).json({ error: 'An error occurred while updating staff member.' });
    }
  });

  // Delete a staff member
  router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.staff.delete({
        where: { id: parseInt(id, 10) },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting staff member:', error);
      res.status(500).json({ error: 'An error occurred while deleting staff member.' });
    }
  });

  return router;
};