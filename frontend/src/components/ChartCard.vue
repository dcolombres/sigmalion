<template>
  <div class="chart-card">
    <h3>{{ chart.title }}</h3>
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import { useAuthStore } from '@/stores/auth';

Chart.register(...registerables);

const props = defineProps({
  chart: {
    type: Object,
    required: true,
  },
});

const chartCanvas = ref(null);
const authStore = useAuthStore();
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const fetchData = async () => {
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    // Corrected endpoint to match the dynamic dataType
    const response = await axios.get(`${API_BASE_URL}/dashboard/${props.chart.dataType.replace(/([A-Z])/g, '-$1').toLowerCase()}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for ${props.chart.dataType}:`, error);
    return [];
  }
};

const formatDataForChart = (data) => {
  if (!data || data.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Generic formatter, assumes first property is label, second is value
  const labels = data.map(item => item[Object.keys(item)[0]]);
  const values = data.map(item => item[Object.keys(item)[1]]);

  return {
    labels,
    datasets: [
      {
        label: props.chart.title,
        data: values,
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
};

onMounted(async () => {
  const rawData = await fetchData();
  const chartData = formatDataForChart(rawData);

  if (chartCanvas.value && chartData.labels.length > 0) {
    new Chart(chartCanvas.value, {
      type: props.chart.chartType,
      data: chartData,
      options: props.chart.options ? JSON.parse(props.chart.options) : {},
    });
  } else if (chartCanvas.value) {
      const ctx = chartCanvas.value.getContext('2d');
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No hay datos disponibles para este gráfico', chartCanvas.value.width / 2, chartCanvas.value.height / 2);
  }
});
</script>

<style scoped>
.chart-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #e9ecef;
}

.chart-card h3 {
  margin-top: 0;
  font-size: 1.2rem;
  color: #343a40;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.chart-container {
  position: relative;
  min-height: 300px; /* Increased height for better visibility */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>