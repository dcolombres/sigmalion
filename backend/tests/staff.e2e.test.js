const request = require('supertest');
const app = require('../index');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

describe('Staff Routes (e2e)', () => {
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

  describe('GET /api/staff', () => {
    it('should return a list of staff', async () => {
      const res = await request(app)
        .get('/api/staff')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('staff');
      expect(res.body).toHaveProperty('totalCount');
    });
  });

  describe('POST /api/staff', () => {
    it('should create a new staff member', async () => {
      const newStaff = { nombre_completo: 'John Doe' };
      const res = await request(app)
        .post('/api/staff')
        .set('Authorization', `Bearer ${token}`)
        .send(newStaff);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('GET /api/staff/:id', () => {
    it('should return a single staff member', async () => {
      const newStaff = await prisma.staff.create({ data: { nombre_completo: 'Jane Doe' } });
      const res = await request(app)
        .get(`/api/staff/${newStaff.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', newStaff.id);
    });

    it('should return 404 if staff member not found', async () => {
      const res = await request(app)
        .get('/api/staff/9999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/staff/:id', () => {
    it('should update a staff member', async () => {
      const newStaff = await prisma.staff.create({ data: { nombre_completo: 'John Smith' } });
      const updatedStaff = { nombre_completo: 'John Smith Jr.' };
      const res = await request(app)
        .put(`/api/staff/${newStaff.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedStaff);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('nombre_completo', 'John Smith Jr.');
    });
  });

  describe('DELETE /api/staff/:id', () => {
    it('should delete a staff member', async () => {
      const newStaff = await prisma.staff.create({ data: { nombre_completo: 'Jane Smith' } });
      const res = await request(app)
        .delete(`/api/staff/${newStaff.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(204);
    });
  });
});