<template>
  <main class="container mt-4">
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Cargando detalles del cliente...</p>
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="cliente" class="card p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="card-title">
          {{ cliente.cliente }}
        </h1>
        <RouterLink to="/clientes" class="btn btn-secondary">
          &larr; Volver a la lista de Clientes
        </RouterLink>
      </div>

      <div class="row g-4">
        <div class="col-md-12">
          <EditableDetailCard
            title="Detalles del Cliente"
            :data="cliente"
            :fields="clientFields"
            :form-fields="clientFormFields"
            @save="updateCliente"
          />
        </div>
        <div class="col-md-12">
          <AssignedListCard
            title="Proyectos Asignados"
            item-type="Proyecto"
            :assigned-items="cliente.proyectos"
            :all-items="allProjects"
            name-field="titulo_proyecto"
            :table-headers="['ID', 'Título del Proyecto']"
            :display-fields="[{ key: 'id', label: 'ID' }, { key: 'titulo_proyecto', label: 'Título del Proyecto' }]"
            @add="addProjectToClient"
            @remove="removeProjectFromClient"
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
const cliente = ref(null);
const isLoading = ref(true);
const error = ref(null);

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const API_BASE_URL = 'http://localhost:3000/api';

const allProjects = ref([]);
const estadoProyectoEnumValues = ref([]);

// const clientFields = [
//  { key: 'cliente', label: 'Nombre Cliente' },
//  { key: 'mail_cliente', label: 'Email' },
//  { key: 'cel_cliente', label: 'Celular' },
//  { key: 'observacion_general', label: 'Observación General' },
//  { key: 'nombre_publico', label: 'Nombre Público' },
//  { key: 'nombre_interno', label: 'Nombre Interno' },
//  { key: 'tipo', label: 'Tipo' },
//  { key: 'fecha_inicio_desarrollo', label: 'Fecha Inicio Desarrollo', type: 'date' },
//  { key: 'estado', label: 'Estado' },
//  { key: 'dependencia_uso', label: 'Dependencia de Uso' },
//  { key: 'uso_interno_ministerio', label: 'Uso Interno Ministerio', type: 'boolean' },
//  { key: 'uso_interno_equipo_desarrollo', label: 'Uso Interno Equipo Desarrollo', type: 'boolean' },];

const clientFields = [
{ key: 'cliente', label: 'Cliente' },
{ key: 'datos_de_contacto', label: 'Datos de Contacto' },
{ key: 'dependencia', label: 'Dependencia', placeholder: 'organigrama vigente' },
{ key: 'cel_cliente', label: 'Celular' },
{ key: 'observacion_general', label: 'Observaciones' },
{ key: 'nombre_publico', label: 'Nombre Público' },
{ key: 'nombre_interno', label: 'Nombre Interno' },
{ key: 'tipo', label: 'Tipo' },
{ key: 'fecha_inicio_desarrollo', label: 'Inicio Desarrollo', type: 'date' },
{ key: 'estado', label: 'Estado' },
{ key: 'dependencia_uso', label: 'Dependencia de Uso' }, { key: 'uso_interno_ministerio', label: 'Uso Interno Ministerio', type: 'boolean' },
{ key: 'uso_interno_equipo_desarrollo', label: 'Uso Interno Equipo', type: 'boolean' },];


const clientFormFields = ref([]); // Will be populated after fetching enums

const fetchClienteDetails = async () => {
  const clienteId = route.params.id;
  isLoading.value = true;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get(`${API_BASE_URL}/clientes/${clienteId}`, { headers });
    cliente.value = response.data;
  } catch (err) {
    console.error('Error fetching cliente:', err);
    error.value = `Failed to load cliente #${clienteId}.`;
    notificationStore.showNotification(`Error al cargar cliente #${clienteId}.`, 'error');
  } finally {
    isLoading.value = false;
  }
};

