<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '../stores/notification';
import ListView from '../components/ListView.vue';

const staffList = ref([]);
const error = ref(null);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
const totalStaff = ref(0);
const sortKey = ref('id');
const sortOrder = ref('asc');

const notificationStore = useNotificationStore();

const showForm = ref(false);
const newStaff = ref({
  nombre_completo: '',
  email: '',
  rol: 'Developer',
  activo: true,
});

const API_URL = 'http://localhost:3000/api/staff';

const fetchStaff = async () => {
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
    staffList.value = response.data.staff;
    totalStaff.value = response.data.totalCount;
    error.value = null;
  } catch (err) {
    error.value = 'Failed to load staff.';
    notificationStore.showNotification('Error al cargar staff.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const createStaff = async () => {
  if (!newStaff.value.nombre_completo || !newStaff.value.email) {
    notificationStore.showNotification('Nombre completo y email son obligatorios.', 'warning');
    return;
  }
  try {
    await axios.post(API_URL, newStaff.value);
    notificationStore.showNotification('Miembro del staff creado exitosamente.', 'success');
    showForm.value = false;
    newStaff.value = { nombre_completo: '', email: '', rol: 'Developer', activo: true };
    fetchStaff();
  } catch (err) {
    notificationStore.showNotification('Hubo un error al crear el miembro del staff.', 'error');
  }
};

const deleteStaff = async (staffId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este miembro del staff?')) {
        return;
    }
    try {
        await axios.delete(`${API_URL}/${staffId}`);
        notificationStore.showNotification('Miembro del staff eliminado exitosamente.', 'success');
        fetchStaff();
    } catch (err) {
        notificationStore.showNotification('Hubo un error al eliminar el miembro del staff.', 'error');
    }
};

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  fetchStaff();
};

watch([searchQuery, currentPage], () => {
  fetchStaff();
});

const totalPages = computed(() => Math.ceil(totalStaff.value / pageSize));

onMounted(() => {
  fetchStaff();
});
</script>

<template>
  <ListView
    title="Staff"
    itemType="Staff"
    :items="staffList"
    :tableHeaders="[
      { key: 'nombre_completo', label: 'Nombre Completo', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'rol', label: 'Rol', sortable: true },
      { key: 'activo', label: 'Activo', sortable: true },
    ]"
    :displayFields="[
      { key: 'nombre_completo' },
      { key: 'email' },
      { key: 'rol' },
      { key: 'activo', type: 'boolean' },
    ]"
    :searchQuery.sync="searchQuery"
    searchPlaceholder="Buscar por nombre, email o rol..."
    :isLoading="isLoading"
    :error="error"
    :currentPage="currentPage"
    :totalPages="totalPages"
    :showForm="showForm"
    formTitle="Nuevo Miembro del Staff"
    detailRouteName="staff-detail"
    :sortKey="sortKey"
    :sortOrder="sortOrder"
    @show-form="showForm = true"
    @submit-form="createStaff"
    @cancel-form="showForm = false"
    @update:searchQuery="searchQuery = $event"
    @prev-page="currentPage--"
    @next-page="currentPage++"
    @delete-item="deleteStaff"
    @sort="handleSort"
  >
    <template #form>
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
    </template>
  </ListView>
</template>
