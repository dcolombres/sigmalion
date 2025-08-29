<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useNotificationStore } from '../stores/notification';
import EditableDetailCard from '../components/EditableDetailCard.vue';
import AssignedListCard from '../components/AssignedListCard.vue';

const route = useRoute();
const project = ref(null);
const isLoading = ref(true);
const error = ref(null);
const activeTab = ref('summary');

const notificationStore = useNotificationStore();

const summaryFields = [
  { key: 'storyline', label: 'Storyline' },
  { key: 'proyecto_activo', label: 'Activo', type: 'boolean' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'subcategoria', label: 'Subcategoría' },
  { key: 'tier', label: 'Tier' },
  { key: 'origen_dependencia', label: 'Origen' },
  { key: 'subsecretaria_direccion', label: 'Dirección' },
  { key: 'caratula', label: 'Carátula', type: 'url' },
  { key: 'ticketera_interna', label: 'Ticketera Interna', type: 'url' },
  { key: 'ticketera_externa', label: 'Ticketera Externa', type: 'url' },
];

const summaryFormFields = [
  { key: 'storyline', label: 'Storyline', type: 'textarea' },
  { key: 'proyecto_activo', label: 'Activo', type: 'checkbox' },
  { key: 'categoria', label: 'Categoría', type: 'select', options: [{value: 'Aplicativo', text: 'Aplicativo'}, {value: 'Servicio', text: 'Servicio'}, {value: 'Sistema', text: 'Sistema'}, {value: 'Plataforma', text: 'Plataforma'}, {value: 'Formulario', text: 'Formulario'}, {value: 'Registro', text: 'Registro'}, {value: 'Tableros', text: 'Tableros'}, {value: 'APP_Mobile', text: 'APP Mobile'}, {value: 'Microservicio', text: 'Microservicio'}, {value: 'API', text: 'API'}, {value: 'Otra', text: 'Otra'}] },
  { key: 'subcategoria', label: 'Subcategoría', type: 'select', options: [{value: 'web', text: 'Web'}, {value: 'mobile', text: 'Mobile'}, {value: 'cms', text: 'CMS'}, {value: 'monitor', text: 'Monitor'}, {value: 'procesos', text: 'Procesos'}, {value: 'envio_masivo', text: 'Envío Masivo'}, {value: 'datos', text: 'Datos'}, {value: 'plataforma', text: 'Plataforma'}, {value: 'asesoramiento', text: 'Asesoramiento'}, {value: 'otra', text: 'Otra'}] },
  { key: 'tier', label: 'Tier', type: 'select', options: [{value: 'UNO', text: 'UNO'}, {value: 'DOS', text: 'DOS'}, {value: 'TRES', text: 'TRES'}, {value: 'CUATRO', text: 'CUATRO'}, {value: 'CINCO', text: 'CINCO'}] },
  { key: 'origen_dependencia', label: 'Origen', type: 'text' },
  { key: 'subsecretaria_direccion', label: 'Dirección', type: 'text' },
  { key: 'caratula', label: 'Carátula', type: 'text' },
  { key: 'ticketera_interna', label: 'Ticketera Interna', type: 'text' },
  { key: 'ticketera_externa', label: 'Ticketera Externa', type: 'text' },
];

const clientFields = [
  { key: 'cliente', label: 'Nombre Cliente' },
  { key: 'mail_cliente', label: 'Email' },
  { key: 'cel_cliente', label: 'Celular' },
  { key: 'fecha_inicio_desarrollo', label: 'Fecha Inicio Desarrollo', type: 'date' },
  { key: 'estado', label: 'Estado' },
];
const clientFormFields = [
  { key: 'cliente', label: 'Nombre Cliente', type: 'text', required: true },
  { key: 'mail_cliente', label: 'Email', type: 'email', required: true },
  { key: 'cel_cliente', label: 'Celular', type: 'text' },
  { key: 'fecha_inicio_desarrollo', label: 'Fecha Inicio Desarrollo', type: 'date' },
  { key: 'estado', label: 'Estado', type: 'select', options: [{ value: 'Activo', text: 'Activo' }, { value: 'Inactivo', text: 'Inactivo' }, { value: 'En Desarrollo', text: 'En Desarrollo' }, { value: 'Mantenimiento', text: 'Mantenimiento' }] },
];

const tecnologiasFields = [
  { key: 'lenguaje_desarrollo', label: 'Lenguaje' },
  { key: 'base_datos', label: 'Base de Datos' },
  { key: 'control_versiones', label: 'Ctrl. Versiones' },
  { key: 'tamano_bd', label: 'Tamaño BD' },
  { key: 'alojamiento_infra', label: 'Alojamiento' },
  { key: 'ano_inicio_sistema', label: 'Año Inicio' },
];
const tecnologiasFormFields = [
  { key: 'lenguaje_desarrollo', label: 'Lenguaje Desarrollo', type: 'text' },
  { key: 'base_datos', label: 'Base de Datos', type: 'text' },
  { key: 'control_versiones', label: 'Control de Versiones', type: 'text' },
  { key: 'tamano_bd', label: 'Tamaño BD', type: 'text' },
  { key: 'alojamiento_infra', label: 'Alojamiento Infra', type: 'text' },
  { key: 'ano_inicio_sistema', label: 'Año Inicio', type: 'number' },
];

