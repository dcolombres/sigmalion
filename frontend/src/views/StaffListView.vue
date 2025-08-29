<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '../stores/notification'; // Import notification store

const staffList = ref([]);
const error = ref(null);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
const totalStaff = ref(0);

// Use notification store
const notificationStore = useNotificationStore();

// Form state
const showForm = ref(false);
const newStaff = ref({
  nombre_completo: '',
  email: '',
  rol: 'Developer', // Default role
  activo: true,
});

const API_URL = 'http://localhost:3000/api/staff';

// Fetch all staff members
const fetchStaff = async () => {
  isLoading.value = true;
  try {
    const params = {
      search: searchQuery.value,
      page: currentPage.value,
      pageSize: pageSize,
    };
    const response = await axios.get(API_URL, { params });
    staffList.value = response.data.staff;
    totalStaff.value = response.data.totalCount;
    error.value = null;
  } catch (err) {
    console.error('Error fetching staff:', err);
    error.value = 'Failed to load staff. Is the backend server running?';
    notificationStore.showNotification('Error al cargar staff.', 'error'); // Show error notification
  } finally {
    isLoading.value = false;
  }
};

// Create a new staff member
const createStaff = async () => {
  if (!newStaff.value.nombre_completo || !newStaff.value.email) {
    notificationStore.showNotification('Nombre completo y email son obligatorios.', 'warning'); // Show warning notification
    return;
  }
  try {
    await axios.post(API_URL, newStaff.value);
    notificationStore.showNotification('Miembro del staff creado exitosamente.', 'success'); // Show success notification
    // Reset form and hide it
    showForm.value = false;
    newStaff.value = { nombre_completo: '', email: '', rol: 'Developer', activo: true };
    fetchStaff(); // Re-fetch staff after creation
  } catch (err) {
    console.error('Error creating staff:', err);
    notificationStore.showNotification('Hubo un error al crear el miembro del staff.', 'error'); // Show error notification
  }
};

// Watch for changes in searchQuery or currentPage to re-fetch staff
watch([searchQuery, currentPage], () => {
  fetchStaff();
});

// Pagination methods
const nextPage = () => {
  if (currentPage.value * pageSize < totalStaff.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Fetch staff when component is mounted
onMounted(() => {
  fetchStaff();
});
</script>

<template>
  <main class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Staff</h1>
      <button @click="showForm = !showForm" class="btn btn-primary">
        {{ showForm ? 'Cancelar' : 'Añadir Staff' }}
      </button>
    </div>

    <!-- Search input -->
    <div class="mb-3">
      <input type="text" v-model="searchQuery" placeholder="Buscar por nombre, email o rol..." class="form-control">
    </div>

    <!-- Form for creating a new staff member -->
    <div v-if="showForm" class="card p-4 mb-4">
      <h2 class="card-title">Nuevo Miembro del Staff</h2>
      <form @submit.prevent="createStaff">
        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre Completo</label>
          <input type="text" id="nombre" v-model="newStaff.nombre_completo" class="form-control" required>
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" id="email" v-model="newStaff.email" class="form-control" required>
        </div>
        <div class="mb-3">
          <label for="rol" class="form-label">Rol</label>
          <select id="rol" v-model="newStaff.rol" class="form-select">
            <option value="Developer">Developer</option>
            <option value="QA">QA</option>
            <option value="PM">PM</option>
            <option value="Designer">Designer</option>
            <option value="DevOps">DevOps</option>
          </select>
        </div>
        <div class="form-check mb-3">
          <input type="checkbox" id="activo" v-model="newStaff.activo" class="form-check-input">
          <label for="activo" class="form-check-label">Activo</label>
        </div>
        <button type="submit" class="btn btn-success">Guardar Staff</button>
      </form>
    </div>

    <!-- Display existing staff members -->
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Cargando staff...</p>
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="staffList.length" class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Completo</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Activo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="staff in staffList" :key="staff.id">
            <td>{{ staff.id }}</td>
            <td>
              <RouterLink :to="{ name: 'staff-detail', params: { id: staff.id } }">
                {{ staff.nombre_completo }}
              </RouterLink>
            </td>
            <td>{{ staff.email }}</td>
            <td>{{ staff.rol }}</td>
            <td>{{ staff.activo ? 'Sí' : 'No' }}</td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination controls -->
      <div class="d-flex justify-content-center align-items-center mt-3">
        <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-secondary me-2">Anterior</button>
        <span class="mx-2">Página {{ currentPage }} de {{ Math.ceil(totalStaff / pageSize) }}</span>
        <button @click="nextPage" :disabled="currentPage * pageSize >= totalStaff" class="btn btn-secondary">Siguiente</button>
      </div>
    </div>
    <div v-else class="alert alert-info" role="alert">
      No hay miembros del staff que coincidan con la búsqueda.
    </div>
  </main>
</template>

<style scoped>
/* Removed most styles, Bootstrap will handle it */
</style>
