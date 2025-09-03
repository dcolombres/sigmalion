<template>
  <main class="container mt-4">
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Cargando detalles de la integración...</p>
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="integracion" class="card p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="card-title">
          {{ integracion.nombre }}
        </h1>
        <RouterLink to="/integraciones" class="btn btn-secondary">
          &larr; Volver a la lista de Integraciones
        </RouterLink>
      </div>

      <div class="row g-4">
        <div class="col-md-12">
          <EditableDetailCard
            title="Detalles de la Integración"
            :data="integracion"
            :fields="integracionFields"
            :form-fields="integracionFormFields"
            @save="updateIntegracion"
          />
        </div>
        <div class="col-md-12">
          <AssignedListCard
            title="Proyectos Asignados"
            item-type="Proyecto"
            :assigned-items="integracion.proyectos"
            :all-items="allProjects"
            name-field="titulo_proyecto"
            :table-headers="['ID', 'Título del Proyecto']"
            :display-fields="[{ key: 'id', label: 'ID' }, { key: 'titulo_proyecto', label: 'Título del Proyecto' }]"
            @add="addProjectToIntegracion"
            @remove="removeProjectFromIntegracion"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useNotificationStore } from '@/stores/notification';
import EditableDetailCard from '@/components/EditableDetailCard.vue';
import AssignedListCard from '@/components/AssignedListCard.vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const integracion = ref(null);
const isLoading = ref(true);
const error = ref(null);

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const API_BASE_URL = 'http://localhost:3000/api';

const allProjects = ref([]);

const integracionFields = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'detalles', label: 'Detalles' },
];

const integracionFormFields = [
  { key: 'nombre', label: 'Nombre', type: 'text', required: true },
  { key: 'detalles', label: 'Detalles', type: 'textarea' },
];

const fetchIntegracionDetails = async () => {
  const integracionId = route.params.id;
  isLoading.value = true;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get(`${API_BASE_URL}/integraciones/${integracionId}`, { headers });
    integracion.value = response.data;
  } catch (err) {
    console.error('Error fetching integracion:', err);
    error.value = `Failed to load integracion #${integracionId}.`;
    notificationStore.showNotification(`Error al cargar integración #${integracionId}.`, 'error');
  } finally {
    isLoading.value = false;
  }
};

const updateIntegracion = async (updatedData) => {
  const integracionId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.put(`${API_BASE_URL}/integraciones/${integracionId}`, updatedData, { headers });
    integracion.value = response.data; // Update local data with response
    notificationStore.showNotification('Integración actualizada exitosamente.', 'success');
  } catch (err) {
    console.error('Error saving integracion:', err);
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al guardar los detalles de la integración.', 'error');
  }
};

const deleteIntegracion = async () => {
  if (!confirm('¿Estás seguro de que quieres borrar esta integración?')) {
    return;
  }
  const integracionId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.delete(`${API_BASE_URL}/integraciones/${integracionId}`, { headers });
    notificationStore.showNotification('Integración eliminada exitosamente.', 'success');
    router.push('/integraciones'); // Redirect to integrations list after deletion
  } catch (err) {
    console.error('Error deleting integracion:', err);
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al eliminar la integración.', 'error');
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

const addProjectToIntegracion = async (projectId) => {
  const integracionId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.post(`${API_BASE_URL}/proyectos/${projectId}/integraciones`, { integracionId: parseInt(integracionId) }, { headers });
    await fetchIntegracionDetails(); // Re-fetch integration to update assigned projects
    notificationStore.showNotification('Proyecto asignado exitosamente.', 'success');
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al asignar el proyecto.', 'error');
    console.error('Error adding project to integration:', err);
  }
};

const removeProjectFromIntegracion = async (projectId) => {
  if (!confirm('¿Quitar este proyecto de la integración?')) return;
  const integracionId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.delete(`${API_BASE_URL}/proyectos/${projectId}/integraciones/${integracionId}`, { headers });
    await fetchIntegracionDetails(); // Re-fetch integration to update assigned projects
    notificationStore.showNotification('Proyecto quitado exitosamente.', 'success');
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al quitar el proyecto.', 'error');
    console.error('Error removing project from integration:', err);
  }
};

onMounted(async () => {
  await fetchIntegracionDetails();
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