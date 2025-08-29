<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useNotificationStore } from '../stores/notification'; // Import notification store
import DetailCard from '../components/DetailCard.vue';
import EditableDetailCard from '../components/EditableDetailCard.vue';
import AssignedListCard from '../components/AssignedListCard.vue';

const route = useRoute();
const project = ref(null);
const isLoading = ref(true);
const error = ref(null);

const notificationStore = useNotificationStore(); // Use notification store

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

// --- Field Definitions for DetailCard and EditableDetailCard ---

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

const infraestructuraFields = [
  { key: 'arq_hardware', label: 'Arq. Hardware' },
  { key: 'hosting_en_data_center', label: 'Hosting Data Center', type: 'boolean' },
  { key: 'virtualizado', label: 'Virtualizado', type: 'boolean' },
  { key: 'ubicacion_servidor', label: 'Ubicación Servidor' },
  { key: 'servidor_web', label: 'Servidor Web' },
  { key: 'nombre_comercial_srv', label: 'Nombre Comercial Srv' },
  { key: 'version_srv', label: 'Versión Srv' },
  { key: 'hosting_srv', label: 'Hosting Srv', type: 'boolean' },
  { key: 'virtualizado_srv', label: 'Virtualizado Srv', type: 'boolean' },
  { key: 'ubicacion_srv', label: 'Ubicación Srv (Sec.)' },
  { key: 'escalado_srv', label: 'Escalado Srv' },
  { key: 'entorno_cliente_so_soportadas', label: 'SO Soportados' },
  { key: 'navegadores_versiones', label: 'Navegadores' },
  { key: 'req_instalar_paq_adicionales', label: 'Req. Paq. Adicionales', type: 'boolean' },
  { key: 'paquetes_adicionales_necesarios', label: 'Paq. Adicionales' },
  { key: 'modelo_seguridad', label: 'Modelo Seguridad' },
  { key: 'posee_entorno_test', label: 'Posee Entorno Test', type: 'boolean' },
  { key: 'test_automatico', label: 'Test Automático', type: 'boolean' },
  { key: 'ubicacion_doc_deploy', label: 'Ubicación Doc Deploy' },
];
const infraestructuraFormFields = [
  { key: 'arq_hardware', label: 'Arquitectura Hardware', type: 'text' },
  { key: 'hosting_en_data_center', label: 'Hosting en Data Center', type: 'checkbox' },
  { key: 'virtualizado', label: 'Virtualizado', type: 'checkbox' },
  { key: 'ubicacion_servidor', label: 'Ubicación Servidor', type: 'text' },
  { key: 'servidor_web', label: 'Servidor Web', type: 'text' },
  { key: 'nombre_comercial_srv', label: 'Nombre Comercial Servidor', type: 'text' },
  { key: 'version_srv', label: 'Versión Servidor', type: 'text' },
  { key: 'hosting_srv', label: 'Hosting Servidor', type: 'checkbox' },
  { key: 'virtualizado_srv', label: 'Virtualizado Servidor', type: 'checkbox' },
  { key: 'ubicacion_srv', label: 'Ubicación Servidor (Secundario)', type: 'text' },
  { key: 'escalado_srv', label: 'Escalado Servidor', type: 'text' },
  { key: 'entorno_cliente_so_soportadas', label: 'SO Soportados', type: 'textarea' },
  { key: 'navegadores_versiones', label: 'Navegadores/Versiones', type: 'textarea' },
  { key: 'req_instalar_paq_adicionales', label: 'Req. Paquetes Adicionales', type: 'checkbox' },
  { key: 'paquetes_adicionales_necesarios', label: 'Paquetes Adicionales Necesarios', type: 'textarea' },
  { key: 'modelo_seguridad', label: 'Modelo Seguridad', type: 'textarea' },
  { key: 'posee_entorno_test', label: 'Posee Entorno Test', type: 'checkbox' },
  { key: 'test_automatico', label: 'Test Automático', type: 'checkbox' },
  { key: 'ubicacion_doc_deploy', label: 'Ubicación Doc Deploy', type: 'text' },
];

