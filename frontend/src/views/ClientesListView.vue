<template>
  <ListView
    title="Clientes"
    :items="clienteList"
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
        <i class="fas fa-plus"></i> Nuevo Cliente
      </button>
    </template>
    <template #item="{ item }">
      <td>{{ item.id }}</td>
      <td>
        <router-link :to="{ name: 'cliente-detail', params: { id: item.id } }">
          {{ item.cliente }}
        </router-link>
      </td>
      <td>{{ item.nombre_publico }}</td>
      <td>{{ item.estado }}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary me-2" @click="openFormToEdit(item)">Editar</button>
        <button class="btn btn-sm btn-outline-danger" @click="deleteCliente(item.id)">Eliminar</button>
      </td>
    </template>
  </ListView>

  <!-- Create/Edit Client Modal -->
  <div v-if="showForm" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Nuevo Cliente</h5>
          <button type="button" class="btn-close" @click="closeForm"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createCliente">
            <div class="mb-3">
              <label for="cliente" class="form-label">Cliente</label>
              <input type="text" class="form-control" id="cliente" v-model="newCliente.cliente" required>
            </div>
            <div class="mb-3">
              <label for="mail_cliente" class="form-label">Email</label>
              <input type="email" class="form-control" id="mail_cliente" v-model="newCliente.mail_cliente">
            </div>
            <div class="mb-3">
              <label for="cel_cliente" class="form-label">Celular</label>
              <input type="text" class="form-control" id="cel_cliente" v-model="newCliente.cel_cliente">
            </div>
            <div class="mb-3">
              <label for="estado" class="form-label">Estado</label>
              <select id="estado" v-model="newCliente.estado" class="form-select">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="En_Desarrollo">En Desarrollo</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="En_Supervision">En Supervision</option>
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

const clienteList = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const sortKey = ref('id');
const sortOrder = ref('asc');

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const API_URL = 'http://localhost:3000/api/clientes';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'cliente', label: 'Cliente', sortable: true },
  { key: 'nombre_publico', label: 'Nombre Público', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'actions', label: 'Acciones', sortable: false },
];

// Form related state and functions
const showForm = ref(false);
const newCliente = ref({
  cliente: '',
  mail_cliente: '',
  cel_cliente: '',
  estado: 'Activo',
});

const fetchClientes = async () => {
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
    clienteList.value = response.data.clientes;
    totalItems.value = response.data.totalCount;
  } catch (err) {
    notificationStore.showNotification('Error al cargar clientes.', 'error');
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
  newCliente.value = { cliente: '', mail_cliente: '', cel_cliente: '', estado: 'Activo' };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
};

const createCliente = async () => {
  if (!newCliente.value.cliente) {
    notificationStore.showNotification('Nombre de cliente es obligatorio.', 'warning');
    return;
  }
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.post(API_URL, newCliente.value, { headers });
    notificationStore.showNotification('Cliente creado exitosamente.', 'success');
    closeForm();
    fetchClientes(); // Refresh the list
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al crear el cliente.', 'error');
  }
};

const deleteCliente = async (id) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
    return;
  }
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.delete(`${API_URL}/${id}`, { headers });
    notificationStore.showNotification('Cliente eliminado exitosamente.', 'success');
    fetchClientes(); // Refresh the list
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al eliminar el cliente.', 'error');
  }
};

const openFormToEdit = (item) => {
  // This view doesn't have an edit form, so just a placeholder for now
  notificationStore.showNotification('Funcionalidad de edición no implementada para clientes.', 'info');
  console.log('Edit client:', item);
};

watch(
  [currentPage, searchQuery, pageSize, sortKey, sortOrder],
  fetchClientes,
  { immediate: true }
);
</script>

<style scoped>
.modal.d-block {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
