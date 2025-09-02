<template>
  <ListView
    title="Staff"
    :items="staffList"
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
        <i class="fas fa-plus"></i> Nuevo Miembro
      </button>
    </template>
    <template #item="{ item }">
      <td>{{ item.id }}</td>
      <td>
        <router-link :to="{ name: 'staff-detail', params: { id: item.id } }">
          {{ item.nombre_completo }}
        </router-link>
      </td>
      <td>{{ item.rol }}</td>
      <td>
        <span :class="['badge', item.activo ? 'bg-success' : 'bg-secondary']">
          {{ item.activo ? 'Activo' : 'Inactivo' }}
        </span>
      </td>
    </template>
  </ListView>

  <!-- Create/Edit Staff Modal -->
  <div v-if="showForm" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Nuevo Miembro del Staff</h5>
          <button type="button" class="btn-close" @click="closeForm"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createStaff">
            <div class="mb-3">
              <label for="nombre_completo" class="form-label">Nombre Completo</label>
              <input type="text" class="form-control" id="nombre_completo" v-model="newStaff.nombre_completo" required>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" id="email" v-model="newStaff.email" required>
            </div>
            <div class="mb-3">
              <label for="rol" class="form-label">Rol</label>
              <select id="rol" v-model="newStaff.rol" class="form-select">
                <option value="Developer">Developer</option>
                <option value="QA">QA</option>
                <option value="PM">PM</option>
                <option value="Designer">Designer</option>
                <option value="DevOps">DevOps</option>
                <option value="Director">Director</option>
                <option value="Coordinador">Coordinador</option>
                <option value="Analista">Analista</option>
              </select>
            </div>
            <div class="form-check mb-3">
              <input type="checkbox" class="form-check-input" id="activo" v-model="newStaff.activo">
              <label class="form-check-label" for="activo">Activo</label>
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

const staffList = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const sortKey = ref('id');
const sortOrder = ref('asc');

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const API_URL = 'http://localhost:3000/api/staff';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nombre_completo', label: 'Nombre Completo', sortable: true },
  { key: 'rol', label: 'Rol', sortable: true },
  { key: 'activo', label: 'Activo', sortable: true },
];

// Form related state and functions
const showForm = ref(false);
const newStaff = ref({
  nombre_completo: '',
  email: '',
  rol: 'Developer',
  activo: true,
});

const fetchStaff = async () => {
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
    staffList.value = response.data.staff;
    totalItems.value = response.data.totalCount;
  } catch (err) {
    notificationStore.showNotification('Error al cargar el personal.', 'error');
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
  newStaff.value = { nombre_completo: '', email: '', rol: 'Developer', activo: true };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
};

const createStaff = async () => {
  if (!newStaff.value.nombre_completo || !newStaff.value.email) {
    notificationStore.showNotification('Nombre completo y email son obligatorios.', 'warning');
    return;
  }
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.post(API_URL, newStaff.value, { headers });
    notificationStore.showNotification('Miembro del staff creado exitosamente.', 'success');
    closeForm();
    fetchStaff(); // Refresh the list
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al crear el miembro del staff.', 'error');
  }
};

watch(
  [currentPage, searchQuery, pageSize, sortKey, sortOrder],
  fetchStaff,
  { immediate: true }
);
</script>

<style scoped>
.modal.d-block {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
