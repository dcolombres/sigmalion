<script setup>
import { ref } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useNotificationStore } from './stores/notification';
import ToastNotification from './components/ToastNotification.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();

const sidebarCollapsed = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const toggleSidebarCollapse = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};
</script>

<template>
  <div :class="['wrapper', { 'sidebar-collapsed': sidebarCollapsed }]">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <img alt="Mecon logo" class="logo" src="/src/img/logo_mecon_ss_gestion_admin_produccion.svg" v-show="!sidebarCollapsed" />
        <img alt="Sigma logo" class="logo-collapsed" src="/src/img/logosigma.svg" v-show="sidebarCollapsed" />
      </div>
      <div class="list-group">
        <RouterLink to="/" class="list-group-item">
          <i class="fas fa-home"></i> <span v-show="!sidebarCollapsed">Home</span>
        </RouterLink>
        <RouterLink v-if="authStore.isAuthenticated" to="/staff" class="list-group-item">
          <i class="fas fa-users"></i> <span v-show="!sidebarCollapsed">Staff</span>
        </RouterLink>
        <RouterLink v-if="authStore.isAuthenticated" to="/integraciones" class="list-group-item">
          <i class="fas fa-puzzle-piece"></i> <span v-show="!sidebarCollapsed">Integraciones</span>
        </RouterLink>
        <RouterLink v-if="authStore.isAuthenticated" to="/users" class="list-group-item">
          <i class="fas fa-user-shield"></i> <span v-show="!sidebarCollapsed">Usuarios</span>
        </RouterLink>
      </div>

      <div class="sidebar-footer">
        <div v-if="authStore.isAuthenticated" class="user-info">
          <div class="user-details">
            <i class="fas fa-user-circle fa-lg"></i>
            <div v-show="!sidebarCollapsed" class="user-text">
              <div class="fw-bold">{{ authStore.user?.nombre || 'Usuario' }}</div>
              <small class="text-muted">{{ authStore.user?.email || '' }}</small>
            </div>
          </div>
          <button @click="handleLogout" class="btn-logout" v-show="!sidebarCollapsed">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
        <div v-if="!authStore.isAuthenticated" class="auth-links">
            <RouterLink to="/login" class="list-group-item">
              <i class="fas fa-sign-in-alt"></i> <span v-show="!sidebarCollapsed">Login</span>
            </RouterLink>
            <RouterLink to="/register" class="list-group-item">
              <i class="fas fa-user-plus"></i> <span v-show="!sidebarCollapsed">Register</span>
            </RouterLink>
        </div>
        <div class="collapse-button-wrapper">
          <button class="btn-collapse" @click="toggleSidebarCollapse">
            <i :class="['fas', sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left']"></i>
          </button>
        </div>
      </div>
    </div>
    <!-- /#sidebar-wrapper -->

    <!-- Main Content -->
    <div class="main-content">
        <div class="container-fluid content-container">
          <RouterView />
        </div>
    </div>
  </div>

  <!-- Toast Notification Component -->
  <ToastNotification
    :message="notificationStore.message"
    :type="notificationStore.type"
    :show="notificationStore.show"
    @update:show="notificationStore.hideNotification"
  />
</template>

<style scoped>
.wrapper {
  display: flex;
  height: 100vh;
  background-color: var(--background-color);
}

.sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  background-color: var(--sidebar-background-color);
  transition: width 0.3s ease;
  border-right: 1px solid #e0e0e0;
}

.sidebar-collapsed .sidebar {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  text-align: center;
}

.logo {
  width: 100%;
  max-width: 200px;
  height: auto;
}

.logo-collapsed {
    width: 40px;
    height: 40px;
}

.list-group {
  flex-grow: 1;
  padding: 0 1rem;
}

.list-group-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  color: var(--sidebar-text-color);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: background-color 0.3s, color 0.3s;
}

.list-group-item:hover,
.router-link-exact-active {
  background-color: var(--primary-color);
  color: #fff;
}

.list-group-item i {
  margin-right: 1rem;
  font-size: 1.2rem;
}

.sidebar-collapsed .list-group-item i {
  margin-right: 0;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
}

.user-details {
  display: flex;
  align-items: center;
}

.user-text {
  margin-left: 0.5rem;
  font-size: 0.9rem;
}

.btn-logout {
  background: none;
  border: none;
  color: var(--sidebar-text-color);
  font-size: 1.2rem;
  cursor: pointer;
}

.auth-links {
    padding-top: 1rem;
}

.collapse-button-wrapper {
    text-align: center;
    padding-top: 1rem;
}

.btn-collapse {
  background-color: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-collapse:hover {
  background-color: #e0e0e0;
}

.main-content {
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto;
}

.content-container {
  padding-bottom: 2rem;
}
</style>
