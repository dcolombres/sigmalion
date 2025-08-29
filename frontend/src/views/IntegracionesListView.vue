<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notification'; // Import notification store

const router = useRouter();
const integracionesList = ref([]);
const error = ref(null);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
const totalIntegraciones = ref(0);

// Use notification store
const notificationStore = useNotificationStore();

// Form state
const showForm = ref(false);
const newIntegracion = ref({
  nombre: '',
  detalles: '',
});

const API_URL = 'http://localhost:3000/api/integraciones';

// Fetch all integrations
const fetchIntegraciones = async () => {
  isLoading.value = true;
  try {
    const params = {
      search: searchQuery.value,
      page: currentPage.value,
      pageSize: pageSize,
    };
    const response = await axios.get(API_URL, { params });
    integracionesList.value = response.data.integraciones;
    totalIntegraciones.value = response.data.totalCount;
    error.value = null;
  } catch (err) {
    console.error('Error fetching integraciones:', err);
    error.value = 'Failed to load integrations. Is the backend server running?';
    notificationStore.showNotification('Error al cargar integraciones.', 'error'); // Show error notification
  } finally {
    isLoading.value = false;
  }
};

// Create a new integration
const createIntegracion = async () => {
  if (!newIntegracion.value.nombre) {
    notificationStore.showNotification('El nombre de la integración es obligatorio.', 'warning'); // Show warning notification
    return;
  }
  try {
    await axios.post(API_URL, newIntegracion.value);
    notificationStore.showNotification('Integración creada exitosamente.', 'success'); // Show success notification
    // Reset form and hide it
    showForm.value = false;
    newIntegracion.value = { nombre: '', detalles: '' };
    fetchIntegraciones(); // Re-fetch integrations after creation
  } catch (err) {
    console.error('Error creating integracion:', err);
    notificationStore.showNotification('Hubo un error al crear la integración.', 'error'); // Show error notification
  }
};

// Watch for changes in searchQuery or currentPage to re-fetch integrations
watch([searchQuery, currentPage], () => {
  fetchIntegraciones();
});

// Pagination methods
const nextPage = () => {
  if (currentPage.value * pageSize < totalIntegraciones.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Fetch integrations when component is mounted
onMounted(() => {
  fetchIntegraciones();
});
</script>

<template>
  <main class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Integraciones</h1>
      <button @click="showForm = !showForm" class="btn btn-primary">
        {{ showForm ? 'Cancelar' : 'Añadir Integración' }}
      </button>
    </div>

    <!-- Search input -->
    <div class="mb-3">
      <input type="text" v-model="searchQuery" placeholder="Buscar por nombre..." class="form-control">
    </div>

    <!-- Form for creating a new integration -->
    <div v-if="showForm" class="card p-4 mb-4">
      <h2 class="card-title">Nueva Integración</h2>
      <form @submit.prevent="createIntegracion">
        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre de la Integración</label>
          <input type="text" id="nombre" v-model="newIntegracion.nombre" class="form-control" required>
        </div>
        <div class="mb-3">
          <label for="detalles" class="form-label">Detalles</label>
          <textarea id="detalles" v-model="newIntegracion.detalles" class="form-control" rows="3"></textarea>
        </div>
        <button type="submit" class="btn btn-success">Guardar Integración</button>
      </form>
    </div>

    <!-- Display existing integrations -->
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Cargando integraciones...</p>
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="integracionesList.length" class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Detalles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="integracion in integracionesList" :key="integracion.id">
            <td>{{ integracion.id }}</td>
            <td>
              <RouterLink :to="{ name: 'integracion-detail', params: { id: integracion.id } }">
                {{ integracion.nombre }}
              </RouterLink>
            </td>
            <td>{{ integracion.detalles ? integracion.detalles.substring(0, 50) + '...' : '' }}</td>
            <td>
              <!-- Actions will go here -->
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination controls -->
      <div class="d-flex justify-content-center align-items-center mt-3">
        <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-secondary me-2">Anterior</button>
        <span>Página {{ currentPage }} de {{ Math.ceil(totalIntegraciones / pageSize) }}</span>
        <button @click="nextPage" :disabled="currentPage * pageSize >= totalIntegraciones" class="btn btn-secondary">Siguiente</button>
      </div>
    </div>
    <div v-else class="alert alert-info" role="alert">
      No hay integraciones que coincidan con la búsqueda.
    </div>
  </main>
</template>

<style scoped>
/* Removed most styles, Bootstrap will handle it */
</style>
