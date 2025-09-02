<template>
  <div class="card h-100">
    <div class="card-header">
      <h5 class="mb-0">
        {{ title }}
      </h5>
      <button
        v-if="!isEditing"
        class="btn btn-sm btn-primary"
        @click="startEditing"
      >
        Editar
      </button>
    </div>
    <div class="card-body">
      <form
        v-if="isEditing"
        @submit.prevent="saveChanges"
      >
        <div class="row g-3">
          <div
            v-for="field in formFields"
            :key="field.key"
            :class="[field.type === 'textarea' ? 'col-12' : 'col-md-6', field.fieldClass]"
          >
            <label
              :for="field.key"
              class="form-label"
            >{{ field.label }}</label>
            <input
              v-if="field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'date'"
              :id="field.key"
              v-model="localFormData[field.key]"
              :type="field.type"
              class="form-control"
              :required="field.required"
            >
            <textarea
              v-else-if="field.type === 'textarea'"
              :id="field.key"
              v-model="localFormData[field.key]"
              class="form-control"
              :required="field.required"
            />
            <select
              v-else-if="field.type === 'select'"
              :id="field.key"
              v-model="localFormData[field.key]"
              class="form-select"
              :required="field.required"
            >
              <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.text }}
              </option>
            </select>
            <div
              v-else-if="field.type === 'checkbox'"
              class="form-check mt-2"
            >
              <input
                :id="field.key"
                v-model="localFormData[field.key]"
                type="checkbox"
                class="form-check-input"
              >
              <label
                :for="field.key"
                class="form-check-label"
              >{{ field.label }}</label>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-end mt-4">
          <button
            type="submit"
            class="btn btn-primary me-2"
          >
            Guardar
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="cancelEditing"
          >
            Cancelar
          </button>
        </div>
      </form>
      <div v-else>
        <div
          v-if="data"
          class="row g-3"
        >
          <div
            v-for="field in fields"
            :key="field.key"
            :class="['col-md-6', field.fieldClass]"
          >
            <p class="card-text mb-1">
              <strong>{{ field.label }}:</strong>
              <span v-if="field.type === 'boolean'">{{ data[field.key] ? 'Sí' : 'No' }}</span>
              <span v-else-if="field.type === 'date'">{{ data[field.key] ? new Date(data[field.key]).toLocaleDateString() : 'N/A' }}</span>
              <span v-else>{{ data[field.key] || 'N/A' }}</span>
            </p>
          </div>
        </div>
        <div
          v-else
          class="text-muted"
        >
          No hay datos disponibles.
        </div>
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
  data: {
    type: Object,
    default: null,
  },
  fields: {
    type: Array,
    required: true,
  },
  formFields: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['save', 'cancel']);

const isEditing = ref(false);
const localFormData = ref({});

watch(() => props.data, (newData) => {
  if (!isEditing.value) {
    localFormData.value = newData ? { ...newData } : {};
    props.formFields.forEach(field => {
      if (field.type === 'date' && localFormData.value[field.key]) {
        localFormData.value[field.key] = new Date(localFormData.value[field.key]).toISOString().split('T')[0];
      }
    });
  }
}, { immediate: true, deep: true });

const startEditing = () => {
  isEditing.value = true;
  localFormData.value = props.data ? { ...props.data } : {};
  props.formFields.forEach(field => {
    if (field.type === 'date' && localFormData.value[field.key]) {
      localFormData.value[field.key] = new Date(localFormData.value[field.key]).toISOString().split('T')[0];
    }
  });
};

const saveChanges = () => {
  emit('save', localFormData.value);
  isEditing.value = false;
};

const cancelEditing = () => {
  isEditing.value = false;
  localFormData.value = props.data ? { ...props.data } : {};
  props.formFields.forEach(field => {
    if (field.type === 'date' && localFormData.value[field.key]) {
      localFormData.value[field.key] = new Date(localFormData.value[field.key]).toISOString().split('T')[0];
    }
  });
  emit('cancel');
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
