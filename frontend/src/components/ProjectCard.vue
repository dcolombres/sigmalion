<template>
  <div class="col-md-4 mb-4">
    <div class="card h-100 shadow-sm">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title text-primary">{{ proyecto.titulo_proyecto }}</h5>
        <h6 class="card-subtitle mb-2 text-muted">ID: {{ proyecto.id }}</h6>
        <p class="card-text flex-grow-1">{{ proyecto.storyline }}</p>
        <div class="d-flex justify-content-between align-items-center mt-auto">
          <span :class="['badge', proyecto.proyecto_activo ? 'bg-success' : 'bg-danger']">
            {{ proyecto.proyecto_activo ? 'Activo' : 'Inactivo' }}
          </span>
          <div>
            <RouterLink :to="{ name: 'project-detail', params: { id: proyecto.id } }" class="btn btn-sm btn-info me-2">Ver</RouterLink>
            <button class="btn btn-sm btn-warning me-2" @click="$emit('edit', proyecto)">Editar</button>
            <button class="btn btn-sm btn-danger" @click="$emit('delete', proyecto.id)">Borrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';

const props = defineProps({
  proyecto: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['edit', 'delete']);
</script>

<style scoped>
.card {
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-body {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.card-subtitle {
  font-size: 0.85rem;
}

.card-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #555;
}

.badge {
  font-size: 0.8rem;
  padding: 0.4em 0.6em;
}
</style>