const updateCliente = async (updatedData) => {
  const clienteId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    // Format date for API if present
    if (updatedData.fecha_inicio_desarrollo) {
      updatedData.fecha_inicio_desarrollo = new Date(updatedData.fecha_inicio_desarrollo).toISOString();
    }

    const response = await axios.put(`${API_BASE_URL}/clientes/${clienteId}`, updatedData, { headers });
    cliente.value = response.data; // Update local data with response
    notificationStore.showNotification('Cliente actualizado exitosamente.', 'success');
  } catch (err) {
    console.error('Error saving cliente:', err);
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al guardar los detalles del cliente.', 'error');
  }
};

const deleteCliente = async () => {
  if (!confirm('¿Estás seguro de que quieres borrar este cliente?')) {
    return;
  }
  const clienteId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    await axios.delete(`${API_BASE_URL}/clientes/${clienteId}`, { headers });
    notificationStore.showNotification('Cliente eliminado exitosamente.', 'success');
    router.push('/clientes'); // Redirect to client list after deletion
  } catch (err) {
    console.error('Error deleting cliente:', err);
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al eliminar el cliente.', 'error');
  }
};

const fetchEnums = async () => {
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get(`${API_BASE_URL}/proyectos/enums`, { headers }); // Reusing projects enums endpoint
    estadoProyectoEnumValues.value = response.data.EstadoProyecto;

    // Dynamically create clientFormFields after enums are fetched
    clientFormFields.value = [
      { key: 'cliente', label: 'Nombre Cliente', type: 'text', required: true },
      { key: 'mail_cliente', label: 'Email', type: 'email' },
      { key: 'cel_cliente', label: 'Celular', type: 'text' },
      { key: 'observacion_general', label: 'Observación General', type: 'textarea' },
      { key: 'nombre_publico', label: 'Nombre Público', type: 'text' },
      { key: 'nombre_interno', label: 'Nombre Interno', type: 'text' },
      { key: 'tipo', label: 'Tipo', type: 'text' },
      { key: 'fecha_inicio_desarrollo', label: 'Fecha Inicio Desarrollo', type: 'date' },
      { key: 'estado', label: 'Estado', type: 'select', options: estadoProyectoEnumValues.value.map(v => ({ value: v, text: v.replace(/_/g, ' ') })) },
      { key: 'dependencia_uso', label: 'Dependencia de Uso', type: 'text' },
      { key: 'uso_interno_ministerio', label: 'Uso Interno Ministerio', type: 'checkbox' },
      { key: 'uso_interno_equipo_desarrollo', label: 'Uso Interno Equipo Desarrollo', type: 'checkbox' },
    ];

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

const addProjectToClient = async (projectId) => {
  const clienteId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    // Assuming backend has an endpoint like PUT /proyectos/:projectId/cliente to assign client
    // Or a POST /clientes/:clienteId/proyectos to assign project to client
    // Based on schema, a project has a clienteId, so we update the project.
    await axios.put(`${API_BASE_URL}/proyectos/${projectId}`, { clienteId: parseInt(clienteId) }, { headers });
    await fetchClienteDetails(); // Re-fetch client member to update assigned projects
    notificationStore.showNotification('Proyecto asignado exitosamente.', 'success');
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al asignar el proyecto.', 'error');
    console.error('Error adding project to client:', err);
  }
};

const removeProjectFromClient = async (projectId) => {
  if (!confirm('¿Quitar este proyecto del cliente?')) return;
  const clienteId = route.params.id;
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    // To remove a project from a client, we set its clienteId to null
    await axios.put(`${API_BASE_URL}/proyectos/${projectId}`, { clienteId: null }, { headers });
    await fetchClienteDetails(); // Re-fetch client member to update assigned projects
    notificationStore.showNotification('Proyecto quitado exitosamente.', 'success');
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al quitar el proyecto.', 'error');
    console.error('Error removing project from client:', err);
  }
};

onMounted(async () => {
  await fetchEnums();
  await fetchClienteDetails();
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