import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const message = ref('');
  const type = ref('info');
  const show = ref(false);
  let timeoutId = null;

  const showNotification = (msg, notificationType = 'info', duration = 3000) => {
    message.value = msg;
    type.value = notificationType;
    show.value = true;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      hideNotification();
    }, duration);
  };

  const hideNotification = () => {
    show.value = false;
    message.value = '';
    type.value = 'info';
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { message, type, show, showNotification, hideNotification };
});