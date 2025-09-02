const request = require('supertest');
const app = require('../index');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

describe('Proyectos Routes (e2e)', () => {
  let prisma;
  let token;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./test.db';
    prisma = new PrismaClient();
    await prisma.$connect();
    token = jwt.sign({ userId: 1 }, 'sigmalion');
  });

  beforeEach(async () => {
    // Limpiar la base de datos antes de cada prueba
    await prisma.proyecto.deleteMany({});
    await prisma.cliente.deleteMany({});
    await prisma.staff.deleteMany({});
    await prisma.integracion.deleteMany({});
    await prisma.usuario.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/proyectos', () => {
    it('should return a list of projects', async () => {
      const res = await request(app)
        .get('/api/proyectos')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('proyectos');
      expect(res.body).toHaveProperty('totalCount');
    });
  });

  describe('POST /api/proyectos', () => {
    it('should create a new project', async () => {
      const newProyecto = { titulo_proyecto: 'New Project' };
      const res = await request(app)
        .post('/api/proyectos')
        .set('Authorization', `Bearer ${token}`)
        .send(newProyecto);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('GET /api/proyectos/:id', () => {
    it('should return a single project', async () => {
      const newProyecto = await prisma.proyecto.create({ data: { titulo_proyecto: 'Test Project' } });
      const res = await request(app)
        .get(`/api/proyectos/${newProyecto.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', newProyecto.id);
    });

    it('should return 404 if project not found', async () => {
      const res = await request(app)
        .get('/api/proyectos/9999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/proyectos/:id', () => {
    it('should update a project', async () => {
      const newProyecto = await prisma.proyecto.create({ data: { titulo_proyecto: 'Test Project' } });
      const updatedProyecto = { titulo_proyecto: 'Updated Project' };
      const res = await request(app)
        .put(`/api/proyectos/${newProyecto.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedProyecto);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('titulo_proyecto', 'Updated Project');
    });
  });

  describe('DELETE /api/proyectos/:id', () => {
    it('should delete a project', async () => {
      const newProyecto = await prisma.proyecto.create({ data: { titulo_proyecto: 'Test Project' } });
      const res = await request(app)
        .delete(`/api/proyectos/${newProyecto.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(204);
    });
  });
});