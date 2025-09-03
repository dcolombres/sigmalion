const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const charts = [
    {
      title: 'Proyectos por Categoría',
      chartType: 'pie',
      dataType: 'projects-by-category',
      order: 1,
      enabled: true,
    },
    {
      title: 'Staff por Rol',
      chartType: 'bar',
      dataType: 'staff-by-role',
      order: 2,
      enabled: true,
    },
    {
      title: 'Proyectos por Estado',
      chartType: 'doughnut',
      dataType: 'projects-by-status',
      order: 3,
      enabled: true,
    },
  ];

  for (const chart of charts) {
    const existingChart = await prisma.dashboardChart.findFirst({
      where: { dataType: chart.dataType },
    });

    if (!existingChart) {
      await prisma.dashboardChart.create({
        data: chart,
      });
      console.log(`Created chart: ${chart.title}`);
    } else {
      console.log(`Chart already exists: ${chart.title}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
