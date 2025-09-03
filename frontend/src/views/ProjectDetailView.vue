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
  { key: 'titulo_proyecto', label: 'Título del Proyecto' },
  { key: 'storyline', label: 'Storyline' },
  { key: 'proyecto_activo', label: 'Activo', type: 'boolean' },
  { key: 'origen_dependencia', label: 'Origen' },
  { key: 'subsecretaria_direccion', label: 'Dirección' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'subcategoria', label: 'Subcategoría' },
  { key: 'recursos', label: 'Recursos' },
  { key: 'urls', label: 'URLs', type: 'url' },
  { key: 'captura', label: 'Captura', type: 'url' },
  { key: 'caratula', label: 'Carátula', type: 'url' },
  { key: 'ticketera_interna', label: 'Ticketera Interna', type: 'url' },
  { key: 'ticketera_externa', label: 'Ticketera Externa', type: 'url' },
  { key: 'tier', label: 'Tier' },
  { key: 'cantidad_recursos_asignados', label: 'Cant. Recursos Asignados' },
];

const summaryFormFields = [
  { key: 'titulo_proyecto', label: 'Título del Proyecto', type: 'text', required: true },
  { key: 'storyline', label: 'Storyline', type: 'textarea' },
  { key: 'proyecto_activo', label: 'Activo', type: 'checkbox' },
  { key: 'origen_dependencia', label: 'Origen', type: 'text' },
  { key: 'subsecretaria_direccion', label: 'Dirección', type: 'text' },
  { key: 'categoria', label: 'Categoría', type: 'select', options: [{value: 'Aplicativo', text: 'Aplicativo'}, {value: 'Servicio', text: 'Servicio'}, {value: 'Sistema', text: 'Sistema'}, {value: 'Plataforma', text: 'Plataforma'}, {value: 'Formulario', text: 'Formulario'}, {value: 'Registro', text: 'Registro'}, {value: 'Tableros', text: 'Tableros'}, {value: 'APP_Mobile', text: 'APP Mobile'}, {value: 'Microservicio', text: 'Microservicio'}, {value: 'API', text: 'API'}, {value: 'Otra', text: 'Otra'}] },
  { key: 'subcategoria', label: 'Subcategoría', type: 'select', options: [{value: 'web', text: 'Web'}, {value: 'mobile', text: 'Mobile'}, {value: 'cms', text: 'CMS'}, {value: 'monitor', text: 'Monitor'}, {value: 'procesos', text: 'Procesos'}, {value: 'envio_masivo', text: 'Envío Masivo'}, {value: 'datos', text: 'Datos'}, {value: 'plataforma', text: 'Plataforma'}, {value: 'asesoramiento', text: 'Asesoramiento'}, {value: 'otra', text: 'Otra'}] },
  { key: 'recursos', label: 'Recursos', type: 'textarea' },
  { key: 'urls', label: 'URLs', type: 'text' },
  { key: 'captura', label: 'Captura', type: 'text' },
  { key: 'caratula', label: 'Carátula', type: 'text' },
  { key: 'ticketera_interna', label: 'Ticketera Interna', type: 'text' },
  { key: 'ticketera_externa', label: 'Ticketera Externa', type: 'text' },
  { key: 'tier', label: 'Tier', type: 'select', options: [{value: 'UNO', text: 'UNO'}, {value: 'DOS', text: 'DOS'}, {value: 'TRES', text: 'TRES'}, {value: 'CUATRO', text: 'CUATRO'}, {value: 'CINCO', text: 'CINCO'}] },
  { key: 'cantidad_recursos_asignados', label: 'Cant. Recursos Asignados', type: 'number' },
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
  { key: 'tamano_bd_value', label: 'Tamaño BD (Valor)' },
  { key: 'tamano_bd_unit', label: 'Tamaño BD (Unidad)' },
  { key: 'alojamiento_infra', label: 'Alojamiento' },
  { key: 'ano_inicio_sistema', label: 'Año Inicio' },
];
const tecnologiasFormFields = [
  { key: 'lenguaje_desarrollo', label: 'Lenguaje Desarrollo', type: 'text' },
  { key: 'base_datos', label: 'Base de Datos', type: 'text' },
  { key: 'control_versiones', label: 'Control de Versiones', type: 'text' },
  { key: 'tamano_bd_value', label: 'Tamaño BD (Valor)', type: 'number' },
  { key: 'tamano_bd_unit', label: 'Tamaño BD (Unidad)', type: 'select', options: [{value: 'MB', text: 'MB'}, {value: 'GB', text: 'GB'}] },
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
    { key: 'herramientas_desarrollo', label: 'Herramientas de Desarrollo' },
    { key: 'ide_compiladores', label: 'IDE/Compiladores' },
    { key: 'version_ide_comp', label: 'Versión IDE/Comp.' },
    { key: 'modo_licenciamiento', label: 'Modo de Licenciamiento' },
];

