<template>
  <div class="import-validation-view">
    <h1>Validación de Importación de Proyectos</h1>
    <div class="card">
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th v-for="header in headers" :key="header">{{ header }}</th>
              <th>Errores</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in tableData" :key="index">
              <td v-for="header in headers" :key="header">
                <input v-model="row[header]" class="form-control" />
              </td>
              <td>
                <div v-if="errors[index]" class="text-danger">
                  <ul>
                    <li v-for="error in errors[index]" :key="error">{{ error }}</li>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-3">
        <button class="btn btn-primary" @click="importData">Importar Datos</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();

const tableData = ref([]);
const headers = ref([]);
const errors = ref({});

const categoriaProyectoEnumValues = ['Aplicativo', 'Servicio', 'Sistema', 'Plataforma', 'Formulario', 'Registro', 'Tableros', 'APP_Mobile', 'Microservicio', 'API', 'Otra'];
const subcategoriaProyectoEnumValues = ['web', 'mobile', 'cms', 'monitor', 'procesos', 'envio_masivo', 'datos', 'plataforma', 'asesoramiento', 'otra'];
const tierEnumValues = ['UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO'];

onMounted(() => {
  const data = JSON.parse(route.query.data);
  headers.value = data.headers;
  tableData.value = data.rows;
  validateData();
});

function validateData() {
  const newErrors = {};
  tableData.value.forEach((row, index) => {
    const rowErrors = [];
    if (!row.titulo_proyecto) {
      rowErrors.push('El título del proyecto es obligatorio.');
    }
    if (row.proyecto_activo && !['true', 'false', '1', '0', ''].includes(row.proyecto_activo.toLowerCase())) {
        rowErrors.push('El valor de proyecto_activo debe ser verdadero o falso.');
    }
    if (row.categoria && !categoriaProyectoEnumValues.includes(row.categoria)) {
      rowErrors.push(`Categoría inválida: ${row.categoria}`);
    }
    if (row.subcategoria && !subcategoriaProyectoEnumValues.includes(row.subcategoria)) {
      rowErrors.push(`Subcategoría inválida: ${row.subcategoria}`);
    }
    if (row.tier && !tierEnumValues.includes(row.tier)) {
      rowErrors.push(`Tier inválido: ${row.tier}`);
    }
    if (row.cantidad_recursos_asignados && row.cantidad_recursos_asignados !== '' && !Number.isInteger(Number(row.cantidad_recursos_asignados))) {
      rowErrors.push('La cantidad de recursos asignados debe ser un número entero.');
    }
    if (row.clienteId && row.clienteId !== '' && !Number.isInteger(Number(row.clienteId))) {
        rowErrors.push('El ID de cliente debe ser un número entero.');
    }

    if (rowErrors.length > 0) {
      newErrors[index] = rowErrors;
    }
  });
  errors.value = newErrors;
}

async function importData() {
  validateData();
  if (Object.keys(errors.value).length > 0) {
    notificationStore.showNotification('Por favor, corrija los errores antes de importar.', 'error');
    return;
  }

  const dataToImport = tableData.value.map(row => ({
      ...row,
      proyecto_activo: ['true', '1'].includes(String(row.proyecto_activo).toLowerCase()),
      cantidad_recursos_asignados: row.cantidad_recursos_asignados ? parseInt(row.cantidad_recursos_asignados, 10) : null,
      clienteId: row.clienteId ? parseInt(row.clienteId, 10) : null,
      categoria: row.categoria || null,
      subcategoria: row.subcategoria || null,
      tier: row.tier || null,
  }));

  try {
    const response = await fetch('http://localhost:3000/api/admin/proyectos/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(dataToImport),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al importar los datos.');
    }

    notificationStore.showNotification(result.message, 'success');
    router.push({ name: 'admin' });
  } catch (error) {
    notificationStore.showNotification(error.message, 'error');
  }
}
</script>

<style scoped>
.import-validation-view {
  padding: 2rem;
}
.card {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-top: 1rem;
}
</style>