const backendFields = [
    { key: 'lenguaje_principal_bckend', label: 'Lenguaje Principal' },
    { key: 'version_utilizada', label: 'Versión' },
    { key: 'lenguaje_secundario', label: 'Lenguaje Secundario' },
    { key: 'framework_bckend', label: 'Framework' },
    { key: 'otras_librerias', label: 'Otras Librerías' },
];

const backendFormFields = [
    { key: 'lenguaje_principal_bckend', label: 'Lenguaje Principal Backend', type: 'text' },
    { key: 'version_utilizada', label: 'Versión Utilizada', type: 'text' },
    { key: 'lenguaje_secundario', label: 'Lenguaje Secundario', type: 'text' },
    { key: 'framework_bckend', label: 'Framework Backend', type: 'text' },
    { key: 'otras_librerias', label: 'Otras Librerías', type: 'textarea' },
];

const frontendFields = [
    { key: 'lenguaje_principal_frontend', label: 'Lenguaje Principal' },
    { key: 'framework_frontend', label: 'Framework' },
    { key: 'otras_librerias_requeridas', label: 'Otras Librerías' },
];

const frontendFormFields = [
    { key: 'lenguaje_principal_frontend', label: 'Lenguaje Principal Frontend', type: 'text' },
    { key: 'framework_frontend', label: 'Framework Frontend', type: 'text' },
    { key: 'otras_librerias_requeridas', label: 'Otras Librerías Requeridas', type: 'textarea' },
];

const allStaff = ref([]);
const allIntegraciones = ref([]);

const availableStaff = computed(() => {
  if (!project.value || !project.value.staff) return allStaff.value;
  const assignedIds = new Set(project.value.staff.map(s => s.id));
  return allStaff.value.filter(s => !assignedIds.has(s.id));
});

const availableIntegraciones = computed(() => {
  if (!project.value || !project.value.integraciones) return allIntegraciones.value;
  const assignedIds = new Set(project.value.integraciones.map(i => i.id));
  return allIntegraciones.value.filter(i => !assignedIds.has(i.id));
});

const API_BASE_URL = 'http://localhost:3000/api';

const fetchProjectDetails = async () => {
  const projectId = route.params.id;
  isLoading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/proyectos/${projectId}`);
    project.value = response.data;
  } catch (err) {
    error.value = `Failed to load project #${projectId}.`;
    notificationStore.showNotification(`Error al cargar proyecto #${projectId}.`, 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchAllStaff = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/staff`);
    allStaff.value = response.data.staff;
  } catch (err) {
    notificationStore.showNotification('Error al cargar staff disponible.', 'error');
  }
};

const fetchAllIntegraciones = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/integraciones`);
    allIntegraciones.value = response.data.integraciones;
  } catch (err) {
    notificationStore.showNotification('Error al cargar integraciones disponibles.', 'error');
  }
};

const updateProjectSummary = async (data) => {
  const projectId = route.params.id;
  const summaryData = {};
  summaryFormFields.forEach(field => {
    if (data[field.key] !== null) {
      summaryData[field.key] = data[field.key];
    }
  });
  summaryData.titulo_proyecto = project.value.titulo_proyecto;
  try {
    const response = await axios.put(`${API_BASE_URL}/proyectos/${projectId}`, summaryData);
    project.value = response.data;
    notificationStore.showNotification('Resumen del proyecto actualizado exitosamente.', 'success');
  } catch (err) {
    notificationStore.showNotification('Hubo un error al guardar el resumen del proyecto.', 'error');
  }
};

const updateProjectSubEntity = async (entityName, data) => {
  const projectId = route.params.id;
  try {
    const response = await axios.put(`${API_BASE_URL}/proyectos/${projectId}/${entityName}`, data);
    project.value[entityName] = response.data;
    notificationStore.showNotification(`${entityName} actualizado exitosamente.`, 'success');
  } catch (err) {
    notificationStore.showNotification(`Hubo un error al guardar los detalles de ${entityName}.`, 'error');
  }
};

const addStaffToProject = async (staffId) => {
  const projectId = route.params.id;
  try {
    await axios.post(`${API_BASE_URL}/proyectos/${projectId}/staff`, { staffId });
    await fetchProjectDetails();
    notificationStore.showNotification('Staff añadido al proyecto exitosamente.', 'success');
  } catch (err) {
    notificationStore.showNotification('Hubo un error al añadir staff al proyecto.', 'error');
  }
};

