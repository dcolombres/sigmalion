<template>
  <div class="dashboard-config-manager p-3 border rounded mt-4">
    <h4 class="mb-3">Gestión de Gráficos del Dashboard</h4>
    <button class="btn btn-primary btn-sm mb-3" @click="openModal()">
      <i class="fas fa-plus"></i> Crear Nuevo Gráfico
    </button>

    <ul class="list-group">
      <li v-for="chart in charts" :key="chart.id" class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>{{ chart.title }}</strong> (Tipo: {{ chart.chartType }}, Datos: {{ chart.dataType }})
          <span :class="['badge', chart.enabled ? 'bg-success' : 'bg-secondary', 'ms-2']">
            {{ chart.enabled ? 'Visible' : 'Oculto' }}
          </span>
        </div>
        <div>
          <button class="btn btn-outline-secondary btn-sm me-2" @click="openModal(chart)">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn btn-outline-danger btn-sm" @click="deleteChart(chart.id)">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </li>
    </ul>

    <!-- Modal for Create/Edit -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar Gráfico' : 'Crear Nuevo Gráfico' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="title" class="form-label">Título</label>
                <input type="text" class="form-control" id="title" v-model="currentChart.title" required>
              </div>
              <div class="mb-3">
                <label for="chartType" class="form-label">Tipo de Gráfico</label>
                <select class="form-select" id="chartType" v-model="currentChart.chartType" required>
                  <option value="bar">Barra</option>
                  <option value="pie">Torta (Pie)</option>
                  <option value="doughnut">Dona (Doughnut)</option>
                  <option value="line">Línea</option>
                  <option value="polarArea">Área Polar</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="dataType" class="form-label">Fuente de Datos</label>
                <select class="form-select" id="dataType" v-model="currentChart.dataType" required>
                  <option v-for="dt in dataTypes" :key="dt.id" :value="dt.id">{{ dt.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="order" class="form-label">Orden</label>
                <input type="number" class="form-control" id="order" v-model.number="currentChart.order">
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="enabled" v-model="currentChart.enabled">
                <label class="form-check-label" for="enabled">
                  Habilitado en el Dashboard
                </label>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn btn-primary">{{ isEditing ? 'Guardar Cambios' : 'Crear' }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const charts = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const currentChart = ref({});
const dataTypes = ref([]);

const defaultChart = {
  title: '',
  chartType: 'bar',
  dataType: 'projects-by-category',
  order: 0,
  enabled: true,
  options: '{}', // Default empty JSON
};

const fetchCharts = async () => {
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get(`${API_BASE_URL}/dashboard-config`, { headers });
    charts.value = response.data.sort((a, b) => a.order - b.order);
  } catch (error) {
    notificationStore.showNotification('Error al cargar la configuración de gráficos.', 'error');
    console.error('Error fetching chart configs:', error);
  }
};

const openModal = (chart = null) => {
  if (chart) {
    isEditing.value = true;
    currentChart.value = { ...chart };
  } else {
    isEditing.value = false;
    currentChart.value = { ...defaultChart };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  currentChart.value = {};
};

const handleSubmit = async () => {
  const headers = { Authorization: `Bearer ${authStore.token}` };
  const data = { ...currentChart.value };
  // Ensure options is a valid JSON string
  if (typeof data.options !== 'string' || data.options.trim() === '') {
      data.options = '{}';
  }

  try {
    if (isEditing.value) {
      await axios.put(`${API_BASE_URL}/dashboard-config/${data.id}`, data, { headers });
      notificationStore.showNotification('Gráfico actualizado correctamente.', 'success');
    } else {
      await axios.post(`${API_BASE_URL}/dashboard-config`, data, { headers });
      notificationStore.showNotification('Gráfico creado correctamente.', 'success');
    }
    fetchCharts();
    closeModal();
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Ocurrió un error.';
    notificationStore.showNotification(`Error: ${errorMessage}`, 'error');
    console.error('Error submitting chart config:', error);
  }
};

const deleteChart = async (id) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este gráfico?')) {
    return;
  }
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.delete(`${API_BASE_URL}/dashboard-config/${id}`, { headers });
    notificationStore.showNotification('Gráfico eliminado correctamente.', 'success');
    fetchCharts();
  } catch (error) {
    notificationStore.showNotification('Error al eliminar el gráfico.', 'error');
    console.error('Error deleting chart config:', error);
  }
};

const fetchDataTypes = async () => {
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get(`${API_BASE_URL}/dashboard/data-types`, { headers });
    dataTypes.value = response.data;
    // Set a default dataType for new charts if the list is not empty
    if (response.data.length > 0) {
      defaultChart.dataType = response.data[0].id;
    }
  } catch (error) {
    notificationStore.showNotification('Error al cargar los tipos de datos.', 'error');
    console.error('Error fetching data types:', error);
  }
};

onMounted(() => {
  fetchCharts();
  fetchDataTypes();
});
</script>

<style scoped>
.dashboard-config-manager {
  background-color: #f8f9fa;
}
.modal.d-block {
  background-color: rgba(0, 0, 0, 0.5);
}
.list-group-item {
    word-break: break-word;
}
</style>
