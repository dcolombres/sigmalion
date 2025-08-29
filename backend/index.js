const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

const authRoutes = require('./routes/auth');
const proyectosRoutes = require('./routes/proyectos');
const staffRoutes = require('./routes/staff');
const integracionesRoutes = require('./routes/integraciones');
const usersRoutes = require('./routes/users');
const clientesRoutes = require('./routes/clientes');
const tecnologiasRoutes = require('./routes/tecnologias');

app.use('/api/auth', authRoutes(prisma, JWT_SECRET));
app.use('/api/proyectos', proyectosRoutes(prisma, authenticateToken));
app.use('/api/staff', staffRoutes(prisma, authenticateToken));
app.use('/api/integraciones', integracionesRoutes(prisma, authenticateToken));
app.use('/api/users', usersRoutes(prisma, authenticateToken));
app.use('/api/clientes', clientesRoutes(prisma, authenticateToken));

// Health check endpoint para testing
app.get('/api/health', (req, res) => {
  console.log('✅ Health check endpoint hit');
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});