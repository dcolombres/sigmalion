<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '../stores/notification'; // Import notification store

const proyectos = ref([]);
const error = ref(null);
const isLoading = ref(true);
const currentPage = ref(1);
const pageSize = 10;
const totalProyectos = ref(0);

// Use notification store
const notificationStore = useNotificationStore();

// Form state
const showForm = ref(false);
const editingProjectId = ref(null);

const formTitle = computed(() => {
  return editingProjectId.value === null ? 'Nuevo Proyecto' : 'Editar Proyecto';
});

const initialFormData = {
  titulo_proyecto: '',
  storyline: '',
  proyecto_activo: true,
  origen_dependencia: '',
  subsecretaria_direccion: '',
  categoria: null,
  subcategoria: null,
  tier: null,
  cantidad_recursos_asignados: 0,
  recursos: '',
  urls: '',
  captura: '',
  caratula: '',
  ticketera_interna: '',
  ticketera_externa: '',
  clienteId: null,
};
const formData = ref({ ...initialFormData });

const API_URL = 'http://localhost:3000/api/proyectos';

const categorias = ref([]);
const subcategorias = ref([]);
const tiers = ref([]);

// --- API Functions ---
const fetchProyectos = async () => {
  isLoading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize,
    };
    const response = await axios.get(API_URL, { params });
    proyectos.value = response.data.proyectos;
    totalProyectos.value = response.data.totalCount;
    error.value = null;
  } catch (err) {
    console.error('Error fetching proyectos:', err);
    error.value = 'Failed to load projects. Is the backend server running?';
    notificationStore.showNotification('Error al cargar proyectos.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchEnums = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/proyectos/enums');
    categorias.value = response.data.CategoriaProyecto;
    subcategorias.value = response.data.SubcategoriaProyecto;
    tiers.value = response.data.Tier; // Corrected from TierProyecto to Tier
  } catch (err) {
    console.error('Error fetching enums:', err);
    notificationStore.showNotification('Error al cargar opciones de selección.', 'error');
  }
};

const saveProyecto = async () => {
  if (!formData.value.titulo_proyecto) {
    notificationStore.showNotification('El título es obligatorio.', 'warning');
    return;
  }

  const payload = { ...formData.value };

  // Handle clienteId: send as undefined if null, so it's not included in the payload
  if (payload.clienteId === null) {
    payload.clienteId = undefined;
  }

  try {
    if (editingProjectId.value === null) {
      // Create new project
      await axios.post(API_URL, payload);
      notificationStore.showNotification('Proyecto creado exitosamente.', 'success');
    } else {
      // Update existing project
      const url = `${API_URL}/${editingProjectId.value}`;
      await axios.put(url, payload);
      notificationStore.showNotification('Proyecto actualizado exitosamente.', 'success');
    }
    closeForm();
    fetchProyectos(); // Re-fetch projects after save
  } catch (err) {
    console.error('Error saving proyecto:', err);
    notificationStore.showNotification('Hubo un error al guardar el proyecto.', 'error');
  }
};

const deleteProyecto = async (id) => {
  if (!confirm('¿Estás seguro de que quieres borrar este proyecto?')) {
    return;
  }
  try {
    const url = `${API_URL}/${id}`;
    await axios.delete(url);
    notificationStore.showNotification('Proyecto eliminado exitosamente.', 'success');
    fetchProyectos(); // Re-fetch projects after delete
  } catch (err) {
    console.error('Error deleting proyecto:', err);
    notificationStore.showNotification('Hubo un error al borrar el proyecto.', 'error');
  }
};

// Pagination methods
const nextPage = () => {
  if (currentPage.value * pageSize < totalProyectos.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Watch for changes in currentPage to re-fetch projects
watch(currentPage, () => {
  fetchProyectos();
});

// --- Form Handling ---
const openFormToCreate = () => {
  editingProjectId.value = null;
  formData.value = { ...initialFormData };
  showForm.value = true;
};

const openFormToEdit = (proyecto) => {
  editingProjectId.value = proyecto.id;
  formData.value = { ...proyecto };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingProjectId.value = null;
  formData.value = { ...initialFormData };
}

// --- Lifecycle Hook ---
onMounted(() => {
  fetchProyectos();
  fetchEnums();
});
</script>

<template>
  <main class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Proyectos</h1>
      <button @click="openFormToCreate" class="btn btn-primary">Crear Proyecto</button>
    </div>

    <!-- Form for creating/editing a project -->
    <div v-if="showForm" class="card p-4 mb-4">
      <h2 class="card-title">{{ formTitle }}</h2>
      <form @submit.prevent="saveProyecto">
        <div class="mb-3">
          <label for="titulo" class="form-label">Título del Proyecto</label>
          <input type="text" id="titulo" v-model="formData.titulo_proyecto" class="form-control" required placeholder="Nombre del Proyecto">
        </div>
        <div class="mb-3">
          <label for="storyline" class="form-label">Storyline</label>
          <textarea id="storyline" v-model="formData.storyline" class="form-control" placeholder="Resumen del proyecto en 400 caracteres..."></textarea>
        </div>
        <div class="form-check mb-3">
          <input type="checkbox" id="activo" v-model="formData.proyecto_activo" class="form-check-input">
          <label for="activo" class="form-check-label">Proyecto Activo</label>
        </div>

        <div class="mb-3">
          <label for="categoria" class="form-label">Categoría</label>
          <select id="categoria" v-model="formData.categoria" class="form-select">
            <option :value="null">Seleccione una categoría</option>
            <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="subcategoria" class="form-label">Subcategoría</label>
          <select id="subcategoria" v-model="formData.subcategoria" class="form-select">
            <option :value="null">Seleccione una subcategoría</option>
            <option v-for="subcat in subcategorias" :key="subcat" :value="subcat">{{ subcat }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="tier" class="form-label">Tier</label>
          <select id="tier" v-model="formData.tier" class="form-select">
            <option :value="null">Seleccione un Tier</option>
            <option v-for="t in tiers" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-success me-2">Guardar</button>
            <button type="button" @click="closeForm" class="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Display existing projects -->
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Cargando proyectos...</p>
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-else-if="proyectos.length" class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Storyline</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="proyecto in proyectos" :key="proyecto.id">
            <td>{{ proyecto.id }}</td>
            <td>
              <RouterLink :to="{ name: 'project-detail', params: { id: proyecto.id } }">
                {{ proyecto.titulo_proyecto }}
              </RouterLink>
            </td>
            <td>{{ proyecto.storyline }}</td>
            <td>{{ proyecto.proyecto_activo ? 'Sí' : 'No' }}</td>
            <td>
              <div class="d-flex">
                <button class="btn btn-sm btn-warning me-2" @click="openFormToEdit(proyecto)">Editar</button>
                <button class="btn btn-sm btn-danger" @click="deleteProyecto(proyecto.id)">Borrar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination controls -->
      <div class="d-flex justify-content-center align-items-center mt-3">
        <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-secondary me-2">Anterior</button>
        <span>Página {{ currentPage }} de {{ Math.ceil(totalProyectos / pageSize) }}</span>
        <button @click="nextPage" :disabled="currentPage * pageSize >= totalProyectos" class="btn btn-secondary">Siguiente</button>
      </div>
    </div>
    <div v-else class="alert alert-info" role="alert">
      No hay proyectos que coincidan con la búsqueda.
    </div>
  </main>
</template>

<style scoped>
/* Removed most styles, Bootstrap will handle it */
</style>
