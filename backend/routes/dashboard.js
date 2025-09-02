const express = require('express');
const { checkAdmin } = require('../middleware/rbac');

module.exports = (prisma) => {
  const router = express.Router();

  /**
   * @swagger
   * tags:
   *   name: Dashboard
   *   description: API for dashboard statistics
   */

  /**
   * @swagger
   * /dashboard/data-types:
   *   get:
   *     summary: Get all available data types for dashboard charts
   *     tags: [Dashboard]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: An array of available data type objects
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   name:
   *                     type: string
   *       401:
   *         description: Unauthorized, no token or invalid token
   */
  router.get('/data-types', (req, res) => {
    const dataTypes = [
      { id: 'projects-by-category', name: 'Proyectos por Categoría' },
      { id: 'projects-by-status', name: 'Proyectos por Estado' },
      { id: 'staff-by-role', name: 'Staff por Rol' },
      // Future data types can be added here
    ];
    res.json(dataTypes);
  });

  /**
   * @swagger
   * /dashboard/counts:
   *   get:
   *     summary: Get total counts for projects, staff, clients, and integrations
   *     tags: [Dashboard]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Object with total counts
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalProjects: 
   *                   type: integer
   *                 totalStaff:
   *                   type: integer
   *                 totalClients:
   *                   type: integer
   *                 totalIntegrations:
   *                   type: integer
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       500:
   *         description: Internal server error
   */
  router.get('/counts', async (req, res) => {
    try {
      const totalProjects = await prisma.proyecto.count();
      const totalStaff = await prisma.staff.count();
      const totalClients = await prisma.cliente.count();
      const totalIntegrations = await prisma.integracion.count();

      res.json({
        totalProjects,
        totalStaff,
        totalClients,
        totalIntegrations,
      });
    } catch (error) {
      console.error('Error fetching dashboard counts:', error);
      res.status(500).json({ error: 'An error occurred while fetching counts.' });
    }
  });

  /**
   * @swagger
   * /dashboard/projects-by-category:
   *   get:
   *     summary: Get project counts by category
   *     tags: [Dashboard]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Array of objects with category and count
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   category:
   *                     type: string
   *                   count:
   *                     type: integer
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       500:
   *         description: Internal server error
   */
  router.get('/projects-by-category', async (req, res) => {
    try {
      const projectsByCategory = await prisma.proyecto.groupBy({
        by: ['categoria'],
        _count: {
          categoria: true,
        },
      });

      const formattedData = projectsByCategory.map(item => ({
        category: item.categoria || 'Sin Categoría',
        count: item._count.categoria,
      }));

      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching projects by category:', error);
      res.status(500).json({ error: 'An error occurred while fetching projects by category.' });
    }
  });

  /**
   * @swagger
   * /dashboard/projects-by-status:
   *   get:
   *     summary: Get project counts by status
   *     tags: [Dashboard]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Array of objects with status and count
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   status:
   *                     type: string
   *                   count:
   *                     type: integer
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       500:
   *         description: Internal server error
   */
  router.get('/projects-by-status', async (req, res) => {
    try {
      const projectsByStatus = await prisma.proyecto.groupBy({
        by: ['estado'],
        _count: {
          estado: true,
        },
      });

      const formattedData = projectsByStatus.map(item => ({
        status: item.estado || 'Sin Estado',
        count: item._count.estado,
      }));

      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching projects by status:', error);
      res.status(500).json({ error: 'An error occurred while fetching projects by status.' });
    }
  });

  /**
   * @swagger
   * /dashboard/staff-by-role:
   *   get:
   *     summary: Get staff counts by role
   *     tags: [Dashboard]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Array of objects with role and count
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   role:
   *                     type: string
   *                   count:
   *                     type: integer
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       500:
   *         description: Internal server error
   */
  router.get('/staff-by-role', async (req, res) => {
    try {
      const staffByRole = await prisma.staff.groupBy({
        by: ['rol'],
        _count: {
          rol: true,
        },
      });

      const formattedData = staffByRole.map(item => ({
        role: item.rol || 'Sin Rol',
        count: item._count.rol,
      }));

      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching staff by role:', error);
      res.status(500).json({ error: 'An error occurred while fetching staff by role.' });
    }
  });

  return router;
};