const frontendFormFields = [
    { key: 'lenguaje_principal_frontend', label: 'Lenguaje Principal Frontend', type: 'text' },
    { key: 'framework_frontend', label: 'Framework Frontend', type: 'text' },
    { key: 'otras_librerias_requeridas', label: 'Otras Librerías Requeridas', type: 'textarea' },
    { key: 'herramientas_desarrollo', label: 'Herramientas de Desarrollo', type: 'text' },
    { key: 'ide_compiladores', label: 'IDE/Compiladores', type: 'text' },
    { key: 'version_ide_comp', label: 'Versión IDE/Comp.', type: 'text' },
    { key: 'modo_licenciamiento', label: 'Modo de Licenciamiento', type: 'text' },
];

const infraestructuraFields = [
    { key: 'arq_hardware', label: 'Arq. Hardware' },
    { key: 'hosting_en_data_center', label: 'Hosting en Data Center', type: 'boolean' },
    { key: 'virtualizado', label: 'Virtualizado', type: 'boolean' },
    { key: 'ubicacion_servidor', label: 'Ubicación Servidor' },
    { key: 'servidor_web', label: 'Servidor Web' },
    { key: 'nombre_comercial_srv', label: 'Nombre Comercial Srv' },
    { key: 'version_srv', label: 'Versión Srv' },
    { key: 'hosting_srv', label: 'Hosting Srv', type: 'boolean' },
    { key: 'virtualizado_srv', label: 'Virtualizado Srv', type: 'boolean' },
    { key: 'ubicacion_srv', label: 'Ubicación Srv' },
    { key: 'escalado_srv', label: 'Escalado Srv' },
    { key: 'entorno_cliente_so_soportadas', label: 'Entorno Cliente SO Soportadas' },
    { key: 'navegadores_versiones', label: 'Navegadores Versiones' },
    { key: 'req_instalar_paq_adicionales', label: 'Req. Instalar Paq. Adicionales', type: 'boolean' },
    { key: 'paquetes_adicionales_necesarios', label: 'Paquetes Adicionales Necesarios' },
    { key: 'modelo_seguridad', label: 'Modelo Seguridad' },
    { key: 'posee_entorno_test', label: 'Posee Entorno Test', type: 'boolean' },
    { key: 'test_automatico', label: 'Test Automático', type: 'boolean' },
    { key: 'ubicacion_doc_deploy', label: 'Ubicación Doc Deploy' },
];

const infraestructuraFormFields = [
    { key: 'arq_hardware', label: 'Arq. Hardware', type: 'text' },
    { key: 'hosting_en_data_center', label: 'Hosting en Data Center', type: 'checkbox' },
    { key: 'virtualizado', label: 'Virtualizado', type: 'checkbox' },
    { key: 'ubicacion_servidor', label: 'Ubicación Servidor', type: 'text' },
    { key: 'servidor_web', label: 'Servidor Web', type: 'text' },
    { key: 'nombre_comercial_srv', label: 'Nombre Comercial Srv', type: 'text' },
    { key: 'version_srv', label: 'Versión Srv', type: 'text' },
    { key: 'hosting_srv', label: 'Hosting Srv', type: 'checkbox' },
    { key: 'virtualizado_srv', label: 'Virtualizado Srv', type: 'checkbox' },
    { key: 'ubicacion_srv', label: 'Ubicación Srv', type: 'text' },
    { key: 'escalado_srv', label: 'Escalado Srv', type: 'text' },
    { key: 'entorno_cliente_so_soportadas', label: 'Entorno Cliente SO Soportadas', type: 'text' },
    { key: 'navegadores_versiones', label: 'Navegadores Versiones', type: 'text' },
    { key: 'req_instalar_paq_adicionales', label: 'Req. Instalar Paq. Adicionales', type: 'checkbox' },
    { key: 'paquetes_adicionales_necesarios', label: 'Paquetes Adicionales Necesarios', type: 'textarea' },
    { key: 'modelo_seguridad', label: 'Modelo Seguridad', type: 'text' },
    { key: 'posee_entorno_test', label: 'Posee Entorno Test', type: 'checkbox' },
    { key: 'test_automatico', label: 'Test Automático', type: 'checkbox' },
    { key: 'ubicacion_doc_deploy', label: 'Ubicación Doc Deploy', type: 'text' },
];

