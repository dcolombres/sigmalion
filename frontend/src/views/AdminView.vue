<template>
  <div class="admin-view">
    <h1>Panel de Administración</h1>
    <div class="card">
      <h2>Importación de Datos</h2>
      <p>Descarga la plantilla para asegurarte de que los datos tengan el formato correcto antes de importarlos.</p>
      
      <div class="import-section">
        <h3>Proyectos</h3>
        <p>Descarga la plantilla CSV para la importación masiva de proyectos.</p>
        <button @click="downloadTemplate" class="btn btn-primary" :disabled="isUploading">Descargar Plantilla</button>
      </div>

      <div class="import-section">
        <form @submit.prevent="submitImport">
          <div class="form-group">
            <label for="file-upload">Sube el archivo CSV completado:</label>
            <input type="file" id="file-upload" @change="handleFileUpload" accept=".csv" required class="form-control-file">
          </div>
          <button type="submit" class="btn btn-success" :disabled="!selectedFile || isUploading">
            <span v-if="isUploading">Importando...</span>
            <span v-else>Importar Proyectos</span>
          </button>
        </form>
      </div>

      <hr class="my-4">

      <div class="import-section">
        <h3>Staff</h3>
        <p>Descarga la plantilla CSV para la importación masiva de personal.</p>
        <button @click="downloadStaffTemplate" class="btn btn-primary" :disabled="isUploadingStaff">Descargar Plantilla de Staff</button>
      </div>

      <div class="import-section">
        <form @submit.prevent="submitStaffImport">
          <div class="form-group">
            <label for="staff-file-upload">Sube el archivo CSV completado:</label>
            <input type="file" id="staff-file-upload" @change="handleStaffFileUpload" accept=".csv" required class="form-control-file">
          </div>
          <button type="submit" class="btn btn-success" :disabled="!selectedStaffFile || isUploadingStaff">
            <span v-if="isUploadingStaff">Importando...</span>
            <span v-else>Importar Staff</span>
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { token } = storeToRefs(authStore);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// --- Lógica para Proyectos ---
const selectedFile = ref(null);
const isUploading = ref(false);

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0];
};

const downloadTemplate = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/proyectos/template`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido en el servidor' }));
      throw new Error(errorData.error || 'Error al descargar la plantilla');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_proyectos.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error(error);
    notificationStore.showNotification(error.message, 'error');
  }
};

const submitImport = async () => {
  if (!selectedFile.value) {
    notificationStore.showNotification('Por favor, selecciona un archivo para Proyectos.', 'error');
    return;
  }

  isUploading.value = true;
  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    const response = await fetch(`${API_URL}/admin/proyectos/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al importar el archivo.');
    }

    notificationStore.showNotification(result.message, 'success');
  } catch (error) {
    console.error(error);
    notificationStore.showNotification(error.message, 'error');
  } finally {
    isUploading.value = false;
    document.getElementById('file-upload').value = null;
    selectedFile.value = null;
  }
};

// --- Lógica para Staff ---
const selectedStaffFile = ref(null);
const isUploadingStaff = ref(false);

const handleStaffFileUpload = (event) => {
  selectedStaffFile.value = event.target.files[0];
};

const downloadStaffTemplate = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/staff/template`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido en el servidor' }));
      throw new Error(errorData.error || 'Error al descargar la plantilla de staff');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_staff.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error(error);
    notificationStore.showNotification(error.message, 'error');
  }
};

const submitStaffImport = async () => {
  if (!selectedStaffFile.value) {
    notificationStore.showNotification('Por favor, selecciona un archivo para Staff.', 'error');
    return;
  }

  isUploadingStaff.value = true;
  const formData = new FormData();
  formData.append('file', selectedStaffFile.value);

  try {
    const response = await fetch(`${API_URL}/admin/staff/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al importar el archivo de staff.');
    }

    notificationStore.showNotification(result.message, 'success');
  } catch (error) {
    console.error(error);
    notificationStore.showNotification(error.message, 'error');
  } finally {
    isUploadingStaff.value = false;
    document.getElementById('staff-file-upload').value = null;
    selectedStaffFile.value = null;
  }
};

</script>

<style scoped>
.admin-view {
  padding: 2rem;
}

.card {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-top: 1rem;
}

.import-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>
