<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const staffMember = ref(null);
const isLoading = ref(true);
const error = ref(null);

const isEditing = ref(false);
const formData = ref({});

const API_URL = 'http://localhost:3000/api/staff';

const fetchStaffMember = async () => {
  const staffId = route.params.id;
  isLoading.value = true;
  try {
    const response = await axios.get(`${API_URL}/${staffId}`);
    staffMember.value = response.data;
    formData.value = { ...staffMember.value };
    // Format birthday for date input
    if (formData.value.cumpleanos) {
      formData.value.cumpleanos = new Date(formData.value.cumpleanos).toISOString().split('T')[0];
    }
  } catch (err) {
    console.error('Error fetching staff member:', err);
    error.value = `Failed to load staff member #${staffId}.`;
  } finally {
    isLoading.value = false;
  }
};

const saveStaffMember = async () => {
  const staffId = route.params.id;
  // Format birthday back to ISO string if it exists
  if (formData.value.cumpleanos) {
    formData.value.cumpleanos = new Date(formData.value.cumpleanos).toISOString();
  }
  try {
    const response = await axios.put(`${API_URL}/${staffId}`, formData.value);
    staffMember.value = response.data;
    isEditing.value = false;
  } catch (err) {
    console.error('Error saving staff member:', err);
    alert('Failed to save staff member details.');
  }
};

const deleteStaffMember = async () => {
  if (!confirm('¿Estás seguro de que quieres borrar a este miembro del staff?')) {
    return;
  }
  const staffId = route.params.id;
  try {
    await axios.delete(`${API_URL}/${staffId}`);
    router.push('/staff'); // Redirect to staff list after deletion
  } catch (err) {
    console.error('Error deleting staff member:', err);
    alert('Failed to delete staff member.');
  }
};

const handleEdit = () => {
  isEditing.value = true;
};

const handleCancelEdit = () => {
  isEditing.value = false;
  formData.value = { ...staffMember.value }; // Reset form data
};

onMounted(() => {
  fetchStaffMember();
});
</script>

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
        <h1 class="card-title">{{ staffMember.nombre_completo }}</h1>
        <RouterLink to="/staff" class="btn btn-secondary">&larr; Volver a la lista de Staff</RouterLink>
      </div>

      <div class="d-flex mb-3">
        <button v-if="!isEditing" @click="handleEdit" class="btn btn-primary me-2">Editar Staff</button>
        <button class="btn btn-danger" @click="deleteStaffMember">Borrar Staff</button>
      </div>

      <div class="card-body">
        <h2 class="card-subtitle mb-3 text-muted">Detalles del Staff</h2>
        <form v-if="isEditing" @submit.prevent="saveStaffMember">
          <div class="mb-3">
            <label class="form-label">Nombre Completo:</label>
            <input type="text" v-model="formData.nombre_completo" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Email:</label>
            <input type="email" v-model="formData.email" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Contrato:</label>
            <input type="text" v-model="formData.contrato" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Rol:</label>
            <select v-model="formData.rol" class="form-select">
              <option value="Developer">Developer</option>
              <option value="QA">QA</option>
              <option value="PM">PM</option>
              <option value="Designer">Designer</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Nombres:</label>
            <input type="text" v-model="formData.nombres" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Apellidos:</label>
            <input type="text" v-model="formData.apellidos" class="form-control">
          </div>
          <div class="form-check mb-3">
            <input type="checkbox" v-model="formData.activo" class="form-check-input">
            <label class="form-check-label">Activo:</label>
          </div>
          <div class="mb-3">
            <label class="form-label">Comentario:</label>
            <textarea v-model="formData.comentario" class="form-control"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Modalidad:</label>
            <select v-model="formData.modalidad" class="form-select">
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contractor">Contractor</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Experiencia:</label>
            <select v-model="formData.experiencia" class="form-select">
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Origen:</label>
            <input type="text" v-model="formData.origen" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Desempeño Ley DTO:</label>
            <input type="text" v-model="formData.desempeno_ley_dto" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">HHEE:</label>
            <input type="text" v-model="formData.hhee" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">UR:</label>
            <input type="text" v-model="formData.ur" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Coordinación:</label>
            <input type="text" v-model="formData.coordinacion" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Presencialidad:</label>
            <input type="text" v-model="formData.presencialidad" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Cumpleaños:</label>
            <input type="date" v-model="formData.cumpleanos" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Edad:</label>
            <input type="number" v-model="formData.edad" class="form-control">
          </div>
          <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-success me-2">Guardar Cambios</button>
            <button type="button" @click="handleCancelEdit" class="btn btn-secondary">Cancelar</button>
          </div>
        </form>
        <div v-else>
          <p class="card-text"><strong>Email:</strong> {{ staffMember.email || 'N/A' }}</p>
          <p class="card-text"><strong>Contrato:</strong> {{ staffMember.contrato || 'N/A' }}</p>
          <p class="card-text"><strong>Rol:</strong> {{ staffMember.rol || 'N/A' }}</p>
          <p class="card-text"><strong>Nombres:</strong> {{ staffMember.nombres || 'N/A' }}</p>
          <p class="card-text"><strong>Apellidos:</strong> {{ staffMember.apellidos || 'N/A' }}</p>
          <p class="card-text"><strong>Activo:</strong> {{ staffMember.activo ? 'Sí' : 'No' }}</p>
          <p class="card-text"><strong>Comentario:</strong> {{ staffMember.comentario || 'N/A' }}</p>
          <p class="card-text"><strong>Modalidad:</strong> {{ staffMember.modalidad || 'N/A' }}</p>
          <p class="card-text"><strong>Experiencia:</strong> {{ staffMember.experiencia || 'N/A' }}</p>
          <p class="card-text"><strong>Origen:</strong> {{ staffMember.origen || 'N/A' }}</p>
          <p class="card-text"><strong>Desempeño Ley DTO:</strong> {{ staffMember.desempeno_ley_dto || 'N/A' }}</p>
          <p class="card-text"><strong>HHEE:</strong> {{ staffMember.hhee || 'N/A' }}</p>
          <p class="card-text"><strong>UR:</strong> {{ staffMember.ur || 'N/A' }}</p>
          <p class="card-text"><strong>Coordinación:</strong> {{ staffMember.coordinacion || 'N/A' }}</p>
          <p class="card-text"><strong>Presencialidad:</strong> {{ staffMember.presencialidad || 'N/A' }}</p>
          <p class="card-text"><strong>Cumpleaños:</strong> {{ staffMember.cumpleanos ? new Date(staffMember.cumpleanos).toLocaleDateString() : 'N/A' }}</p>
          <p class="card-text"><strong>Edad:</strong> {{ staffMember.edad || 'N/A' }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Removed most styles, Bootstrap will handle it */
</style>
