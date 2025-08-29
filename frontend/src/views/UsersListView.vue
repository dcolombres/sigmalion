<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '../stores/notification';
import ListView from '../components/ListView.vue';

const usersList = ref([]);
const error = ref(null);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
const totalUsers = ref(0);
const sortKey = ref('id');
const sortOrder = ref('asc');

const notificationStore = useNotificationStore();

const showForm = ref(false);
const newUser = ref({
  nombre: '',
  email: '',
  password: '',
});

const API_URL = 'http://localhost:3000/api/users';

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const params = {
      search: searchQuery.value,
      page: currentPage.value,
      pageSize: pageSize,
      sortKey: sortKey.value,
      sortOrder: sortOrder.value,
    };
    const response = await axios.get(API_URL, { params });
    usersList.value = response.data.users;
    totalUsers.value = response.data.totalCount;
    error.value = null;
  } catch (err) {
    error.value = 'Failed to load users.';
    notificationStore.showNotification('Error al cargar usuarios.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const createUser = async () => {
  if (!newUser.value.nombre || !newUser.value.email || !newUser.value.password) {
    notificationStore.showNotification('Nombre, email y contraseña son obligatorios.', 'warning');
    return;
  }
  try {
    await axios.post(API_URL, newUser.value);
    notificationStore.showNotification('Usuario creado exitosamente.', 'success');
    showForm.value = false;
    newUser.value = { nombre: '', email: '', password: '' };
    fetchUsers();
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al crear el usuario.', 'error');
  }
};

const deleteUser = async (userId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
    return;
  }
  try {
    await axios.delete(`${API_URL}/${userId}`);
    notificationStore.showNotification('Usuario eliminado exitosamente.', 'success');
    fetchUsers();
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al eliminar el usuario.', 'error');
  }
};

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  fetchUsers();
};

watch([searchQuery, currentPage], () => {
  fetchUsers();
});

const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize));

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <ListView
    title="Usuarios"
    itemType="Usuario"
    :items="usersList"
    :tableHeaders="[
      { key: 'nombre', label: 'Nombre', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
    ]"
    :displayFields="[{key: 'nombre'}, {key: 'email'}]"
    :searchQuery.sync="searchQuery"
    searchPlaceholder="Buscar por nombre o email..."
    :isLoading="isLoading"
    :error="error"
    :currentPage="currentPage"
    :totalPages="totalPages"
    :showForm="showForm"
    formTitle="Nuevo Usuario"
    detailRouteName="user-detail"
    :sortKey="sortKey"
    :sortOrder="sortOrder"
    @show-form="showForm = true"
    @submit-form="createUser"
    @cancel-form="showForm = false"
    @update:searchQuery="searchQuery = $event"
    @prev-page="currentPage--"
    @next-page="currentPage++"
    @delete-item="deleteUser"
    @sort="handleSort"
  >
    <template #form>
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
    </template>
  </ListView>
</template>
