<template>
  <ListView
    title="Integraciones"
    :items="integracionesList"
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
        <i class="fas fa-plus"></i> Nueva Integración
      </button>
    </template>
    <template #item="{ item }">
      <td>{{ item.id }}</td>
      <td>
        <router-link :to="{ name: 'integracion-detail', params: { id: item.id } }">
          {{ item.nombre }}
        </router-link>
      </td>
      <td>{{ item.detalles }}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary me-2" @click="openFormToEdit(item)">Editar</button>
        <button class="btn btn-sm btn-outline-danger" @click="deleteIntegracion(item.id)">Eliminar</button>
      </td>
    </template>
  </ListView>

  <!-- Create/Edit Integration Modal -->
  <div v-if="showForm" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Nueva Integración</h5>
          <button type="button" class="btn-close" @click="closeForm"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createIntegracion">
            <div class="mb-3">
              <label for="nombre" class="form-label">Nombre</label>
              <input type="text" class="form-control" id="nombre" v-model="newIntegracion.nombre" required>
            </div>
            <div class="mb-3">
              <label for="detalles" class="form-label">Detalles</label>
              <textarea class="form-control" id="detalles" v-model="newIntegracion.detalles"></textarea>
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

const integracionesList = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const sortKey = ref('id');
const sortOrder = ref('asc');

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const API_URL = 'http://localhost:3000/api/integraciones';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'detalles', label: 'Detalles', sortable: true },
  { key: 'actions', label: 'Acciones', sortable: false },
];

// Form related state and functions
const showForm = ref(false);
const newIntegracion = ref({
  nombre: '',
  detalles: '',
});

const fetchIntegraciones = async () => {
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
    integracionesList.value = response.data.integraciones;
    totalItems.value = response.data.totalCount;
  } catch (err) {
    notificationStore.showNotification('Error al cargar integraciones.', 'error');
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
  newIntegracion.value = { nombre: '', detalles: '' };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
};

const createIntegracion = async () => {
  if (!newIntegracion.value.nombre) {
    notificationStore.showNotification('El nombre es obligatorio.', 'warning');
    return;
  }
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.post(API_URL, newIntegracion.value, { headers });
    notificationStore.showNotification('Integración creada exitosamente.', 'success');
    closeForm();
    fetchIntegraciones(); // Refresh the list
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al crear la integración.', 'error');
  }
};

const deleteIntegracion = async (id) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta integración?')) {
    return;
  }
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.delete(`${API_URL}/${id}`, { headers });
    notificationStore.showNotification('Integración eliminada exitosamente.', 'success');
    fetchIntegraciones(); // Refresh the list
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al eliminar la integración.', 'error');
  }
};

const openFormToEdit = (item) => {
  // This view doesn't have an edit form, so just a placeholder for now
  notificationStore.showNotification('Funcionalidad de edición no implementada para integraciones.', 'info');
  console.log('Edit integration:', item);
};

watch(
  [currentPage, searchQuery, pageSize, sortKey, sortOrder],
  fetchIntegraciones,
  { immediate: true }
);
</script>

<style scoped>
.modal.d-block {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