const licenciasFields = [
  { key: 'herramientas_desarrollo', label: 'Herramientas Desarrollo' },
  { key: 'ide_compiladores', label: 'IDE Compiladores' },
  { key: 'version_ide_comp', label: 'Versión IDE Comp.' },
  { key: 'modo_licenciamiento_ide', label: 'Modo Licenciamiento IDE' },
  { key: 'base_datos_nombre_comercial', label: 'BD Nombre Comercial' },
  { key: 'version_bd', label: 'Versión BD' },
  { key: 'modo_licencia_bd', label: 'Modo Licencia BD' },
  { key: 'tipo_licencia_bd', label: 'Tipo Licencia BD' },
  { key: 'herramienta_desarrollo_bd', label: 'Herramienta Desarrollo BD' },
  { key: 'tamano_actual', label: 'Tamaño Actual' },
  { key: 'tamano_max_permitido', label: 'Tamaño Máx. Permitido' },
  { key: 'servidor_que_aloja', label: 'Servidor que Aloja' },
  { key: 'mantenimiento', label: 'Mantenimiento' },
  { key: 'backup_periodico', label: 'Backup Periódico', type: 'boolean' },
  { key: 'depuracion_automatica', label: 'Depuración Automática', type: 'boolean' },
  { key: 'responsable_mantenimiento', label: 'Responsable Mantenimiento' },
  { key: 'contiene_store_procedure', label: 'Contiene Store Procedure', type: 'boolean' },
  { key: 'servidor_ejecucion_so', label: 'Servidor Ejecución SO' },
  { key: 'version_so', label: 'Versión SO' },
];
const licenciasFormFields = [
  { key: 'herramientas_desarrollo', label: 'Herramientas Desarrollo', type: 'text' },
  { key: 'ide_compiladores', label: 'IDE Compiladores', type: 'text' },
  { key: 'version_ide_comp', label: 'Versión IDE Comp.', type: 'text' },
  { key: 'modo_licenciamiento_ide', label: 'Modo Licenciamiento IDE', type: 'text' },
  { key: 'base_datos_nombre_comercial', label: 'BD Nombre Comercial', type: 'text' },
  { key: 'version_bd', label: 'Versión BD', type: 'text' },
  { key: 'modo_licencia_bd', label: 'Modo Licencia BD', type: 'text' },
  { key: 'tipo_licencia_bd', label: 'Tipo Licencia BD', type: 'text' },
  { key: 'herramienta_desarrollo_bd', label: 'Herramienta Desarrollo BD', type: 'text' },
  { key: 'tamano_actual', label: 'Tamaño Actual', type: 'text' },
  { key: 'tamano_max_permitido', label: 'Tamaño Máx. Permitido', type: 'text' },
  { key: 'servidor_que_aloja', label: 'Servidor que Aloja', type: 'text' },
  { key: 'mantenimiento', label: 'Mantenimiento', type: 'textarea' },
  { key: 'backup_periodico', label: 'Backup Periódico', type: 'checkbox' },
  { key: 'depuracion_automatica', label: 'Depuración Automática', type: 'checkbox' },
  { key: 'responsable_mantenimiento', label: 'Responsable Mantenimiento', type: 'text' },
  { key: 'contiene_store_procedure', label: 'Contiene Store Procedure', type: 'checkbox' },
  { key: 'servidor_ejecucion_so', label: 'Servidor Ejecución SO', type: 'text' },
  { key: 'version_so', label: 'Versión SO', type: 'text' },
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
  { key: 'herramientas_desarrollo', label: 'Herramientas Desarrollo' },
  { key: 'ide_compiladores', label: 'IDE Compiladores' },
  { key: 'version_ide_comp', label: 'Versión IDE Comp.' },
  { key: 'modo_licenciamiento', label: 'Modo Licenciamiento' },
];
const frontendFormFields = [
  { key: 'lenguaje_principal_frontend', label: 'Lenguaje Principal Frontend', type: 'text' },
  { key: 'framework_frontend', label: 'Framework Frontend', type: 'text' },
  { key: 'otras_librerias_requeridas', label: 'Otras Librerías Requeridas', type: 'textarea' },
  { key: 'herramientas_desarrollo', label: 'Herramientas Desarrollo', type: 'text' },
  { key: 'ide_compiladores', label: 'IDE Compiladores', type: 'text' },
  { key: 'version_ide_comp', label: 'Versión IDE Comp.', type: 'text' },
  { key: 'modo_licenciamiento', label: 'Modo Licenciamiento', type: 'text' },
];

// --- State for various editable sections (simplified) ---
const allStaff = ref([]);
const allIntegraciones = ref([]);

// --- Computed Properties ---
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

// --- API Calls ---
const API_BASE_URL = 'http://localhost:3000/api';

