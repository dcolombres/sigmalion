import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotificationStore } from './notification';

const API_BASE_URL = 'http://localhost:3000/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN' || state.user?.role === 'SUPERADMIN',
    isSuperAdmin: (state) => state.user?.role === 'SUPERADMIN',
  },

  actions: {
    // Helper to decode JWT manually
    decodeJwt(token) {
      if (!token) return null; // Add this check
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error("Error decoding token manually:", e);
        return null;
      }
    },

    async login(email, password) {
      this.isLoading = true;
      const notificationStore = useNotificationStore();
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        notificationStore.showNotification('Login exitoso!', 'success');
        return true;
      } catch (error) {
        this.logout(); // Clear any partial state
        const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión.';
        notificationStore.showNotification(errorMessage, 'error');
        throw error; // Re-throw for component to handle
      } finally {
        this.isLoading = false;
      }
    },

    async register(nombre, email, password) {
      this.isLoading = true;
      const notificationStore = useNotificationStore();
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, { nombre, email, password });
        notificationStore.showNotification('Registro exitoso! Ahora puedes iniciar sesión.', 'success');
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Error en el registro.';
        notificationStore.showNotification(errorMessage, 'error');
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      const notificationStore = useNotificationStore();
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      notificationStore.showNotification('Has cerrado sesión.', 'success');
    },

    decodeToken() {
      // This action is now redundant as decodeJwt is called in login
      // but kept for consistency if needed elsewhere
      this.user = this.decodeJwt(this.token);
    },

    // Set up Axios interceptor to attach token to requests
    setupAxiosInterceptor() {
      axios.interceptors.request.use(
        (config) => {
          if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Optional: Handle 401/403 responses globally
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          const notificationStore = useNotificationStore();
          if (error.response) {
            if (error.response.status === 401) {
              notificationStore.showNotification('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'error');
              console.warn('Authentication error (401), logging out...');
              this.logout();
            } else if (error.response.status === 403) {
              notificationStore.showNotification('No tienes permiso para realizar esta acción.', 'error');
              console.warn('Authorization error (403), forbidden.');
            }
          }
          return Promise.reject(error);
        }
      );
    },
  },
});