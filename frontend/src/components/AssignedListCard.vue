<template>
  <div class="card h-100 shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">{{ title }}</h5>
      <button v-if="!isAdding" @click="isAdding = true" class="btn btn-sm btn-outline-primary">Añadir {{ itemType }}</button>
    </div>
    <div class="card-body">
      <form v-if="isAdding" @submit.prevent="addItem" class="mb-3 d-flex align-items-center">
        <select v-model="selectedItemId" class="form-select me-2" required>
          <option :value="null" disabled>Selecciona un {{ itemType.toLowerCase() }}</option>
          <option v-for="item in availableItems" :key="item.id" :value="item.id">{{ item.nameField }}</option>
        </select>
        <button type="submit" class="btn btn-success me-2">Añadir</button>
        <button type="button" @click="cancelAdd" class="btn btn-secondary">Cancelar</button>
      </form>
      <div v-else-if="assignedItems && assignedItems.length" class="table-responsive">
        <table class="table table-striped table-hover mb-0">
          <thead>
            <tr>
              <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in assignedItems" :key="item.id">
              <td v-for="field in displayFields" :key="field.key">{{ item[field.key] || 'N/A' }}</td>
              <td>
                <button class="btn btn-sm btn-danger" @click="$emit('remove', item.id)">Quitar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-muted">
        No hay {{ itemType.toLowerCase() }} asignados.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  itemType: {
    type: String,
    required: true,
  },
  assignedItems: {
    type: Array,
    default: () => [],
  },
  allItems: {
    type: Array,
    default: () => [],
  },
  nameField: {
    type: String,
    required: true,
  },
  tableHeaders: {
    type: Array,
    required: true,
  },
  displayFields: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['add', 'remove']);

const isAdding = ref(false);
const selectedItemId = ref(null);

const availableItems = ref([]);

// Watch for changes in allItems or assignedItems to update availableItems
watch([() => props.allItems, () => props.assignedItems], () => {
  const assignedIds = new Set(props.assignedItems.map(item => item.id));
  availableItems.value = props.allItems
    .filter(item => !assignedIds.has(item.id))
    .map(item => ({ ...item, nameField: item[props.nameField] })); // Add nameField for display
}, { immediate: true, deep: true });

const addItem = () => {
  if (selectedItemId.value) {
    emit('add', selectedItemId.value);
    selectedItemId.value = null;
    isAdding.value = false;
  }
};

const cancelAdd = () => {
  selectedItemId.value = null;
  isAdding.value = false;
};
</script>

<style scoped>
.card {
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.75rem 1.25rem;
}

.card-body {
  padding: 1.25rem;
}

.form-select {
  width: auto;
  flex-grow: 1;
}
</style>