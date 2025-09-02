const request = require('supertest');
const app = require('../index');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('Auth Routes', () => {
  let prisma;
  beforeEach(() => {
    prisma = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpassword');
      prisma.usuario.create.mockResolvedValue({ id: 1, email: 'test@test.com', nombre: 'Test User' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password', nombre: 'Test User' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
      expect(res.body).toHaveProperty('userId', 1);
    });

    it('should not register an existing user', async () => {
      prisma.usuario.create.mockImplementation(() => {
        const error = new Error();
        error.code = 'P2002';
        throw error;
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password', nombre: 'Test User' });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('error', 'Email already registered.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com', password_hash: 'hashedpassword' });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token', 'token');
    });

    it('should not login a user with invalid credentials', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials.');
    });

    it('should not login a user with an invalid password', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com', password_hash: 'hashedpassword' });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials.');
    });
  });
});