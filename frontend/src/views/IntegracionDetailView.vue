<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const route = useRoute();
const router = useRouter();
const integracion = ref(null);
const isLoading = ref(true);
const error = ref(null);

const isEditing = ref(false);
const formData = ref({});

const API_URL = 'http://localhost:3000/api/integraciones';

const fetchIntegracion = async () => {
  const integracionId = route.params.id;
  isLoading.value = true;
  try {
    const response = await axios.get(`${API_URL}/${integracionId}`);
    integracion.value = response.data;
    formData.value = { ...integracion.value };
  } catch (err) {
    console.error('Error fetching integracion:', err);
    error.value = `Failed to load integracion #${integracionId}.`;
  } finally {
    isLoading.value = false;
  }
};

const saveIntegracion = async () => {
  const integracionId = route.params.id;
  try {
    const response = await axios.put(`${API_URL}/${integracionId}`, formData.value);
    integracion.value = response.data;
    isEditing.value = false;
  } catch (err) {
    console.error('Error saving integracion:', err);
    alert('Failed to save integracion details.');
  }
};

const deleteIntegracion = async () => {
  if (!confirm('¿Estás seguro de que quieres borrar esta integración?')) {
    return;
  }
  const integracionId = route.params.id;
  try {
    await axios.delete(`${API_URL}/${integracionId}`);
    router.push('/integraciones'); // Redirect to integrations list after deletion
  } catch (err) {
    console.error('Error deleting integracion:', err);
    alert('Failed to delete integracion.');
  }
};

const handleEdit = () => {
  isEditing.value = true;
};

const handleCancelEdit = () => {
  isEditing.value = false;
  formData.value = { ...integracion.value }; // Reset form data
};

const renderedDetails = computed(() => {
  if (integracion.value && integracion.value.detalles) {
    return md.render(integracion.value.detalles);
  }
  return 'No hay detalles disponibles.';
});

onMounted(() => {
  fetchIntegracion();
});
</script>

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
        <h1 class="card-title">{{ integracion.nombre }}</h1>
        <RouterLink to="/integraciones" class="btn btn-secondary">&larr; Volver a la lista de Integraciones</RouterLink>
      </div>

      <div class="d-flex mb-3">
        <button v-if="!isEditing" @click="handleEdit" class="btn btn-primary me-2">Editar Integración</button>
        <button class="btn btn-danger" @click="deleteIntegracion">Borrar Integración</button>
      </div>

      <div class="card-body">
        <h2 class="card-subtitle mb-3 text-muted">Detalles de la Integración</h2>
        <form v-if="isEditing" @submit.prevent="saveIntegracion">
          <div class="mb-3">
            <label class="form-label">Nombre:</label>
            <input type="text" v-model="formData.nombre" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Detalles (Markdown):</label>
            <textarea v-model="formData.detalles" class="form-control" rows="10"></textarea>
          </div>
          <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-success me-2">Guardar Cambios</button>
            <button type="button" @click="handleCancelEdit" class="btn btn-secondary">Cancelar</button>
          </div>
        </form>
        <div v-else>
          <p class="card-text"><strong>ID:</strong> {{ integracion.id }}</p>
          <p class="card-text"><strong>Nombre:</strong> {{ integracion.nombre }}</p>
          <div class="card-text"><strong>Detalles:</strong></div>
          <div v-html="renderedDetails"></div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Removed most styles, Bootstrap will handle it */
</style>
