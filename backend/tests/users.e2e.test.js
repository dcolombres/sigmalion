const request = require('supertest');
const app = require('../index');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => Promise.resolve(hash === `hashed_${password}`)),
}));

describe('Users Routes (e2e)', () => {
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

  describe('GET /api/users', () => {
    it('should return a list of users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('totalCount');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = { nombre: 'Test User', email: 'test@example.com', password: 'password123' };
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', newUser.email);
    });

    it('should not create a user with existing email', async () => {
      await prisma.usuario.create({ data: { nombre: 'Existing User', email: 'existing@example.com', password_hash: 'hashed_password' } });
      const newUser = { nombre: 'Another User', email: 'existing@example.com', password: 'password123' };
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error', 'Email already registered.');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a single user', async () => {
      const newUser = await prisma.usuario.create({ data: { nombre: 'Single User', email: 'single@example.com', password_hash: 'hashed_password' } });
      const res = await request(app)
        .get(`/api/users/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', newUser.id);
      expect(res.body).toHaveProperty('email', newUser.email);
    });

    it('should return 404 if user not found', async () => {
      const res = await request(app)
        .get('/api/users/9999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      const newUser = await prisma.usuario.create({ data: { nombre: 'User to Update', email: 'update@example.com', password_hash: 'hashed_password' } });
      const updatedUser = { nombre: 'Updated User', password: 'newpassword' };
      const res = await request(app)
        .put(`/api/users/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedUser);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('nombre', 'Updated User');
    });

    it('should not update user email to existing email', async () => {
      await prisma.usuario.create({ data: { nombre: 'User A', email: 'userA@example.com', password_hash: 'hashed_password' } });
      const userB = await prisma.usuario.create({ data: { nombre: 'User B', email: 'userB@example.com', password_hash: 'hashed_password' } });
      const updatedUser = { email: 'userA@example.com' };
      const res = await request(app)
        .put(`/api/users/${userB.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedUser);
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error', 'Email already in use.');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const newUser = await prisma.usuario.create({ data: { nombre: 'User to Delete', email: 'delete@example.com', password_hash: 'hashed_password' } });
      const res = await request(app)
        .delete(`/api/users/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(204);
    });
  });
});