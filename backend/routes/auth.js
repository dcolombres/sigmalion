const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (prisma, JWT_SECRET) => {
  const router = express.Router();

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nombre
   *               - email
   *               - password
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: User's name
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User's email, must be unique
   *               password:
   *                 type: string
   *                 format: password
   *                 description: User's password
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 userId:
   *                   type: integer
   *       400:
   *         description: Bad request, missing fields
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *       409:
   *         description: Conflict, email already registered
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  router.post('/register', async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Please provide nombre, email, and password.' });
    }

    try {
      const userCount = await prisma.usuario.count();
      const role = userCount === 0 ? 'SUPERADMIN' : 'USER';

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.usuario.create({
        data: {
          nombre,
          email,
          password_hash: hashedPassword,
          role,
        },
      });
      res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Email already registered.' });
      }
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'An error occurred during registration.' });
    }
  });

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Log in a user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User's email
   *               password:
   *                 type: string
   *                 format: password
   *                 description: User's password
   *     responses:
   *       200:
   *         description: User logged in successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: JWT authentication token
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     nombre:
   *                       type: string
   *                     email:
   *                       type: string
   *                     role:
   *                       type: string
   *                       enum: [USER, ADMIN, SUPERADMIN]
   *       400:
   *         description: Bad request, missing fields
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *       401:
   *         description: Unauthorized, invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    try {
      const user = await prisma.usuario.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email, nombre: user.nombre, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

      res.json({
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'An error occurred during login.' });
    }
  });

  return router;
};