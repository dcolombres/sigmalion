<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const user = ref(null);
const isLoading = ref(true);
const error = ref(null);

const isEditing = ref(false);
const formData = ref({});

const API_URL = 'http://localhost:3000/api/users';

const fetchUser = async () => {
  const userId = route.params.id;
  isLoading.value = true;
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    user.value = response.data;
    formData.value = { ...user.value, password: '' }; // Initialize password as empty
  } catch (err) {
    console.error('Error fetching user:', err);
    error.value = `Failed to load user #${userId}.`;
  } finally {
    isLoading.value = false;
  }
};

const saveUser = async () => {
  const userId = route.params.id;
  try {
    const dataToSave = { ...formData.value };
    if (!dataToSave.password) {
      delete dataToSave.password; // Don't send empty password if not changed
    }
    const response = await axios.put(`${API_URL}/${userId}`, dataToSave);
    user.value = response.data;
    isEditing.value = false;
  } catch (err) {
    console.error('Error saving user:', err);
    alert('Failed to save user details.');
  }
};

const deleteUser = async () => {
  if (!confirm('¿Estás seguro de que quieres borrar a este usuario?')) {
    return;
  }
  const userId = route.params.id;
  try {
    await axios.delete(`${API_URL}/${userId}`);
    router.push('/users'); // Redirect to user list after deletion
  } catch (err) {
    console.error('Error deleting user:', err);
    alert('Failed to delete user.');
  }
};

const handleEdit = () => {
  isEditing.value = true;
};

const handleCancelEdit = () => {
  isEditing.value = false;
  formData.value = { ...user.value, password: '' }; // Reset form data
};

onMounted(() => {
  fetchUser();
  // Check if the route was accessed with an 'edit' query param
  if (route.query.edit) {
    isEditing.value = true;
  }
});
</script>

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
        <h1 class="card-title">{{ user.nombre }}</h1>
        <RouterLink to="/users" class="btn btn-secondary">&larr; Volver a la lista de Usuarios</RouterLink>
      </div>

      <div class="d-flex mb-3">
        <button v-if="!isEditing" @click="handleEdit" class="btn btn-primary me-2">Editar Usuario</button>
        <button class="btn btn-danger" @click="deleteUser">Borrar Usuario</button>
      </div>

      <div class="card-body">
        <h2 class="card-subtitle mb-3 text-muted">Detalles del Usuario</h2>
        <form v-if="isEditing" @submit.prevent="saveUser">
          <div class="mb-3">
            <label class="form-label">Nombre:</label>
            <input type="text" v-model="formData.nombre" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Email:</label>
            <input type="email" v-model="formData.email" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Nueva Contraseña (opcional):</label>
            <input type="password" v-model="formData.password" placeholder="Dejar en blanco para no cambiar" class="form-control">
          </div>
          <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-success me-2">Guardar Cambios</button>
            <button type="button" @click="handleCancelEdit" class="btn btn-secondary">Cancelar</button>
          </div>
        </form>
        <div v-else>
          <p class="card-text"><strong>ID:</strong> {{ user.id }}</p>
          <p class="card-text"><strong>Nombre:</strong> {{ user.nombre }}</p>
          <p class="card-text"><strong>Email:</strong> {{ user.email }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Removed most styles, Bootstrap will handle it */
</style>
