const express = require('express');
const { checkAdmin } = require('../middleware/rbac');

module.exports = (prisma) => {
  const router = express.Router();

  router.get('/data-types', (req, res) => {
    const dataTypes = [
      { id: 'projects-by-category', name: 'Proyectos por Categoría' },
      { id: 'projects-by-status', name: 'Proyectos por Estado' },
      { id: 'staff-by-role', name: 'Staff por Rol' },
      { id: 'projects-by-tier', name: 'Proyectos por Tier' },
      { id: 'projects-by-subcategory', name: 'Proyectos por Subcategoría' },
      { id: 'projects-by-dev-language', name: 'Proyectos por Lenguaje de Desarrollo' },
      { id: 'projects-by-database', name: 'Proyectos por Base de Datos' },
      { id: 'projects-by-infra-hosting', name: 'Proyectos por Alojamiento de Infraestructura' },
    ];
    res.json(dataTypes);
  });

  router.get('/counts', async (req, res, next) => {
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
      next(error);
    }
  });

  const createGroupByRoute = (path, model, field) => {
    router.get(`/${path}`, async (req, res, next) => {
      try {
        const result = await prisma[model].groupBy({
          by: [field],
          _count: {
            [field]: true,
          },
        });
        const formattedData = result.map(item => ({
          name: item[field] || `Sin ${field}`,
          count: item._count[field],
        }));
        res.json(formattedData);
      } catch (error) {
        next(error);
      }
    });
  };

  createGroupByRoute('projects-by-category', 'proyecto', 'categoria');
  createGroupByRoute('projects-by-status', 'proyecto', 'estado');
  createGroupByRoute('staff-by-role', 'staff', 'rol');
  createGroupByRoute('projects-by-tier', 'proyecto', 'tier');
  createGroupByRoute('projects-by-subcategory', 'proyecto', 'subcategoria');
  createGroupByRoute('projects-by-dev-language', 'tecnologias', 'lenguaje_desarrollo');
  createGroupByRoute('projects-by-database', 'tecnologias', 'base_datos');
  createGroupByRoute('projects-by-infra-hosting', 'tecnologias', 'alojamiento_infra');

  return router;
};