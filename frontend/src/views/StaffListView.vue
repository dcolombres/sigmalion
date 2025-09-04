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
  <div class="modal-dialog modal-lg"> <!-- Hacemos el modal más grande -->
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Nuevo Miembro del Staff</h5>
        <button type="button" class="btn-close" @click="closeForm"></button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="createStaff">
          <div class="row">
            <!-- Columna Izquierda -->
            <div class="col-md-6">
              <div class="mb-3">
                <label for="nombre_completo" class="form-label">Nombre Completo*</label>
                <input type="text" class="form-control" id="nombre_completo" v-model="newStaff.nombre_completo" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" v-model="newStaff.email">
              </div>
              <div class="mb-3">
                <label for="rol" class="form-label">Rol</label>
                <select id="rol" v-model="newStaff.rol" class="form-select">
                  <option :value="null" disabled>-- Selecciona un rol --</option>
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
              <div class="mb-3">
                <label for="experiencia" class="form-label">Experiencia</label>
                <select id="experiencia" v-model="newStaff.experiencia" class="form-select">
                  <option :value="null" disabled>-- Selecciona experiencia --</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="modalidad" class="form-label">Modalidad</label>
                <select id="modalidad" v-model="newStaff.modalidad" class="form-select">
                  <option :value="null" disabled>-- Selecciona modalidad --</option>
                  <option value="Full_time">Full-time</option>
                  <option value="Part_time">Part-time</option>
                  <option value="Contractor">Contractor</option>
                </select>
              </div>
            </div>
            <!-- Columna Derecha -->
            <div class="col-md-6">
              <div class="mb-3">
                <label for="skills" class="form-label">Skills</label>
                <input type="text" class="form-control" id="skills" v-model="newStaff.skills">
              </div>
              <div class="mb-3">
                <label for="contrato" class="form-label">Contrato</label>
                <input type="text" class="form-control" id="contrato" v-model="newStaff.contrato">
              </div>
              <div class="mb-3">
                <label for="origen" class="form-label">Origen</label>
                <input type="text" class="form-control" id="origen" v-model="newStaff.origen">
              </div>
              <div class="mb-3">
                <label for="coordinacion" class="form-label">Coordinación</label>
                <input type="text" class="form-control" id="coordinacion" v-model="newStaff.coordinacion">
              </div>
              <div class="form-check mb-3">
                <input type="checkbox" class="form-check-input" id="activo" v-model="newStaff.activo">
                <label class="form-check-label" for="activo">Activo</label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeForm">Cancelar</button>
            <button type="submit" class="btn btn-primary">Crear Miembro</button>
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

// --- FORMULARIO Y MODAL ---
const showForm = ref(false);

// Modelo de datos completo para el nuevo Staff
const newStaff = ref({
  nombre_completo: '',
  nombres: '',
  apellidos: '',
  email: '',
  rol: null,
  experiencia: null,
  modalidad: null,
  activo: true,
  contrato: '',
  comentario: '',
  origen: '',
  skills: '',
  desempeno_ley_dto: '',
  hhee: '',
  ur: '',
  coordinacion: '',
  presencialidad: '',
  cumpleanos: null,
  edad: null,
});

// Función para abrir el formulario con valores por defecto
const openFormToCreate = () => {
  newStaff.value = {
    nombre_completo: '',
    nombres: '',
    apellidos: '',
    email: '',
    rol: null,
    experiencia: null,
    modalidad: null,
    activo: true,
    contrato: '',
    comentario: '',
    origen: '',
    skills: '',
    desempeno_ley_dto: '',
    hhee: '',
    ur: '',
    coordinacion: '',
    presencialidad: '',
    cumpleanos: null,
    edad: null,
  };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
};

// Función para crear el nuevo miembro del staff
const createStaff = async () => {
  if (!newStaff.value.nombre_completo) {
    notificationStore.showNotification('El nombre completo es obligatorio.', 'warning');
    return;
  }
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    // Filtra los campos que no son nulos o vacíos para enviar un payload limpio
    const payload = Object.fromEntries(
      Object.entries(newStaff.value).filter(([, value]) => value !== null && value !== '')
    );
    await axios.post(API_URL, payload, { headers });
    notificationStore.showNotification('Miembro del staff creado exitosamente.', 'success');
    closeForm();
    fetchStaff(); // Recarga la lista
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al crear el miembro del staff.', 'error');
  }
};

// --- LÓGICA DE LA LISTA ---
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
