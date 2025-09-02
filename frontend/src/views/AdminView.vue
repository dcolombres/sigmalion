<template>
  <div class="admin-view">
    <h1>Panel de Administración</h1>
    <div class="card">
      <div class="row mb-4">
        <div class="col-md-6">
          <h2>Importación de Datos</h2>
          <p class="text-muted">Descarga la plantilla para asegurarte de que los datos tengan el formato correcto antes de importarlos.</p>
        </div>
        <div class="col-md-6">
          <h2>Exportación de Datos</h2>
          <p class="text-muted">Selecciona los datos que quieres exportar a un archivo CSV.</p>
        </div>
      </div>

      <div class="row">
        <!-- Importación -->
        <div class="col-md-6">
          <div class="import-section p-3 border rounded">
            <h4 class="mb-3">Importar Datos</h4>
            <div class="mb-3">
              <label class="form-label">Proyectos</label>
              <div class="d-flex align-items-center">
                <button class="btn btn-outline-primary btn-sm me-2" @click="downloadTemplate" title="Descargar Plantilla de Proyectos">
                  <i class="fas fa-download"></i> Plantilla
                </button>
                <input type="file" class="form-control form-control-sm" accept=".csv" @change="handleFileUpload" id="file-upload-proyectos">
                <button type="submit" class="btn btn-success btn-sm ms-2" @click="submitImport" :disabled="!selectedFile || isUploading">
                  <span v-if="isUploading">Importando...</span>
                  <span v-else>Importar</span>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Staff</label>
              <div class="d-flex align-items-center">
                <button class="btn btn-outline-primary btn-sm me-2" @click="downloadStaffTemplate" title="Descargar Plantilla de Staff">
                  <i class="fas fa-download"></i> Plantilla
                </button>
                <input type="file" class="form-control form-control-sm" accept=".csv" @change="handleStaffFileUpload" id="file-upload-staff">
                <button type="submit" class="btn btn-success btn-sm ms-2" @click="submitStaffImport" :disabled="!selectedStaffFile || isUploadingStaff">
                  <span v-if="isUploadingStaff">Importando...</span>
                  <span v-else>Importar</span>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Clientes</label>
              <div class="d-flex align-items-center">
                <button class="btn btn-outline-primary btn-sm me-2" @click="downloadClienteTemplate" title="Descargar Plantilla de Clientes">
                  <i class="fas fa-download"></i> Plantilla
                </button>
                <input type="file" class="form-control form-control-sm" accept=".csv" @change="handleClienteFileUpload" id="file-upload-clientes">
                <button type="submit" class="btn btn-success btn-sm ms-2" @click="submitClienteImport" :disabled="!selectedClienteFile || isUploadingCliente">
                  <span v-if="isUploadingCliente">Importando...</span>
                  <span v-else>Importar</span>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Integraciones</label>
              <div class="d-flex align-items-center">
                <button class="btn btn-outline-primary btn-sm me-2" @click="downloadIntegracionTemplate" title="Descargar Plantilla de Integraciones">
                  <i class="fas fa-download"></i> Plantilla
                </button>
                <input type="file" class="form-control form-control-sm" accept=".csv" @change="handleIntegracionFileUpload" id="file-upload-integraciones">
                <button type="submit" class="btn btn-success btn-sm ms-2" @click="submitIntegracionImport" :disabled="!selectedIntegracionFile || isUploadingIntegracion">
                  <span v-if="isUploadingIntegracion">Importando...</span>
                  <span v-else>Importar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Exportación -->
        <div class="col-md-6">
          <div class="export-section p-3 border rounded">
            <h4 class="mb-3">Exportar Datos</h4>
            <div class="mb-3">
              <label for="export-select" class="form-label">Selecciona los datos a exportar:</label>
              <select id="export-select" class="form-select" v-model="selectedExport">
                <option value="proyectos">Proyectos</option>
                <option value="staff">Staff</option>
                <option value="clientes">Clientes</option>
                <option value="integraciones">Integraciones</option>
              </select>
            </div>
            <button class="btn btn-primary" @click="exportData">
              <i class="fas fa-file-export"></i> Exportar a CSV
            </button>
          </div>
        </div>
      </div>

      <hr class="my-4">

      <div class="row">
        <div class="col-12">
          <DashboardConfigManager />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import DashboardConfigManager from '@/components/DashboardConfigManager.vue';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import Papa from 'papaparse';
import { useRouter } from 'vue-router';

const router = useRouter();
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

  Papa.parse(selectedFile.value, {
    header: true,
    complete: (results) => {
      const data = {
        headers: results.meta.fields,
        rows: results.data,
      };
      router.push({
        name: 'import-validation',
        query: { data: JSON.stringify(data), type: 'proyectos' },
      });
    },
    error: (error) => {
      notificationStore.showNotification(`Error al parsear el archivo: ${error.message}`, 'error');
    },
  });
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

// --- Lógica para Clientes ---
const selectedClienteFile = ref(null);
const isUploadingCliente = ref(false);

const handleClienteFileUpload = (event) => {
  selectedClienteFile.value = event.target.files[0];
};

