<template>
  <main class="container mt-4">
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Cargando detalles del usuario...</p>
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="user" class="card p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="card-title">
          {{ user.nombre }}
        </h1>
        <RouterLink to="/users" class="btn btn-secondary">
          &larr; Volver a la lista de Usuarios
        </RouterLink>
      </div>

      <div class="row g-4">
        <div class="col-md-12">
          <EditableDetailCard
            title="Detalles del Usuario"
            :data="user"
            :fields="userFields"
            :form-fields="userFormFields"
            @save="updateUser"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useNotificationStore } from '@/stores/notification';
import EditableDetailCard from '@/components/EditableDetailCard.vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const user = ref(null);
const isLoading = ref(true);
const error = ref(null);

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const API_BASE_URL = 'http://localhost:3000/api';

const roleEnumValues = ref([]);

const userFields = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Rol' },
];

const userFormFields = ref([]); // Will be populated after fetching enums

const fetchUserDetails = async () => {
  const userId = route.params.id;
  isLoading.value = true;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`, { headers });
    user.value = response.data;
  } catch (err) {
    console.error('Error fetching user:', err);
    error.value = `Failed to load user #${userId}.`;
    notificationStore.showNotification(`Error al cargar usuario #${userId}.`, 'error');
  } finally {
    isLoading.value = false;
  }
};

const updateUser = async (updatedData) => {
  const userId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, updatedData, { headers });
    user.value = response.data; // Update local data with response
    notificationStore.showNotification('Usuario actualizado exitosamente.', 'success');
  } catch (err) {
    console.error('Error saving user:', err);
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al guardar los detalles del usuario.', 'error');
  }
};

const deleteUser = async () => {
  if (!confirm('¿Estás seguro de que quieres borrar a este usuario?')) {
    return;
  }
  const userId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.delete(`${API_BASE_URL}/users/${userId}`, { headers });
    notificationStore.showNotification('Usuario eliminado exitosamente.', 'success');
    router.push('/users'); // Redirect to user list after deletion
  } catch (err) {
    console.error('Error deleting user:', err);
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al eliminar el usuario.', 'error');
  }
};

const fetchEnums = async () => {
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get(`${API_BASE_URL}/proyectos/enums`, { headers }); // Reusing projects enums endpoint
    roleEnumValues.value = response.data.Role;

    // Dynamically create userFormFields after enums are fetched
    userFormFields.value = [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'password', label: 'Nueva Contraseña (opcional)', type: 'password' },
      { key: 'role', label: 'Rol', type: 'select', options: roleEnumValues.value.map(v => ({ value: v, text: v })) },
    ];

  } catch (err) {
    notificationStore.showNotification('Error al cargar opciones de selección.', 'error');
    console.error('Error fetching enums:', err);
  }
};

onMounted(async () => {
  await fetchEnums();
  await fetchUserDetails();
});

</script>

<style scoped>
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.tabs-card .nav-link {
  cursor: pointer;
}

.loading-container {
  text-align: center;
  padding: 4rem;
}
</style>