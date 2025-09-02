
const request = require('supertest');
const app = require('../index');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

describe('Clientes Routes (e2e)', () => {
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

  describe('GET /api/clientes', () => {
    it('should return a list of clientes', async () => {
      const res = await request(app)
        .get('/api/clientes')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('clientes');
      expect(Array.isArray(res.body.clientes)).toBe(true);
      expect(res.body).toHaveProperty('totalCount');
    });
  });

  describe('POST /api/clientes', () => {
    it('should create a new cliente', async () => {
      const newCliente = { cliente: 'Test Client' };
      const res = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send(newCliente);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('GET /api/clientes/:id', () => {
    it('should return a single cliente', async () => {
      const newCliente = await prisma.cliente.create({ data: { cliente: 'Test Client' } });
      const res = await request(app)
        .get(`/api/clientes/${newCliente.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', newCliente.id);
    });

    it('should return 404 if cliente not found', async () => {
      const res = await request(app)
        .get('/api/clientes/9999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/clientes/:id', () => {
    it('should update a cliente', async () => {
      const newCliente = await prisma.cliente.create({ data: { cliente: 'Test Client' } });
      const updatedCliente = { cliente: 'Updated Client' };
      const res = await request(app)
        .put(`/api/clientes/${newCliente.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedCliente);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('cliente', 'Updated Client');
    });
  });

  describe('DELETE /api/clientes/:id', () => {
    it('should delete a cliente', async () => {
      const newCliente = await prisma.cliente.create({ data: { cliente: 'Test Client' } });
      const res = await request(app)
        .delete(`/api/clientes/${newCliente.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(204);
    });
  });
});
