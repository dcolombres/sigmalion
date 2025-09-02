const express = require('express');
const Joi = require('joi');
const { checkAdmin } = require('../middleware/rbac');

module.exports = (prisma) => {
  const router = express.Router();

  const rolStaffEnumValues = ['Developer', 'QA', 'PM', 'Designer', 'DevOps', 'Director', 'Coordinador', 'Analista'];
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
  }).unknown(true);

  /**
   * @swagger
   * tags:
   *   name: Staff
   *   description: API for managing staff members
   */

  /**
   * @swagger
   * /staff:
   *   get:
   *     summary: Get all staff members with search and pagination
   *     tags: [Staff]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term for name, email, or role
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
   *         description: A list of staff members
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 staff:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/StaffSummary'
   *                 totalCount:
   *                   type: integer
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       500:
   *         description: Internal server error
   */
  // GET all staff members with search and pagination
  router.get('/', async (req, res) => {
    const { search, page, pageSize } = req.query;
    const take = parseInt(pageSize, 10) || 10; // Default page size to 10
    const skip = (parseInt(page, 10) - 1) * take || 0; // Default to first page

    let where = {};
    if (search) {
      const orConditions = [
        { nombre_completo: { contains: search } },
        { nombres: { contains: search } },
        { apellidos: { contains: search } },
      ];

      const matchingRoles = rolStaffEnumValues.filter(role =>
        role.toLowerCase().includes(search.toLowerCase())
      );

      if (matchingRoles.length > 0) {
        orConditions.push({ rol: { in: matchingRoles } });
      }
      
      where = { OR: orConditions };
    }

    try {
      const [staff, totalCount] = await prisma.$transaction([
        prisma.staff.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            nombre_completo: true,
            rol: true,
            activo: true,
          },
        }),
        prisma.staff.count({ where }),
      ]);
      res.json({ staff, totalCount });
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ error: 'An error occurred while fetching staff.' });
    }
  });

  /**
   * @swagger
   * /staff:
   *   post:
   *     summary: Create a new staff member
   *     tags: [Staff]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/StaffCreate'
   *     responses:
   *       201:
   *         description: Staff member created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Staff'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       500:
   *         description: Internal server error
   */
  // Create a new staff member
  router.post('/', checkAdmin, async (req, res) => {
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

  /**
   * @swagger
   * /staff/{id}:
   *   get:
   *     summary: Get a single staff member by ID
   *     tags: [Staff]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Staff member ID
   *     responses:
   *       200:
   *         description: Staff member details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Staff'
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       404:
   *         description: Staff member not found
   *       500:
   *         description: Internal server error
   */
  // GET a single staff member by ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const staff = await prisma.staff.findUnique({
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

  /**
   * @swagger
   * /staff/{id}:
   *   put:
   *     summary: Update a staff member by ID
   *     tags: [Staff]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Staff member ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/StaffUpdate'
   *     responses:
   *       200:
   *         description: Staff member updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Staff'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Staff member not found
   *       500:
   *         description: Internal server error
   */
  // Update a staff member
  router.put('/:id', checkAdmin, async (req, res) => {
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

  /**
   * @swagger
   * /staff/{id}:
   *   delete:
   *     summary: Delete a staff member by ID
   *     tags: [Staff]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Staff member ID
   *     responses:
   *       204:
   *         description: Staff member deleted successfully
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Staff member not found
   *       500:
   *         description: Internal server error
   */
  // Delete a staff member
  router.delete('/:id', checkAdmin, async (req, res) => {
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