const downloadClienteTemplate = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/clientes/template`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido en el servidor' }));
      throw new Error(errorData.error || 'Error al descargar la plantilla de clientes');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_clientes.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error(error);
    notificationStore.showNotification(error.message, 'error');
  }
};

const submitClienteImport = async () => {
  if (!selectedClienteFile.value) {
    notificationStore.showNotification('Por favor, selecciona un archivo para Clientes.', 'error');
    return;
  }

  Papa.parse(selectedClienteFile.value, {
    header: true,
    complete: (results) => {
      const data = {
        headers: results.meta.fields,
        rows: results.data,
      };
      router.push({
        name: 'import-validation',
        query: { data: JSON.stringify(data), type: 'clientes' },
      });
    },
    error: (error) => {
      notificationStore.showNotification(`Error al parsear el archivo: ${error.message}`, 'error');
    },
  });
};

// --- Lógica para Integraciones ---
const selectedIntegracionFile = ref(null);
const isUploadingIntegracion = ref(false);

const handleIntegracionFileUpload = (event) => {
  selectedIntegracionFile.value = event.target.files[0];
};

const downloadIntegracionTemplate = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/integraciones/template`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido en el servidor' }));
      throw new Error(errorData.error || 'Error al descargar la plantilla de integraciones');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_integraciones.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error(error);
    notificationStore.showNotification(error.message, 'error');
  }
};

const submitIntegracionImport = async () => {
  if (!selectedIntegracionFile.value) {
    notificationStore.showNotification('Por favor, selecciona un archivo para Integraciones.', 'error');
    return;
  }

  Papa.parse(selectedIntegracionFile.value, {
    header: true,
    complete: (results) => {
      const data = {
        headers: results.meta.fields,
        rows: results.data,
      };
      router.push({
        name: 'import-validation',
        query: { data: JSON.stringify(data), type: 'integraciones' },
      });
    },
    error: (error) => {
      notificationStore.showNotification(`Error al parsear el archivo: ${error.message}`, 'error');
    },
  });
};

// --- Lógica para Exportación ---
const selectedExport = ref('proyectos');

const exportData = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/${selectedExport.value}/export`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido en el servidor' }));
      throw new Error(errorData.error || `Error al exportar ${selectedExport.value}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedExport.value}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error(error);
    notificationStore.showNotification(error.message, 'error');
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

h1 {
  color: #343a40;
  margin-bottom: 1.5rem;
}

h2 {
  color: #495057;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

h4 {
  color: #343a40;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.text-muted {
  color: #6c757d !important;
}

.import-section, .export-section {
  margin-top: 0; /* Remove top margin as it's handled by row gap */
  padding: 1.5rem; /* Adjust padding */
  border: 1px solid #e9ecef; /* Add a subtle border */
  border-radius: 8px; /* Match card border-radius */
  background-color: #f8f9fa; /* Light background for sections */
  height: 100%; /* Ensure equal height columns */
  display: flex;
  flex-direction: column;
}

.import-item {
  display: flex;
  flex-direction: column; /* Stack elements vertically */
  margin-bottom: 1.5rem; /* Space between import items */
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed #dee2e6; /* Separator */
}

.import-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.import-item h3 {
  font-size: 1.1rem;
  color: #343a40;
  margin-bottom: 0.5rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Smaller gap */
  flex-wrap: wrap; /* Allow wrapping on small screens */
}

.actions form {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-control-sm {
  flex-grow: 1; /* Allow input to take available space */
  min-width: 150px; /* Ensure input is not too small */
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem; /* Bootstrap's default border-radius */
  cursor: pointer;
  font-weight: 600; /* Slightly bolder */
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-success {
    background-color: #28a745;
    color: white;
}

.btn-success:hover {
    background-color: #218838;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-outline-primary {
    background-color: transparent;
    color: #007bff;
    border: 1px solid #007bff;
}

.btn-outline-primary:hover {
    background-color: #007bff;
    color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1rem; /* Adjust form group spacing */
}

.form-label {
  font-weight: 600;
  color: #343a40;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
  border-radius: 0.25rem;
  border: 1px solid #ced4da;
  padding: 0.375rem 0.75rem;
}

.form-control:focus, .form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

/* Specific styles for file input to hide default text */
input[type="file"] {
  color: transparent; /* Hide default text */
}

input[type="file"]::-webkit-file-upload-button {
  visibility: hidden;
}

input[type="file"]::before {
  content: 'Seleccionar archivo'; /* Custom text */
  display: inline-block;
  background: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  outline: none;
  white-space: nowrap;
  -webkit-user-select: none;
  cursor: pointer;
  color: #495057;
  font-weight: normal;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
}

input[type="file"]:hover::before {
  background-color: #dee2e6;
}

input[type="file"]:active::before {
  background-color: #ced4da;
}

/* Adjust for smaller screens */
@media (max-width: 767.98px) {
  .import-item .actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions form {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .actions form input[type="file"] {
    width: 100%;
  }

  .actions form button {
    width: 100%;
  }
}
</style>