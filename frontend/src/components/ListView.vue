<template>
  <div class="list-view-container">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2 class="card-title mb-0">{{ title }}</h2>
        <div class="d-flex align-items-center">
          <input
            type="text"
            class="form-control form-control-sm me-2"
            placeholder="Buscar..."
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
          />
          <slot name="actions"></slot>
        </div>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="items.length === 0" class="text-center text-muted">
          No se encontraron resultados.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover table-striped">
            <thead>
              <tr>
                <th 
                  v-for="column in columns" 
                  :key="column.key"
                  @click="column.sortable && $emit('update:sort', column.key)"
                  :class="{ 'sortable': column.sortable }"
                >
                  {{ column.label }}
                  <i v-if="column.sortable && sortKey === column.key" :class="['fas', sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <slot name="item" :item="item"></slot>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <span class="me-2">Registros por página:</span>
          <select
            class="form-select form-select-sm"
            style="width: 70px;"
            :value="pageSize"
            @change="$emit('update:pageSize', parseInt($event.target.value))"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span class="ms-3 text-muted">
            Mostrando {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalItems) }} de {{ totalItems }}
          </span>
        </div>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="$emit('prev-page')">Anterior</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage * pageSize >= totalItems }">
              <a class="page-link" href="#" @click.prevent="$emit('next-page')">Siguiente</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  columns: { type: Array, required: true },
  title: { type: String, required: true },
  searchQuery: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  totalItems: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  currentPage: { type: Number, required: true },
  sortKey: { type: String, required: true },
  sortOrder: { type: String, required: true },
});

defineEmits(['update:searchQuery', 'update:sort', 'update:pageSize', 'prev-page', 'next-page']);
</script>

<style scoped>
.list-view-container {
  padding: 1rem;
}
.card-title {
  font-size: 1.5rem;
}
.sortable {
  cursor: pointer;
}
.sortable:hover {
  background-color: #f8f9fa;
}
</style>