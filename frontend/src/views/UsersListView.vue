<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notification'; // Import notification store

const router = useRouter();
const usersList = ref([]);
const error = ref(null);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
const totalUsers = ref(0);

// Use notification store
const notificationStore = useNotificationStore();

// Form state
const showForm = ref(false);
const newUser = ref({
  nombre: '',
  email: '',
  password: '',
});

const API_URL = 'http://localhost:3000/api/users';

// Fetch all users
const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const params = {
      search: searchQuery.value,
      page: currentPage.value,
      pageSize: pageSize,
    };
    const response = await axios.get(API_URL, { params });
    usersList.value = response.data.users;
    totalUsers.value = response.data.totalCount;
    error.value = null;
  } catch (err) {
    console.error('Error fetching users:', err);
    error.value = 'Failed to load users. Is the backend server running?';
    notificationStore.showNotification('Error al cargar usuarios.', 'error'); // Show error notification
  } finally {
    isLoading.value = false;
  }
};

// Create a new user
const createUser = async () => {
  if (!newUser.value.nombre || !newUser.value.email || !newUser.value.password) {
    notificationStore.showNotification('Nombre, email y contraseña son obligatorios.', 'warning'); // Show warning notification
    return;
  }
  try {
    await axios.post(API_URL, newUser.value);
    notificationStore.showNotification('Usuario creado exitosamente.', 'success'); // Show success notification
    // Reset form and hide it
    showForm.value = false;
    newUser.value = { nombre: '', email: '', password: '' };
    fetchUsers(); // Refresh list
  } catch (err) {
    console.error('Error creating user:', err);
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al crear el usuario.', 'error'); // Show error notification
  }
};

// Delete a user
const deleteUser = async (userId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
    return;
  }
  try {
    await axios.delete(`${API_URL}/${userId}`);
    notificationStore.showNotification('Usuario eliminado exitosamente.', 'success'); // Show success notification
    fetchUsers(); // Refresh list after deletion
  } catch (err) {
    console.error('Error deleting user:', err);
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al eliminar el usuario.', 'error'); // Show error notification
  }
};

// Watch for changes in searchQuery or currentPage to re-fetch users
watch([searchQuery, currentPage], () => {
  fetchUsers();
});

// Pagination methods
const nextPage = () => {
  if (currentPage.value * pageSize < totalUsers.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Fetch users when component is mounted
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <main class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Usuarios</h1>
      <button @click="showForm = !showForm" class="btn btn-primary">
        <i class="fas fa-plus me-2"></i>
        {{ showForm ? 'Cancelar' : 'Añadir Usuario' }}
      </button>
    </div>

    <!-- Form for creating a new user -->
    <div v-if="showForm" class="card p-4 mb-4 shadow-sm">
      <h2 class="card-title">Nuevo Usuario</h2>
      <form @submit.prevent="createUser">
        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre</label>
          <input type="text" id="nombre" v-model="newUser.nombre" class="form-control" required>
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" id="email" v-model="newUser.email" class="form-control" required>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Contraseña</label>
          <input type="password" id="password" v-model="newUser.password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-success">Guardar Usuario</button>
      </form>
    </div>

    <!-- Search input -->
    <div class="mb-3">
      <input type="text" v-model="searchQuery" placeholder="Buscar por nombre o email..." class="form-control">
    </div>

    <!-- Display existing users -->
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Cargando usuarios...</p>
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="usersList.length" class="table-responsive">
      <table class="table table-striped table-hover shadow-sm">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usersList" :key="user.id">
            <td>{{ user.id }}</td>
            <td>
              <RouterLink :to="{ name: 'user-detail', params: { id: user.id } }">
                {{ user.nombre }}
              </RouterLink>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <RouterLink :to="{ name: 'user-detail', params: { id: user.id }, query: { edit: true } }" class="btn btn-sm btn-warning me-2">
                <i class="fas fa-pencil-alt"></i>
              </RouterLink>
              <button @click="deleteUser(user.id)" class="btn btn-sm btn-danger">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination controls -->
      <div class="d-flex justify-content-center align-items-center mt-3">
        <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-secondary me-2">
            <i class="fas fa-chevron-left"></i>
        </button>
        <span class="mx-2">Página {{ currentPage }} de {{ Math.ceil(totalUsers / pageSize) }}</span>
        <button @click="nextPage" :disabled="currentPage * pageSize >= totalUsers" class="btn btn-secondary">
            <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    <div v-else class="alert alert-info" role="alert">
      No hay usuarios que coincidan con la búsqueda.
    </div>
  </main>
</template>

<style scoped>
h1 {
  color: #343a40;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.table {
    font-size: 0.9rem;
}

.table thead {
    font-size: 1rem;
}
</style>