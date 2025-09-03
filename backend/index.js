const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const dashboardConfigRoutes = require('./routes/dashboardConfig'); // New import

const { checkAdmin, checkSuperAdmin } = require('./middleware/rbac');

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'SigmaLion API',
      version: '1.0.0',
      description: 'API Documentation for SigmaLion project',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/auth', authRoutes(prisma, JWT_SECRET));
app.use('/api/proyectos', proyectosRoutes(prisma, authenticateToken, checkAdmin));
app.use('/api/staff', authenticateToken, staffRoutes(prisma));
app.use('/api/integraciones', authenticateToken, integracionesRoutes(prisma));
app.use('/api/users', authenticateToken, usersRoutes(prisma));
app.use('/api/clientes', authenticateToken, clientesRoutes(prisma));
app.use('/api/admin', authenticateToken, checkAdmin, adminRoutes(prisma));
app.use('/api/dashboard', authenticateToken, dashboardRoutes(prisma));
app.use('/api/dashboard-config', authenticateToken, checkAdmin, dashboardConfigRoutes(prisma)); // New route

// Health check endpoint para testing
app.get('/api/health', (req, res) => {
  console.log('✅ Health check endpoint hit');
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;