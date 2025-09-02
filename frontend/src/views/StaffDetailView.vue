<template>
  <main class="container mt-4">
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Cargando detalles del miembro del staff...</p>
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="staffMember" class="card p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="card-title">
          {{ staffMember.nombre_completo }}
        </h1>
        <RouterLink to="/staff" class="btn btn-secondary">
          &larr; Volver a la lista de Staff
        </RouterLink>
      </div>

      <div class="row g-4">
        <div class="col-md-12">
          <EditableDetailCard
            title="Detalles del Staff"
            :data="staffMember"
            :fields="staffFields"
            :form-fields="staffFormFields"
            @save="updateStaffMember"
          />
        </div>
        <div class="col-md-12">
          <AssignedListCard
            title="Proyectos Asignados"
            item-type="Proyecto"
            :assigned-items="staffMember.proyectos"
            :all-items="allProjects"
            name-field="titulo_proyecto"
            :table-headers="['ID', 'Título del Proyecto']"
            :display-fields="[{ key: 'id', label: 'ID' }, { key: 'titulo_proyecto', label: 'Título del Proyecto' }]"
            @add="addProjectToStaff"
            @remove="removeProjectFromStaff"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useNotificationStore } from '@/stores/notification';
import EditableDetailCard from '@/components/EditableDetailCard.vue';
import AssignedListCard from '@/components/AssignedListCard.vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const staffMember = ref(null);
const isLoading = ref(true);
const error = ref(null);

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const API_BASE_URL = 'http://localhost:3000/api';

const allProjects = ref([]);
const rolStaffEnumValues = ref([]);
const modalidadStaffEnumValues = ref([]);
const experienciaStaffEnumValues = ref([]);

const staffFields = [
  { key: 'nombre_completo', label: 'Nombre Completo' },
  { key: 'email', label: 'Email' },
  { key: 'contrato', label: 'Contrato' },
  { key: 'rol', label: 'Rol' },
  { key: 'nombres', label: 'Nombres' },
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'activo', label: 'Activo', type: 'boolean' },
  { key: 'comentario', label: 'Comentario' },
  { key: 'modalidad', label: 'Modalidad' },
  { key: 'experiencia', label: 'Experiencia' },
  { key: 'origen', label: 'Origen' },
  { key: 'desempeno_ley_dto', label: 'Desempeño Ley DTO' },
  { key: 'hhee', label: 'HHEE' },
  { key: 'ur', label: 'UR' },
  { key: 'coordinacion', label: 'Coordinación' },
  { key: 'presencialidad', label: 'Presencialidad' },
  { key: 'cumpleanos', label: 'Cumpleaños', type: 'date' },
  { key: 'edad', label: 'Edad', type: 'number' }, // Computed, not directly editable
];

const staffFormFields = computed(() => [
  { key: 'nombre_completo', label: 'Nombre Completo', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'contrato', label: 'Contrato', type: 'text' },
  { key: 'rol', label: 'Rol', type: 'select', options: rolStaffEnumValues.value.map(v => ({ value: v, text: v })) },
  { key: 'nombres', label: 'Nombres', type: 'text' },
  { key: 'apellidos', label: 'Apellidos', type: 'text' },
  { key: 'activo', label: 'Activo', type: 'checkbox' },
  { key: 'comentario', label: 'Comentario', type: 'textarea' },
  { key: 'modalidad', label: 'Modalidad', type: 'select', options: modalidadStaffEnumValues.value.map(v => ({ value: v, text: v.replace('_', '-') })) },
  { key: 'experiencia', label: 'Experiencia', type: 'select', options: experienciaStaffEnumValues.value.map(v => ({ value: v, text: v })) },
  { key: 'origen', label: 'Origen', type: 'text' },
  { key: 'desempeno_ley_dto', label: 'Desempeño Ley DTO', type: 'text' },
  { key: 'hhee', label: 'HHEE', type: 'text' },
  { key: 'ur', label: 'UR', type: 'text' },
  { key: 'coordinacion', label: 'Coordinación', type: 'text' },
  { key: 'presencialidad', label: 'Presencialidad', type: 'text' },
  { key: 'cumpleanos', label: 'Cumpleaños', type: 'date' },
]);

