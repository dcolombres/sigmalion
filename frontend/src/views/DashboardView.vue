<template>
  <div class="dashboard-view">
    <h1>Dashboard de Analíticas</h1>
    <p class="subtitle">Visualización de datos clave sobre proyectos y recursos. Nuevas analíticas próximamente.</p>

    <div class="charts-grid">
      <div class="chart-placeholder">
        <h3>Proyectos por Estado</h3>
        <div class="chart-content">
          <p class="coming-soon-text">Gráfico de torta próximamente...</p>
        </div>
      </div>
      <div class="chart-placeholder">
        <h3>Proyectos por Categoría</h3>
        <div class="chart-content">
          <p class="coming-soon-text">Gráfico de barras próximamente...</p>
        </div>
      </div>
      <div class="chart-placeholder">
        <h3>Staff por Rol</h3>
        <div class="chart-content">
          <p class="coming-soon-text">Gráfico de torta próximamente...</p>
        </div>
      </div>
      <div class="chart-placeholder">
        <h3>Staff por Experiencia</h3>
        <div class="chart-content">
          <p class="coming-soon-text">Gráfico de barras próximamente...</p>
        </div>
      </div>
    </div>

    <div class="consultas-section">
      <h2>Consultas y Reportes</h2>
      <p>Esta sección permitirá generar reportes personalizados.</p>
      <p class="coming-soon-text">Funcionalidad próximamente...</p>
    </div>

  </div>
</template>

<script setup>
// Lógica del script si fuera necesaria en el futuro
</script>

<style scoped>
.dashboard-view {
  padding: 2rem;
}

.subtitle {
  color: #6c757d;
  margin-bottom: 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.chart-placeholder, .consultas-section {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #e9ecef;
}

.chart-placeholder h3, .consultas-section h2 {
  margin-top: 0;
  font-size: 1.2rem;
  color: #343a40;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.chart-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}

.coming-soon-text {
  color: #6c757d;
  font-style: italic;
  text-align: center;
}
</style>