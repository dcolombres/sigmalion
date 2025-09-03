<template>
  <div class="card h-100 shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0 text-primary">
        <i
          v-if="icon"
          :class="['fas', icon, 'me-2']"
        />
        {{ title }}
      </h5>
      <button
        v-if="editable"
        class="btn btn-sm btn-outline-primary"
        @click="$emit('edit')"
      >
        Editar
      </button>
    </div>
    <div class="card-body">
      <div v-if="data">
        <div class="row">
          <div
            v-for="field in fields"
            :key="field.key"
            class="col-md-6 mb-2"
          >
            <div class="row">
              <div class="col-sm-5">
                <strong class="text-muted">{{ field.label }}</strong>
              </div>
              <div class="col-sm-7">
                <span
                  v-if="field.type === 'boolean'"
                  :class="['badge', data[field.key] ? 'bg-success-light' : 'bg-danger-light']"
                >
                  {{ data[field.key] ? 'Sí' : 'No' }}
                </span>
                <span v-else-if="field.type === 'date'">{{ data[field.key] ? new Date(data[field.key]).toLocaleDateString() : 'N/A' }}</span>
                <a
                  v-else-if="field.type === 'url'"
                  :href="data[field.key]"
                  target="_blank"
                  rel="noopener noreferrer"
                >{{ data[field.key] }}</a>
                <span v-else>{{ data[field.key] || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="text-muted text-center"
      >
        <i class="fas fa-info-circle me-2" /> No hay datos disponibles.
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: null,
  },
  data: {
    type: Object,
    default: null,
  },
  fields: {
    type: Array,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['edit']);
</script>

<style scoped>
.card {
  border-radius: 0.75rem;
  overflow: hidden;
  border: none;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.75rem 1.25rem;
}

.card-body {
  padding: 1.25rem;
}

.bg-success-light {
  background-color: rgba(40, 167, 69, 0.1);
  color: #1e7e34;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.bg-danger-light {
  background-color: rgba(220, 53, 69, 0.1);
  color: #a52834;
  border: 1px solid rgba(220, 53, 69, 0.2);
}
</style>