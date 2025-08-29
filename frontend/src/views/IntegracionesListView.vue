<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '../stores/notification';
import ListView from '../components/ListView.vue';

const integracionesList = ref([]);
const error = ref(null);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
const totalIntegraciones = ref(0);
const sortKey = ref('id');
const sortOrder = ref('asc');

const notificationStore = useNotificationStore();

const showForm = ref(false);
const newIntegracion = ref({
  nombre: '',
  detalles: '',
});

const API_URL = 'http://localhost:3000/api/integraciones';

const fetchIntegraciones = async () => {
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
    integracionesList.value = response.data.integraciones;
    totalIntegraciones.value = response.data.totalCount;
    error.value = null;
  } catch (err) {
    error.value = 'Failed to load integrations.';
    notificationStore.showNotification('Error al cargar integraciones.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const createIntegracion = async () => {
  if (!newIntegracion.value.nombre) {
    notificationStore.showNotification('El nombre de la integración es obligatorio.', 'warning');
    return;
  }
  try {
    await axios.post(API_URL, newIntegracion.value);
    notificationStore.showNotification('Integración creada exitosamente.', 'success');
    showForm.value = false;
    newIntegracion.value = { nombre: '', detalles: '' };
    fetchIntegraciones();
  } catch (err) {
    notificationStore.showNotification('Hubo un error al crear la integración.', 'error');
  }
};

const deleteIntegracion = async (integracionId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta integración?')) {
        return;
    }
    try {
        await axios.delete(`${API_URL}/${integracionId}`);
        notificationStore.showNotification('Integración eliminada exitosamente.', 'success');
        fetchIntegraciones();
    } catch (err) {
        notificationStore.showNotification('Hubo un error al eliminar la integración.', 'error');
    }
};

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  fetchIntegraciones();
};

watch([searchQuery, currentPage], () => {
  fetchIntegraciones();
});

const totalPages = computed(() => Math.ceil(totalIntegraciones.value / pageSize));

onMounted(() => {
  fetchIntegraciones();
});
</script>

<template>
  <ListView
    title="Integraciones"
    itemType="Integración"
    :items="integracionesList"
    :tableHeaders="[
      { key: 'nombre', label: 'Nombre', sortable: true },
      { key: 'detalles', label: 'Detalles', sortable: false },
    ]"
    :displayFields="[{key: 'nombre'}, {key: 'detalles'}]"
    :searchQuery.sync="searchQuery"
    searchPlaceholder="Buscar por nombre..."
    :isLoading="isLoading"
    :error="error"
    :currentPage="currentPage"
    :totalPages="totalPages"
    :showForm="showForm"
    formTitle="Nueva Integración"
    detailRouteName="integracion-detail"
    :sortKey="sortKey"
    :sortOrder="sortOrder"
    @show-form="showForm = true"
    @submit-form="createIntegracion"
    @cancel-form="showForm = false"
    @update:searchQuery="searchQuery = $event"
    @prev-page="currentPage--"
    @next-page="currentPage++"
    @delete-item="deleteIntegracion"
    @sort="handleSort"
  >
    <template #form>
        <div class="mb-3">
          <label for="nombre" class="form-label">Nombre de la Integración</label>
          <input type="text" id="nombre" v-model="newIntegracion.nombre" class="form-control" required>
        </div>
        <div class="mb-3">
          <label for="detalles" class="form-label">Detalles</label>
          <textarea id="detalles" v-model="newIntegracion.detalles" class="form-control" rows="3"></textarea>
        </div>
    </template>
  </ListView>
</template>