const databasesFields = [
    { key: 'herramientas_desarrollo', label: 'Herramientas Desarrollo' },
    { key: 'ide_compiladores', label: 'IDE/Compiladores' },
    { key: 'version_ide_comp', label: 'Versión IDE/Comp.' },
    { key: 'modo_licenciamiento_ide', label: 'Modo Licenciamiento IDE' },
    { key: 'base_datos_nombre_comercial', label: 'BD Nombre Comercial' },
    { key: 'version_bd', label: 'Versión BD' },
    { key: 'modo_licencia_bd', label: 'Modo Licencia BD' },
    { key: 'tipo_licencia_bd', label: 'Tipo Licencia BD' },
    { key: 'herramienta_desarrollo_bd', label: 'Herramienta Desarrollo BD' },
    { key: 'tamano_actual_value', label: 'Tamaño Actual (Valor)' },
    { key: 'tamano_actual_unit', label: 'Tamaño Actual (Unidad)' },
    { key: 'tamano_max_permitido_value', label: 'Tamaño Max. Permitido (Valor)' },
    { key: 'tamano_max_permitido_unit', label: 'Tamaño Max. Permitido (Unidad)' },
    { key: 'servidor_que_aloja', label: 'Servidor que Aloja' },
    { key: 'mantenimiento', label: 'Mantenimiento' },
    { key: 'backup_periodico', label: 'Backup Periódico', type: 'boolean' },
    { key: 'depuracion_automatica', label: 'Depuración Automática', type: 'boolean' },
    { key: 'responsable_mantenimiento', label: 'Responsable Mantenimiento' },
    { key: 'contiene_store_procedure', label: 'Contiene Store Procedure', type: 'boolean' },
    { key: 'servidor_ejecucion_so', label: 'Servidor Ejecución SO', type: 'boolean' },
    { key: 'version_so', label: 'Versión SO', type: 'text' },
];