const fetchProjectDetails = async () => {
  const projectId = route.params.id;
  isLoading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/proyectos/${projectId}`);
    project.value = response.data;
  } catch (err) {
    console.error('Error fetching project details:', err);
    error.value = `Failed to load project #${projectId}.`;
    notificationStore.showNotification(`Error al cargar proyecto #${projectId}.`, 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchAllStaff = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/staff`);
    allStaff.value = response.data.staff; // Assuming staff endpoint returns { staff: [], totalCount: N }
  } catch (err) {
    console.error('Error fetching staff:', err);
    notificationStore.showNotification('Error al cargar staff disponible.', 'error');
  }
};

const fetchAllIntegraciones = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/integraciones`);
    allIntegraciones.value = response.data.integraciones; // Assuming integraciones endpoint returns { integraciones: [], totalCount: N }
  } catch (err) {
    console.error('Error fetching integraciones:', err);
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

  // Add the required titulo_proyecto field
  summaryData.titulo_proyecto = project.value.titulo_proyecto;

  try {
    const response = await axios.put(`${API_BASE_URL}/proyectos/${projectId}`, summaryData);
    console.log('Backend response data:', response.data); // Debugging line
    project.value = response.data;
    notificationStore.showNotification('Resumen del proyecto actualizado exitosamente.', 'success');
  } catch (err) {
    console.error('Error saving project summary:', err);
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
    console.error(`Error saving ${entityName} details:`, err);
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
    console.error('Error adding staff to project:', err);
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
    console.error('Error removing staff from project:', err);
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
    console.error('Error adding integracion to project:', err);
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
    console.error('Error removing integracion from project:', err);
    notificationStore.showNotification('Hubo un error al quitar integración del proyecto.', 'error');
  }
};

// --- Lifecycle Hook ---
onMounted(async () => {
  await fetchProjectDetails();
  await fetchAllStaff();
  await fetchAllIntegraciones();
});
</script>

<template>
  <div class="container mt-4">
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Cargando detalles del proyecto...</p>
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="project" class="project-detail">
      <header class="d-flex justify-content-between align-items-center mb-4">
        <h1>{{ project.titulo_proyecto }}</h1>
        <RouterLink to="/" class="btn btn-secondary">&larr; Volver</RouterLink>
      </header>

      <div class="mb-4">
        <EditableDetailCard
          title="Resumen del Proyecto"
          icon="fa-file-alt"
          :data="project"
          :fields="summaryFields"
          :formFields="summaryFormFields"
          @save="updateProjectSummary"
        />
      </div>

      <div class="row g-4">
        <!-- Cliente Section -->
        <div class="col-md-6">
          <EditableDetailCard
            title="Cliente"
            :data="project.cliente"
            :fields="clientFields"
            :formFields="clientFormFields"
            @save="(data) => updateProjectSubEntity('cliente', data)"
          />
        </div>

        <!-- Tecnologias Section -->
        <div class="col-md-6">
          <EditableDetailCard
            title="Tecnologías"
            :data="project.tecnologias"
            :fields="tecnologiasFields"
            :formFields="tecnologiasFormFields"
            @save="(data) => updateProjectSubEntity('tecnologias', data)"
          />
        </div>

        <!-- Backend Details Section -->
        <div class="col-md-6">
          <EditableDetailCard
            title="Backend"
            :data="project.backend_details"
            :fields="backendFields"
            :formFields="backendFormFields"
            @save="(data) => updateProjectSubEntity('backend_details', data)"
          />
        </div>

        <!-- Frontend Details Section -->
        <div class="col-md-6">
          <EditableDetailCard
            title="Frontend"
            :data="project.frontend_details"
            :fields="frontendFields"
            :formFields="frontendFormFields"
            @save="(data) => updateProjectSubEntity('frontend_details', data)"
          />
        </div>

        <!-- Infraestructura Section -->
        <div class="col-md-6">
          <EditableDetailCard
            title="Infraestructura"
            :data="project.infraestructura"
            :fields="infraestructuraFields"
            :formFields="infraestructuraFormFields"
            @save="(data) => updateProjectSubEntity('infraestructura', data)"
          />
        </div>

        <!-- Licencias Section -->
        <div class="col-md-6">
          <EditableDetailCard
            title="Licencias"
            :data="project.licencias"
            :fields="licenciasFields"
            :formFields="licenciasFormFields"
            @save="(data) => updateProjectSubEntity('licencias', data)"
          />
        </div>

        <!-- Staff Section -->
        <div class="col-12">
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

        <!-- Integraciones Section -->
        <div class="col-12">
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
</template>
