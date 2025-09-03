const request = require('supertest');
const app = require('../index');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

describe('Integraciones Routes (e2e)', () => {
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

  describe('GET /api/integraciones', () => {
    it('should return a list of integrations', async () => {
      const res = await request(app)
        .get('/api/integraciones')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('integraciones');
      expect(res.body).toHaveProperty('totalCount');
    });
  });

  describe('POST /api/integraciones', () => {
    it('should create a new integration', async () => {
      const newIntegracion = { nombre: 'Test Integracion', detalles: 'Some details' };
      const res = await request(app)
        .post('/api/integraciones')
        .set('Authorization', `Bearer ${token}`)
        .send(newIntegracion);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('GET /api/integraciones/:id', () => {
    it('should return a single integration', async () => {
      const newIntegracion = await prisma.integracion.create({ data: { nombre: 'Test Integracion', detalles: 'Some details' } });
      const res = await request(app)
        .get(`/api/integraciones/${newIntegracion.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', newIntegracion.id);
    });

    it('should return 404 if integration not found', async () => {
      const res = await request(app)
        .get('/api/integraciones/9999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/integraciones/:id', () => {
    it('should update an integration', async () => {
      const newIntegracion = await prisma.integracion.create({ data: { nombre: 'Test Integracion', detalles: 'Some details' } });
      const updatedIntegracion = { nombre: 'Updated Integracion', detalles: 'Updated details' };
      const res = await request(app)
        .put(`/api/integraciones/${newIntegracion.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedIntegracion);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('nombre', 'Updated Integracion');
    });
  });

  describe('DELETE /api/integraciones/:id', () => {
    it('should delete an integration', async () => {
      const newIntegracion = await prisma.integracion.create({ data: { nombre: 'Test Integracion', detalles: 'Some details' } });
      const res = await request(app)
        .delete(`/api/integraciones/${newIntegracion.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(204);
    });
  });
});