const removeStaffFromProject = async (staffId) => {
  if (!confirm('¿Quitar a este miembro del proyecto?')) return;
  const projectId = route.params.id;
  try {
    await axios.delete(`${API_BASE_URL}/proyectos/${projectId}/staff/${staffId}`);
    await fetchProjectDetails();
    notificationStore.showNotification('Staff quitado del proyecto exitosamente.', 'success');
  } catch (err) {
    notificationStore.showNotification('Hubo un error al quitar staff del proyecto.', 'error');
  }
};

const addIntegracionToProject = async (integracionId) => {
  const projectId = route.params.id;
  try {
    await axios.post(`${API_BASE_URL}/proyectos/${projectId}/integraciones`, { integracionId });
    await fetchProjectDetails();
    notificationStore.showNotification('Integración añadida al proyecto exitosamente.', 'success');
  } catch (err) {
    notificationStore.showNotification('Hubo un error al añadir integración al proyecto.', 'error');
  }
};

const removeIntegracionFromProject = async (integracionId) => {
  if (!confirm('¿Quitar esta integración del proyecto?')) return;
  const projectId = route.params.id;
  try {
    await axios.delete(`${API_BASE_URL}/proyectos/${projectId}/integraciones/${integracionId}`);
    await fetchProjectDetails();
    notificationStore.showNotification('Integración quitada del proyecto exitosamente.', 'success');
  } catch (err) {
    notificationStore.showNotification('Hubo un error al quitar integración del proyecto.', 'error');
  }
};

onMounted(async () => {
  await fetchProjectDetails();
  await fetchAllStaff();
  await fetchAllIntegraciones();
});
</script>

<template>
  <div class="project-detail-view">
    <div v-if="isLoading" class="loading-container">
      <div class="spinner-border text-primary" role="status"></div>
      <p>Cargando detalles del proyecto...</p>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else-if="project">
      <header class="project-header">
        <div>
          <h1>{{ project.titulo_proyecto }}</h1>
          <span :class="['badge', project.proyecto_activo ? 'bg-success' : 'bg-danger']">
            {{ project.proyecto_activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        <RouterLink to="/" class="btn btn-secondary">&larr; Volver a la lista</RouterLink>
      </header>

      <div class="card tabs-card">
        <div class="card-header">
          <ul class="nav nav-tabs card-header-tabs">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'summary' }" @click="activeTab = 'summary'">Resumen</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'details' }" @click="activeTab = 'details'">Detalles</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'backend' }" @click="activeTab = 'backend'">Backend</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'frontend' }" @click="activeTab = 'frontend'">Frontend</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'staff' }" @click="activeTab = 'staff'">Staff</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'integrations' }" @click="activeTab = 'integrations'">Integraciones</a>
            </li>
          </ul>
        </div>
        <div class="card-body">
          <div v-show="activeTab === 'summary'">
            <EditableDetailCard
              :data="project"
              :fields="summaryFields"
              :formFields="summaryFormFields"
              @save="updateProjectSummary"
            />
          </div>
          <div v-show="activeTab === 'details'">
            <div class="row g-4">
              <div class="col-md-6">
                <EditableDetailCard title="Cliente" :data="project.cliente" :fields="clientFields" :formFields="clientFormFields" @save="(data) => updateProjectSubEntity('cliente', data)" />
              </div>
              <div class="col-md-6">
                <EditableDetailCard title="Tecnologías" :data="project.tecnologias" :fields="tecnologiasFields" :formFields="tecnologiasFormFields" @save="(data) => updateProjectSubEntity('tecnologias', data)" />
              </div>
            </div>
          </div>
          <div v-show="activeTab === 'backend'">
            <EditableDetailCard title="Backend" :data="project.backend_details" :fields="backendFields" :formFields="backendFormFields" @save="(data) => updateProjectSubEntity('backend_details', data)" />
          </div>
          <div v-show="activeTab === 'frontend'">
            <EditableDetailCard title="Frontend" :data="project.frontend_details" :fields="frontendFields" :formFields="frontendFormFields" @save="(data) => updateProjectSubEntity('frontend_details', data)" />
          </div>
          <div v-show="activeTab === 'staff'">
            <AssignedListCard
              title="Staff Asignado"
              itemType="Staff"
              :assignedItems="project.staff"
              :allItems="allStaff"
              nameField="nombre_completo"
              :tableHeaders="['Nombre', 'Email', 'Rol']"
              :displayFields="[{ key: 'nombre_completo', label: 'Nombre' }, { key: 'email', label: 'Email' }, { key: 'rol', label: 'Rol' }]"
              @add="addStaffToProject"
              @remove="removeStaffFromProject"
            />
          </div>
          <div v-show="activeTab === 'integrations'">
            <AssignedListCard
              title="Integraciones"
              itemType="Integración"
              :assignedItems="project.integraciones"
              :allItems="allIntegraciones"
              nameField="nombre"
              :tableHeaders="['Nombre']"
              :displayFields="[{ key: 'nombre', label: 'Nombre' }]"
              @add="addIntegracionToProject"
              @remove="removeIntegracionFromProject"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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

