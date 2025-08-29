<template>
  <div class="list-view">
    <header class="list-header">
      <h1>{{ title }}</h1>
      <button @click="$emit('show-form')" class="btn btn-primary">
        <i class="fas fa-plus me-2"></i>
        Añadir {{ itemType }}
      </button>
    </header>

    <div v-if="showForm" class="card p-4 mb-4">
      <h2 class="card-title">{{ formTitle }}</h2>
      <form @submit.prevent="$emit('submit-form')">
        <slot name="form"></slot>
        <button type="submit" class="btn btn-primary">Guardar</button>
        <button type="button" @click="$emit('cancel-form')" class="btn btn-secondary ms-2">Cancelar</button>
      </form>
    </div>

    <div class="card">
        <div class="card-header">
            <input type="text" :value="searchQuery" @input="$emit('update:searchQuery', $event.target.value)" :placeholder="searchPlaceholder" class="form-control">
        </div>
        <div class="card-body">
            <div v-if="isLoading" class="loading-container">
              <div class="spinner-border text-primary" role="status"></div>
              <p>Cargando...</p>
            </div>
            <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-else-if="items.length" class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th v-for="header in tableHeaders" :key="header.key" @click="$emit('sort', header.key)" :class="{ sortable: header.sortable }">
                      {{ header.label }}
                      <i v-if="header.sortable" :class="getSortIcon(header.key)"></i>
                    </th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in items" :key="item.id">
                    <td v-for="field in displayFields" :key="field.key" :class="{ 'truncate-text': field.truncate }">
                      <span v-if="field.truncate">{{ truncateText(item[field.key], field.truncate) }}</span>
                      <span v-else>{{ item[field.key] || 'N/A' }}</span>
                    </td>
                    <td class="text-end">
                      <RouterLink :to="{ name: detailRouteName, params: { id: item.id } }" class="btn btn-sm btn-primary me-2">
                        <i class="fas fa-eye"></i>
                      </RouterLink>
                      <button @click="$emit('delete-item', item.id)" class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-muted text-center py-3">
              No hay {{ itemType.toLowerCase() }} que coincidan con la búsqueda.
            </div>
        </div>
        <div class="card-footer d-flex justify-content-center align-items-center">
            <button @click="$emit('prev-page')" :disabled="currentPage === 1" class="btn btn-secondary me-2">Anterior</button>
            <span>Página {{ currentPage }} de {{ totalPages }}</span>
            <button @click="$emit('next-page')" :disabled="currentPage === totalPages" class="btn btn-secondary ms-2">Siguiente</button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  title: String,
  itemType: String,
  items: Array,
  tableHeaders: Array,
  displayFields: Array,
  searchQuery: String,
  searchPlaceholder: String,
  isLoading: Boolean,
  error: String,
  currentPage: Number,
  totalPages: Number,
  showForm: Boolean,
  formTitle: String,
  detailRouteName: String,
  sortKey: String,
  sortOrder: String,
});

defineEmits([
  'show-form',
  'submit-form',
  'cancel-form',
  'update:searchQuery',
  'prev-page',
  'next-page',
  'delete-item',
  'sort',
]);

const truncateText = (text, length) => {
  if (text && text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
};

const getSortIcon = (key) => {
  if (props.sortKey !== key) return 'fas fa-sort';
  if (props.sortOrder === 'asc') return 'fas fa-sort-up';
  return 'fas fa-sort-down';
};

</script>

<style scoped>
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.loading-container {
  text-align: center;
  padding: 4rem;
}

.sortable {
  cursor: pointer;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; /* Adjust as needed */
}
</style>

