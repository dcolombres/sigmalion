const express = require('express');
const Joi = require('joi');
const { checkAdmin } = require('../middleware/rbac');

module.exports = (prisma) => {
  const router = express.Router();

  const dashboardChartSchema = Joi.object({
    title: Joi.string().required(),
    chartType: Joi.string().valid('bar', 'pie', 'line', 'doughnut', 'polarArea').required(), // Define allowed chart types
    dataType: Joi.string().required(), // e.g., 'projectsByCategory', 'staffByRole', 'totalCounts'
    options: Joi.string().allow(null, ''), // JSON string for chart-specific options
    order: Joi.number().integer().min(0).default(0),
    enabled: Joi.boolean().default(true),
  }).unknown(true);

  /**
   * @swagger
   * tags:
   *   name: DashboardConfig
   *   description: API for managing dashboard chart configurations
   */

  /**
   * @swagger
   * /dashboard-config:
   *   get:
   *     summary: Get all dashboard chart configurations
   *     tags: [DashboardConfig]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of dashboard chart configurations
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/DashboardChart'
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       500:
   *         description: Internal server error
   */
  router.get('/', async (req, res) => {
    try {
      const charts = await prisma.dashboardChart.findMany({
        orderBy: { order: 'asc' },
      });
      res.json(charts);
    } catch (error) {
      console.error('Error fetching dashboard charts:', error);
      res.status(500).json({ error: 'An error occurred while fetching dashboard charts.' });
    }
  });

  /**
   * @swagger
   * /dashboard-config:
   *   post:
   *     summary: Create a new dashboard chart configuration
   *     tags: [DashboardConfig]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DashboardChartCreate'
   *     responses:
   *       201:
   *         description: Dashboard chart configuration created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DashboardChart'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       500:
   *         description: Internal server error
   */
  router.post('/', async (req, res) => {
    const { error, value } = dashboardChartSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const newChart = await prisma.dashboardChart.create({
        data: value,
      });
      res.status(201).json(newChart);
    } catch (error) {
      console.error('Error creating dashboard chart:', error);
      res.status(500).json({ error: 'An error occurred while creating the dashboard chart.' });
    }
  });

  /**
   * @swagger
   * /dashboard-config/{id}:
   *   put:
   *     summary: Update a dashboard chart configuration by ID
   *     tags: [DashboardConfig]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Dashboard chart ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DashboardChartUpdate'
   *     responses:
   *       200:
   *         description: Dashboard chart configuration updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DashboardChart'
   *       400:
   *         description: Bad request, validation error
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Dashboard chart not found
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { error, value } = dashboardChartSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const updatedChart = await prisma.dashboardChart.update({
        where: { id: parseInt(id, 10) },
        data: value,
      });
      res.json(updatedChart);
    } catch (error) {
      console.error('Error updating dashboard chart:', error);
      res.status(500).json({ error: 'An error occurred while updating the dashboard chart.' });
    }
  });

  /**
   * @swagger
   * /dashboard-config/{id}:
   *   delete:
   *     summary: Delete a dashboard chart configuration by ID
   *     tags: [DashboardConfig]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Dashboard chart ID
   *     responses:
   *       204:
   *         description: Dashboard chart configuration deleted successfully
   *       401:
   *         description: Unauthorized, no token or invalid token
   *       403:
   *         description: Forbidden, user not an admin
   *       404:
   *         description: Dashboard chart not found
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.dashboardChart.delete({
        where: { id: parseInt(id, 10) },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting dashboard chart:', error);
      res.status(500).json({ error: 'An error occurred while deleting the dashboard chart.' });
    }
  });

  return router;
};