const databasesFormFields = [
    { key: 'herramientas_desarrollo', label: 'Herramientas Desarrollo', type: 'text' },
    { key: 'ide_compiladores', label: 'IDE/Compiladores', type: 'text' },
    { key: 'version_ide_comp', label: 'Versión IDE/Comp.', type: 'text' },
    { key: 'modo_licenciamiento_ide', label: 'Modo Licenciamiento IDE', type: 'text' },
    { key: 'base_datos_nombre_comercial', label: 'Base de Datos Nombre Comercial', type: 'text' },
    { key: 'version_bd', label: 'Versión BD', type: 'text' },
    { key: 'modo_licencia_bd', label: 'Modo Licencia BD', type: 'text' },
    { key: 'tipo_licencia_bd', label: 'Tipo Licencia BD', type: 'text' },
    { key: 'herramienta_desarrollo_bd', label: 'Herramienta Desarrollo BD', type: 'text' },
    { key: 'tamano_actual_value', label: 'Tamaño Actual (Valor)', type: 'number' },
    { key: 'tamano_actual_unit', label: 'Tamaño Actual (Unidad)', type: 'select', options: [{value: 'MB', text: 'MB'}, {value: 'GB', text: 'GB'}] },
    { key: 'tamano_max_permitido_value', label: 'Tamaño Max. Permitido (Valor)', type: 'number' },
    { key: 'tamano_max_permitido_unit', label: 'Tamaño Max. Permitido (Unidad)', type: 'select', options: [{value: 'MB', text: 'MB'}, {value: 'GB', text: 'GB'}] },
    { key: 'servidor_que_aloja', label: 'Servidor que Aloja', type: 'text' },
    { key: 'mantenimiento', label: 'Mantenimiento', type: 'text' },
    { key: 'backup_periodico', label: 'Backup Periódico', type: 'checkbox' },
    { key: 'depuracion_automatica', label: 'Depuración Automática', type: 'checkbox' },
    { key: 'responsable_mantenimiento', label: 'Responsable Mantenimiento', type: 'text' },
    { key: 'contiene_store_procedure', label: 'Contiene Store Procedure', type: 'checkbox' },
    { key: 'servidor_ejecucion_so', label: 'Servidor Ejecución SO', type: 'text' },
    { key: 'version_so', label: 'Versión SO', type: 'text' },
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
    // Convert date to ISO string if entity is 'cliente' and date exists
    if (entityName === 'cliente' && data.fecha_inicio_desarrollo) {
      data.fecha_inicio_desarrollo = new Date(data.fecha_inicio_desarrollo).toISOString();
    }
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
    <div
      v-if="isLoading"
      class="loading-container"
    >
      <div
        class="spinner-border text-primary"
        role="status"
      />
      <p>Cargando detalles del proyecto...</p>
    </div>
    <div
      v-else-if="error"
      class="alert alert-danger"
    >
      {{ error }}
    </div>
    <div v-else-if="project">
      <header class="project-header">
        <div>
          <h1>{{ project.titulo_proyecto }}</h1>
          <span :class="['badge', project.proyecto_activo ? 'bg-success' : 'bg-danger']">
            {{ project.proyecto_activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        <RouterLink
          to="/"
          class="btn btn-secondary"
        >
          &larr; Volver a la lista
        </RouterLink>
      </header>

      <div class="card tabs-card">
        <div class="card-header">
          <ul class="nav nav-tabs card-header-tabs">
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: activeTab === 'summary' }"
                @click="activeTab = 'summary'"
              >Resumen</a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: activeTab === 'details' }"
                @click="activeTab = 'details'"
              >Detalles</a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: activeTab === 'staff' }"
                @click="activeTab = 'staff'"
              >Staff</a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: activeTab === 'integrations' }"
                @click="activeTab = 'integrations'"
              >Integraciones</a>
            </li>
          </ul>
        </div>
        <div class="card-body">
          <div v-show="activeTab === 'summary'">
            <EditableDetailCard
              title="Resumen"
              :data="project"
              :fields="summaryFields"
              :form-fields="summaryFormFields"
              @save="updateProjectSummary"
            />
          </div>
          <div v-show="activeTab === 'details'">
            <div class="row g-4">
              <div class="col-md-6">
                <EditableDetailCard
                  title="Cliente"
                  :data="project.cliente"
                  :fields="clientFields"
                  :form-fields="clientFormFields"
                  @save="(data) => updateProjectSubEntity('cliente', data)"
                />
              </div>
              <div class="col-md-6">
                <EditableDetailCard
                  title="Tecnologías"
                  :data="project.tecnologias"
                  :fields="tecnologiasFields"
                  :form-fields="tecnologiasFormFields"
                  @save="(data) => updateProjectSubEntity('tecnologias', data)"
                />
              </div>
              <div class="col-md-6">
                <EditableDetailCard
                  title="Backend"
                  :data="project.backend_details"
                  :fields="backendFields"
                  :form-fields="backendFormFields"
                  @save="(data) => updateProjectSubEntity('backend-details', data)"
                />
              </div>
              <div class="col-md-6">
                <EditableDetailCard
                  title="Frontend"
                  :data="project.frontend_details"
                  :fields="frontendFields"
                  :form-fields="frontendFormFields"
                  @save="(data) => updateProjectSubEntity('frontend-details', data)"
                />
              </div>
              <div class="col-md-6">
                <EditableDetailCard
                  title="Infraestructura"
                  :data="project.infraestructura"
                  :fields="infraestructuraFields"
                  :form-fields="infraestructuraFormFields"
                  @save="(data) => updateProjectSubEntity('infraestructura', data)"
                />
              </div>
              <div class="col-md-6">
                <EditableDetailCard
                  title="Databases"
                  :data="project.databases"
                  :fields="databasesFields"
                  :form-fields="databasesFormFields"
                  @save="(data) => updateProjectSubEntity('databases', data)"
                />
              </div>
            </div>
          </div>
          <div v-show="activeTab === 'staff'">
            <AssignedListCard
              title="Staff Asignado"
              item-type="Staff"
              :assigned-items="project.staff"
              :all-items="allStaff"
              name-field="nombre_completo"
              :table-headers="['Nombre', 'Email', 'Rol']"
              :display-fields="[{ key: 'nombre_completo', label: 'Nombre' }, { key: 'email', label: 'Email' }, { key: 'rol', label: 'Rol' }]"
              @add="addStaffToProject"
              @remove="removeStaffFromProject"
            />
          </div>
          <div v-show="activeTab === 'integrations'">
            <AssignedListCard
              title="Integraciones"
              item-type="Integración"
              :assigned-items="project.integraciones"
              :all-items="allIntegraciones"
              name-field="nombre"
              :table-headers="['Nombre']"
              :display-fields="[{ key: 'nombre', label: 'Nombre' }]"
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