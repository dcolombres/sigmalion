const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

module.exports = (prisma, authenticateToken) => {
  const router = express.Router();

  const userSchema = Joi.object({
    nombre: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });

  const userUpdateSchema = Joi.object({
    nombre: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(8),
  });

  // GET all users with search and pagination
  router.get('/', authenticateToken, async (req, res) => {
    const { search, page, pageSize } = req.query;
    const take = parseInt(pageSize, 10) || 10; // Default page size to 10
    const skip = (parseInt(page, 10) - 1) * take || 0; // Default to first page

    let where = {};
    if (search) {
      where = {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    try {
      const [users, totalCount] = await prisma.$transaction([
        prisma.usuario.findMany({
          where,
          skip,
          take,
          select: { id: true, nombre: true, email: true } // Do not return password hash
        }),
        prisma.usuario.count({ where }),
      ]);
      res.json({ users, totalCount });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
  });

  // Create a new user (admin-style)
  router.post('/', authenticateToken, async (req, res) => {
    const { error, value } = userSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nombre, email, password } = value;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.usuario.create({
        data: {
          nombre,
          email,
          password_hash: hashedPassword,
        },
      });
      res.status(201).json({ id: user.id, nombre: user.nombre, email: user.email });
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Email already registered.' });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'An error occurred while creating the user.' });
    }
  });

  // GET a single user by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.usuario.findUnique({
        where: { id: parseInt(id, 10) },
        select: { id: true, nombre: true, email: true } // Do not return password hash
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

  // Update a user
  router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { error, value } = userUpdateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nombre, email, password } = value;
    let dataToUpdate = { nombre, email };

    if (password) {
      dataToUpdate.password_hash = await bcrypt.hash(password, 10);
    }

    try {
      const updatedUser = await prisma.usuario.update({
        where: { id: parseInt(id, 10) },
        data: dataToUpdate,
        select: { id: true, nombre: true, email: true } // Do not return password hash
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

  // Delete a user
  router.delete('/:id', authenticateToken, async (req, res) => {
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