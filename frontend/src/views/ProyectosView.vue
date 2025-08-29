<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '../stores/notification';
import ListView from '../components/ListView.vue';

const proyectos = ref([]);
const error = ref(null);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
const totalProyectos = ref(0);
const sortKey = ref('id');
const sortOrder = ref('asc');

const notificationStore = useNotificationStore();

const showForm = ref(false);
const editingProjectId = ref(null);

const formTitle = computed(() => {
  return editingProjectId.value === null ? 'Nuevo Proyecto' : 'Editar Proyecto';
});

const initialFormData = {
  titulo_proyecto: '',
  storyline: '',
  proyecto_activo: true,
  categoria: null,
  subcategoria: null,
  tier: null,
};
const formData = ref({ ...initialFormData });

const API_URL = 'http://localhost:3000/api/proyectos';

const categorias = ref([]);
const subcategorias = ref([]);
const tiers = ref([]);

const fetchProyectos = async () => {
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
    proyectos.value = response.data.proyectos;
    totalProyectos.value = response.data.totalCount;
    error.value = null;
  } catch (err) {
    error.value = 'Failed to load projects.';
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
    tiers.value = response.data.Tier;
  } catch (err) {
    notificationStore.showNotification('Error al cargar opciones de selección.', 'error');
  }
};

const saveProyecto = async () => {
  if (!formData.value.titulo_proyecto) {
    notificationStore.showNotification('El título es obligatorio.', 'warning');
    return;
  }

  const payload = { ...formData.value };

  try {
    if (editingProjectId.value === null) {
      await axios.post(API_URL, payload);
      notificationStore.showNotification('Proyecto creado exitosamente.', 'success');
    } else {
      const url = `${API_URL}/${editingProjectId.value}`;
      await axios.put(url, payload);
      notificationStore.showNotification('Proyecto actualizado exitosamente.', 'success');
    }
    closeForm();
    fetchProyectos();
  } catch (err) {
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
    fetchProyectos();
  } catch (err) {
    notificationStore.showNotification('Hubo un error al borrar el proyecto.', 'error');
  }
};

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

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  fetchProyectos();
};

watch([searchQuery, currentPage], () => {
  fetchProyectos();
});

const totalPages = computed(() => Math.ceil(totalProyectos.value / pageSize));

onMounted(() => {
  fetchProyectos();
  fetchEnums();
});
</script>

<template>
  <ListView
    title="Proyectos"
    itemType="Proyecto"
    :items="proyectos"
    :tableHeaders="[
      { key: 'titulo_proyecto', label: 'Título', sortable: true },
      { key: 'storyline', label: 'Storyline', sortable: false },
      { key: 'proyecto_activo', label: 'Activo', sortable: true },
    ]"
    :displayFields="[
      { key: 'titulo_proyecto' },
      { key: 'storyline', truncate: 200 },
      { key: 'proyecto_activo', type: 'boolean' },
    ]"
    :searchQuery.sync="searchQuery"
    searchPlaceholder="Buscar por título o storyline..."
    :isLoading="isLoading"
    :error="error"
    :currentPage="currentPage"
    :totalPages="totalPages"
    :showForm="showForm"
    :formTitle="formTitle"
    detailRouteName="project-detail"
    :sortKey="sortKey"
    :sortOrder="sortOrder"
    @show-form="openFormToCreate"
    @submit-form="saveProyecto"
    @cancel-form="closeForm"
    @update:searchQuery="searchQuery = $event"
    @prev-page="currentPage--"
    @next-page="currentPage++"
    @delete-item="deleteProyecto"
    @sort="handleSort"
  >
    <template #form>
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
    </template>
  </ListView>
</template>
