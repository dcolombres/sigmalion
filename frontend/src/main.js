import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

import 'bootstrap/dist/css/bootstrap.min.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize auth store and setup axios interceptor
const authStore = useAuthStore();
authStore.decodeToken(); // Decode token on app start
authStore.setupAxiosInterceptor(); // Setup axios to send token

app.mount('#app')