const fetchStaffMember = async () => {
  const staffId = route.params.id;
  isLoading.value = true;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get(`${API_BASE_URL}/staff/${staffId}`, { headers });
    staffMember.value = response.data;
    // Add age for display
    if (staffMember.value.cumpleanos) {
      staffMember.value.edad = calculateAge(staffMember.value.cumpleanos);
    }
  } catch (err) {
    console.error('Error fetching staff member:', err);
    error.value = `Failed to load staff member #${staffId}.`;
    notificationStore.showNotification(`Error al cargar miembro del staff #${staffId}.`, 'error');
  } finally {
    isLoading.value = false;
  }
};

const updateStaffMember = async (updatedData) => {
  const staffId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    // Format date for API if present
    if (updatedData.cumpleanos) {
      updatedData.cumpleanos = new Date(updatedData.cumpleanos).toISOString();
    }
    // Recalculate age if birthday changed
    if (updatedData.cumpleanos) {
      updatedData.edad = calculateAge(updatedData.cumpleanos);
    }

    const response = await axios.put(`${API_BASE_URL}/staff/${staffId}`, updatedData, { headers });
    staffMember.value = response.data; // Update local data with response
    notificationStore.showNotification('Miembro del staff actualizado exitosamente.', 'success');
  } catch (err) {
    console.error('Error saving staff member:', err);
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al guardar los detalles del staff.', 'error');
  }
};

const deleteStaffMember = async () => {
  if (!confirm('¿Estás seguro de que quieres borrar a este miembro del staff?')) {
    return;
  }
  const staffId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.delete(`${API_BASE_URL}/staff/${staffId}`, { headers });
    notificationStore.showNotification('Miembro del staff eliminado exitosamente.', 'success');
    router.push('/staff'); // Redirect to staff list after deletion
  } catch (err) {
    console.error('Error deleting staff member:', err);
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al eliminar el miembro del staff.', 'error');
  }
};

const fetchEnums = async () => {
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get(`${API_BASE_URL}/proyectos/enums`, { headers }); // Reusing projects enums endpoint
    rolStaffEnumValues.value = response.data.RolStaff;
    modalidadStaffEnumValues.value = response.data.ModalidadStaff;
    experienciaStaffEnumValues.value = response.data.ExperienciaStaff;
  } catch (err) {
    notificationStore.showNotification('Error al cargar opciones de selección.', 'error');
    console.error('Error fetching enums:', err);
  }
};

const fetchAllProjects = async () => {
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get(`${API_BASE_URL}/proyectos`, { headers });
    allProjects.value = response.data.proyectos;
  } catch (err) {
    notificationStore.showNotification('Error al cargar proyectos disponibles.', 'error');
    console.error('Error fetching all projects:', err);
  }
};

const addProjectToStaff = async (projectId) => {
  const staffId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.post(`${API_BASE_URL}/proyectos/${projectId}/staff`, { staffId }, { headers });
    await fetchStaffMember(); // Re-fetch staff member to update assigned projects
    notificationStore.showNotification('Proyecto asignado exitosamente.', 'success');
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al asignar el proyecto.', 'error');
    console.error('Error adding project to staff:', err);
  }
};

const removeProjectFromStaff = async (projectId) => {
  if (!confirm('¿Quitar este proyecto del staff?')) return;
  const staffId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.delete(`${API_BASE_URL}/proyectos/${projectId}/staff/${staffId}`, { headers });
    await fetchStaffMember(); // Re-fetch staff member to update assigned projects
    notificationStore.showNotification('Proyecto quitado exitosamente.', 'success');
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al quitar el proyecto.', 'error');
    console.error('Error removing project from staff:', err);
  }
};

function calculateAge(birthdate) {
  if (!birthdate) return null;
  const birthDate = new Date(birthdate);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    years--;
  }
  return years;
}

onMounted(async () => {
  await fetchEnums();
  await fetchStaffMember();
  await fetchAllProjects();
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