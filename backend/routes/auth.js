const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (prisma, JWT_SECRET) => {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Please provide nombre, email, and password.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.usuario.create({
        data: {
          nombre,
          email,
          password_hash: hashedPassword,
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

      const token = jwt.sign({ userId: user.id, email: user.email, nombre: user.nombre }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'An error occurred during login.' });
    }
  });

  return router;
};