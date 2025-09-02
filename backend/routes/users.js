const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { checkAdmin } = require('../middleware/rbac');

module.exports = (prisma) => {
  const router = express.Router();

  const userSchema = Joi.object({
    nombre: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('USER', 'ADMIN', 'SUPERADMIN').optional()
  });

  const userUpdateSchema = Joi.object({
    nombre: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(8),
    role: Joi.string().valid('USER', 'ADMIN', 'SUPERADMIN').optional()
  });

  /**
   * @swagger
   * tags:
   *   name: Users
   *   description: API for managing users
   */

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Get all users with search and pagination
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term for name or email
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
   *         description: A list of users
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 users:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/UserSummary'
   *                 totalCount:
   *                   type: integer
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       500:
   *         description: Internal server error
   */
  // GET all users with search and pagination
  router.get('/', async (req, res) => {
    const { search, page, pageSize } = req.query;
    const take = parseInt(pageSize, 10) || 10; // Default page size to 10
    const skip = (parseInt(page, 10) - 1) * take || 0; // Default to first page

    let where = {};
    if (search) {
      where = {
        OR: [
          { nombre: { contains: search } },
          { email: { contains: search } },
        ],
      };
    }

    try {
      const [users, totalCount] = await prisma.$transaction([
        prisma.usuario.findMany({
          where,
          skip,
          take,
          select: { id: true, nombre: true, email: true, role: true } // Include role
        }),
        prisma.usuario.count({ where }),
      ]);
      res.json({ users, totalCount });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
  });

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create a new user (admin-style)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserCreate'
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       409:
   *         description: Conflict, email already in use
   *       500:
   *         description: Internal server error
   */
  // Create a new user (admin-style)
  router.post('/', checkAdmin, async (req, res) => {
    const { error, value } = userSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nombre, email, password, role } = value;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.usuario.create({
        data: {
          nombre,
          email,
          password_hash: hashedPassword,
          role
        },
      });
      res.status(201).json({ id: user.id, nombre: user.nombre, email: user.email, role: user.role });
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Email already registered.' });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'An error occurred while creating the user.' });
    }
  });

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Get a single user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: User ID
   *     responses:
   *       200:
   *         description: User details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  // GET a single user by ID
  router.get('/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.usuario.findUnique({
        where: { id: parseInt(id, 10) },
        select: { id: true, nombre: true, email: true, role: true } // Include role
      });
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'An error occurred while fetching user.' });
    }
  });

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Update a user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserUpdate'
   *     responses:
   *       200:
   *         description: User updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: User not found
   *       409:
   *         description: Conflict, email already in use
   *       500:
   *         description: Internal server error
   */
  // Update a user
  router.put('/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { error, value } = userUpdateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nombre, email, password, role } = value;
    let dataToUpdate = { nombre, email, role };

    if (password) {
      dataToUpdate.password_hash = await bcrypt.hash(password, 10);
    }

    try {
      const updatedUser = await prisma.usuario.update({
        where: { id: parseInt(id, 10) },
        data: dataToUpdate,
        select: { id: true, nombre: true, email: true, role: true } // Include role
      });
      res.json(updatedUser);
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Email already in use.' });
      }
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'An error occurred while updating the user.' });
    }
  });

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Delete a user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: User ID
   *     responses:
   *       204:
   *         description: User deleted successfully
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  // Delete a user
  router.delete('/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.usuario.delete({
        where: { id: parseInt(id, 10) },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'An error occurred while deleting the user.' });
    }
  });

  return router;
};