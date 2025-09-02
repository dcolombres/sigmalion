const request = require('supertest');
const app = require('../index');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  unlinkSync: jest.fn(),
}));

describe('Admin Routes (e2e)', () => {
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

  describe('GET /api/admin/proyectos/template', () => {
    it('should return a CSV template for projects', async () => {
      const res = await request(app)
        .get('/api/admin/proyectos/template')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('attachment; filename="plantilla_proyectos.csv"');
      // Ajustar la expectativa para que coincida con el formato real (con comillas dobles)
      expect(res.text).toContain('"titulo_proyecto","proyecto_activo","storyline"');
    });
  });

  describe('POST /api/admin/proyectos/import', () => {
    it('should import projects from a CSV file', async () => {
      const csvContent = "titulo_proyecto,proyecto_activo\nTest Project 1,true\nTest Project 2,false";
      const filePath = path.join(__dirname, 'test_proyectos.csv');
      fs.writeFileSync(filePath, csvContent);

      const res = await request(app)
        .post('/api/admin/proyectos/import')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', filePath, 'test_proyectos.csv');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Importación completada. Se crearon 2 nuevos proyectos.');

      const projects = await prisma.proyecto.findMany();
      expect(projects).toHaveLength(2);
      expect(projects[0].titulo_proyecto).toEqual('Test Project 1');
      expect(projects[1].titulo_proyecto).toEqual('Test Project 2');

      fs.unlinkSync(filePath); // Clean up the created file
    });
  });

  describe('GET /api/admin/staff/template', () => {
    it('should return a CSV template for staff', async () => {
      const res = await request(app)
        .get('/api/admin/staff/template')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('attachment; filename="plantilla_staff.csv"');
      // Ajustar la expectativa para que coincida con el formato real (con comillas dobles)
      expect(res.text).toContain('"nombre_completo","contrato","rol"');
    });
  });

  describe('POST /api/admin/staff/import', () => {
    it('should import staff from a CSV file', async () => {
      const csvContent = "nombre_completo,rol\nJohn Doe,Developer\nJane Smith,QA";
      const filePath = path.join(__dirname, 'test_staff.csv');
      fs.writeFileSync(filePath, csvContent);

      const res = await request(app)
        .post('/api/admin/staff/import')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', filePath, 'test_staff.csv');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Importación completada. Se crearon 2 nuevos registros de staff.');

      const staff = await prisma.staff.findMany();
      expect(staff).toHaveLength(2);
      expect(staff[0].nombre_completo).toEqual('John Doe');
      expect(staff[1].nombre_completo).toEqual('Jane Smith');

      fs.unlinkSync(filePath); // Clean up the created file
    });
  });
});