
const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    proyecto: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (promises) => Promise.all(promises)),
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const authenticateToken = (req, res, next) => {
  req.user = { id: 1 };
  next();
};

jest.doMock('../routes/proyectos', () => {
  const originalModule = jest.requireActual('../routes/proyectos');
  return originalModule(new PrismaClient(), authenticateToken);
});

describe('Proyectos Routes', () => {
  let app;
  let prisma;

  beforeEach(() => {
    jest.resetModules();
    app = require('../index');
    prisma = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/proyectos', () => {
    it('should return a list of projects', async () => {
      const mockProyectos = [{ id: 1, titulo_proyecto: 'Test Project' }];
      prisma.proyecto.findMany.mockResolvedValue(mockProyectos);
      prisma.proyecto.count.mockResolvedValue(1);

      const res = await request(app).get('/api/proyectos');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('proyectos', mockProyectos);
      expect(res.body).toHaveProperty('totalCount', 1);
    });
  });

  describe('POST /api/proyectos', () => {
    it('should create a new project', async () => {
      const newProyecto = { titulo_proyecto: 'New Project' };
      prisma.proyecto.create.mockResolvedValue({ id: 2, ...newProyecto });

      const res = await request(app)
        .post('/api/proyectos')
        .send(newProyecto);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id', 2);
    });
  });

  describe('GET /api/proyectos/:id', () => {
    it('should return a single project', async () => {
      const mockProyecto = { id: 1, titulo_proyecto: 'Test Project' };
      prisma.proyecto.findUnique.mockResolvedValue(mockProyecto);

      const res = await request(app).get('/api/proyectos/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockProyecto);
    });

    it('should return 404 if project not found', async () => {
      prisma.proyecto.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/proyectos/99');

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/proyectos/:id', () => {
    it('should update a project', async () => {
      const updatedProyecto = { id: 1, titulo_proyecto: 'Updated Project' };
      prisma.proyecto.update.mockResolvedValue(updatedProyecto);

      const res = await request(app)
        .put('/api/proyectos/1')
        .send({ titulo_proyecto: 'Updated Project' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedProyecto);
    });
  });

  describe('DELETE /api/proyectos/:id', () => {
    it('should delete a project', async () => {
      prisma.proyecto.delete.mockResolvedValue({});

      const res = await request(app).delete('/api/proyectos/1');

      expect(res.statusCode).toEqual(204);
    });
  });
});
