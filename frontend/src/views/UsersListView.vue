<template>
  <ListView
    title="Usuarios"
    :items="usersList"
    :columns="columns"
    :loading="isLoading"
    :totalItems="totalItems"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :sortKey="sortKey"
    :sortOrder="sortOrder"
    v-model:searchQuery="searchQuery"
    @update:sort="handleSort"
    @update:pageSize="pageSize = $event"
    @prev-page="currentPage--"
    @next-page="currentPage++"
  >
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="openFormToCreate">
        <i class="fas fa-plus"></i> Nuevo Usuario
      </button>
    </template>
    <template #item="{ item }">
      <td>{{ item.id }}</td>
      <td>
        <router-link :to="{ name: 'user-detail', params: { id: item.id } }">
          {{ item.nombre }}
        </router-link>
      </td>
      <td>{{ item.email }}</td>
      <td>{{ item.role }}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary me-2" @click="openFormToEdit(item)">Editar</button>
        <button class="btn btn-sm btn-outline-danger" @click="deleteUser(item.id)">Eliminar</button>
      </td>
    </template>
  </ListView>

  <!-- Create/Edit User Modal -->
  <div v-if="showForm" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Nuevo Usuario</h5>
          <button type="button" class="btn-close" @click="closeForm"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createUser">
            <div class="mb-3">
              <label for="nombre" class="form-label">Nombre</label>
              <input type="text" class="form-control" id="nombre" v-model="newUser.nombre" required>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" id="email" v-model="newUser.email" required>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input type="password" class="form-control" id="password" v-model="newUser.password" required>
            </div>
            <div class="mb-3">
              <label for="role" class="form-label">Rol</label>
              <select id="role" v-model="newUser.role" class="form-control">
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeForm">Cancelar</button>
              <button type="submit" class="btn btn-primary">Crear</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showForm" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '@/stores/notification';
import ListView from '@/components/ListView.vue';
import { useAuthStore } from '@/stores/auth';

const usersList = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const sortKey = ref('id');
const sortOrder = ref('asc');

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const API_URL = 'http://localhost:3000/api/users';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Rol', sortable: true },
  { key: 'actions', label: 'Acciones', sortable: false },
];

// Form related state and functions
const showForm = ref(false);
const newUser = ref({
  nombre: '',
  email: '',
  password: '',
  role: 'USER',
});

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const params = {
      search: searchQuery.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      sortKey: sortKey.value,
      sortOrder: sortOrder.value,
    };
    const response = await axios.get(API_URL, { params, headers });
    usersList.value = response.data.users;
    totalItems.value = response.data.totalCount;
  } catch (err) {
    notificationStore.showNotification('Error al cargar usuarios.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const openFormToCreate = () => {
  newUser.value = { nombre: '', email: '', password: '', role: 'USER' };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
};

const createUser = async () => {
  if (!newUser.value.nombre || !newUser.value.email || !newUser.value.password) {
    notificationStore.showNotification('Nombre, email y contraseña son obligatorios.', 'warning');
    return;
  }
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.post(API_URL, newUser.value, { headers });
    notificationStore.showNotification('Usuario creado exitosamente.', 'success');
    closeForm();
    fetchUsers(); // Refresh the list
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al crear el usuario.', 'error');
  }
};

const deleteUser = async (id) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
    return;
  }
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.delete(`${API_URL}/${id}`, { headers });
    notificationStore.showNotification('Usuario eliminado exitosamente.', 'success');
    fetchUsers(); // Refresh the list
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al eliminar el usuario.', 'error');
  }
};

const openFormToEdit = (item) => {
  // This view doesn't have an edit form, so just a placeholder for now
  notificationStore.showNotification('Funcionalidad de edición no implementada para usuarios.', 'info');
  console.log('Edit user:', item);
};

watch(
  [currentPage, searchQuery, pageSize, sortKey, sortOrder],
  fetchUsers,
  { immediate: true }
);
</script>

<style scoped>
.modal.d-block {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
