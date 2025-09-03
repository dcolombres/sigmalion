<template>
  <ListView
    title="Proyectos"
    :items="proyectos"
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
        <i class="fas fa-plus"></i> Nuevo Proyecto
      </button>
    </template>
    
    <template #item="{ item }">
      <td>{{ item.id }}</td>
      <td>
        <router-link :to="{ name: 'project-detail', params: { id: item.id } }">
          {{ item.titulo_proyecto }}
        </router-link>
      </td>
      <td>{{ item.cliente?.cliente || 'N/A' }}</td>
      <td>
        <span :class="['badge', item.proyecto_activo ? 'bg-success' : 'bg-secondary']">
          {{ item.proyecto_activo ? 'Activo' : 'Inactivo' }}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-secondary me-2" @click="openFormToEdit(item)">Editar</button>
        <button class="btn btn-sm btn-outline-danger" @click="deleteProyecto(item.id)">Eliminar</button>
      </td>
    </template>
  </ListView>

  <!-- Create/Edit Project Modal -->
  <div v-if="showForm" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingProjectId === null ? 'Nuevo Proyecto' : 'Editar Proyecto' }}</h5>
          <button type="button" class="btn-close" @click="closeForm"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProyecto">
            <div class="mb-3">
              <label for="titulo" class="form-label">Título del Proyecto</label>
              <input type="text" class="form-control" id="titulo" v-model="formData.titulo_proyecto" required>
            </div>
            <div class="mb-3">
              <label for="storyline" class="form-label">Storyline</label>
              <textarea class="form-form-control" id="storyline" v-model="formData.storyline" maxlength="400"></textarea>
            </div>
            <div class="form-check mb-3">
              <input type="checkbox" class="form-check-input" id="proyecto_activo" v-model="formData.proyecto_activo">
              <label class="form-check-label" for="proyecto_activo">Proyecto Activo</label>
            </div>
            <div class="mb-3">
              <label for="categoria" class="form-label">Categoría</label>
              <select class="form-select" id="categoria" v-model="formData.categoria">
                <option :value="null">Seleccione una categoría</option>
                <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="subcategoria" class="form-label">Subcategoría</label>
              <select class="form-select" id="subcategoria" v-model="formData.subcategoria">
                <option :value="null">Seleccione una subcategoría</option>
                <option v-for="subcat in subcategorias" :key="subcat" :value="subcat">{{ subcat }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="tier" class="form-label">Tier</label>
              <select class="form-select" id="tier" v-model="formData.tier">
                <option :value="null">Seleccione un Tier</option>
                <option v-for="t in tiers" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeForm">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showForm" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '@/stores/notification';
import ListView from '@/components/ListView.vue';
import { useAuthStore } from '@/stores/auth';

const proyectos = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const sortKey = ref('id');
const sortOrder = ref('asc');

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const API_URL = 'http://localhost:3000/api/proyectos';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'titulo_proyecto', label: 'Título', sortable: true },
  { key: 'cliente', label: 'Cliente', sortable: false },
  { key: 'proyecto_activo', label: 'Activo', sortable: true },
  { key: 'actions', label: 'Acciones', sortable: false },
];

// Form related state and functions
const showForm = ref(false);
const editingProjectId = ref(null);
const initialFormData = {
  titulo_proyecto: '',
  storyline: '',
  proyecto_activo: true,
  categoria: null,
  subcategoria: null,
  tier: null,
};
const formData = ref({ ...initialFormData });

const categorias = ref([]);
const subcategorias = ref([]);
const tiers = ref([]);

const fetchProyectos = async () => {
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
    proyectos.value = response.data.proyectos;
    totalItems.value = response.data.totalCount;
  } catch (err) {
    notificationStore.showNotification('Error al cargar proyectos.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchEnums = async () => {
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const response = await axios.get('http://localhost:3000/api/proyectos/enums', { headers });
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
  const headers = { Authorization: `Bearer ${authStore.token}` };

  try {
    if (editingProjectId.value === null) {
      await axios.post(API_URL, payload, { headers });
      notificationStore.showNotification('Proyecto creado exitosamente.', 'success');
    } else {
      const url = `${API_URL}/${editingProjectId.value}`;
      await axios.put(url, payload, { headers });
      notificationStore.showNotification('Proyecto actualizado exitosamente.', 'success');
    }
    closeForm();
    fetchProyectos(); // Refresh the list
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al guardar el proyecto.', 'error');
  }
};

const deleteProyecto = async (id) => {
  if (!confirm('¿Estás seguro de que quieres borrar este proyecto?')) {
    return;
  }
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` };
    const url = `${API_URL}/${id}`;
    await axios.delete(url, { headers });
    notificationStore.showNotification('Proyecto eliminado exitosamente.', 'success');
    fetchProyectos(); // Refresh the list
  } catch (err) {
    notificationStore.showNotification(err.response?.data?.error || 'Hubo un error al borrar el proyecto.', 'error');
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
};

watch(
  [currentPage, searchQuery, pageSize, sortKey, sortOrder],
  fetchProyectos,
  { immediate: true }
);

onMounted(() => {
  fetchEnums();
});
</script>

<style scoped>
.modal.d-block {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>