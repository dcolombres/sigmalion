<template>
  <div :class="['toast', 'align-items-center', 'text-white', bgClass, 'border-0', { 'show': show }]" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="d-flex">
      <div class="toast-body">
        {{ message }}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" @click="hideToast"></button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info', // success, error, warning, info
  },
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:show']);

const bgClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-success';
    case 'error':
      return 'bg-danger';
    case 'warning':
      return 'bg-warning';
    default:
      return 'bg-info';
  }
});

const hideToast = () => {
  emit('update:show', false);
};
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1050;
}
</style>