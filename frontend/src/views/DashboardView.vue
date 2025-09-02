<template>
  <div class="dashboard-view">
    <h1>Dashboard de Analíticas</h1>
    <p class="subtitle">
      Visualización dinámica de datos clave sobre proyectos y recursos.
    </p>

    <div v-if="loading" class="loading-message">
      <p>Cargando configuraciones del dashboard...</p>
    </div>

    <div v-else-if="charts.length === 0" class="no-charts-message">
      <p>No hay gráficos configurados para mostrar en el dashboard.</p>
      <p>Por favor, contacte a un administrador para agregar nuevos gráficos.</p>
    </div>

    <div v-else class="charts-grid">
      <ChartCard
        v-for="chart in charts"
        :key="chart.id"
        :chart="chart"
      />
    </div>

    <div class="consultas-section">
      <h2>Consultas y Reportes</h2>
      <p>Esta sección permitirá generar reportes personalizados.</p>
      <p class="coming-soon-text">
        Funcionalidad próximamente...
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import ChartCard from '@/components/ChartCard.vue'; // Import the new component

const authStore = useAuthStore();
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const charts = ref([]);
const loading = ref(true);

const fetchChartConfigs = async () => {
  loading.value = true;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get(`${API_BASE_URL}/dashboard-config`, { headers });
    // Filter only enabled charts
    charts.value = response.data.filter(chart => chart.enabled);
  } catch (error) {
    console.error('Error fetching dashboard configurations:', error);
    charts.value = []; // Clear charts on error
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchChartConfigs();
});
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
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.loading-message, .no-charts-message {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.consultas-section {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #e9ecef;
}

.consultas-section h2 {
  margin-top: 0;
  font-size: 1.2rem;
  color: #343a40;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.coming-soon-text {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  width: 100%;
}
</style>
