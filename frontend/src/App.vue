<script setup>
import { ref } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useNotificationStore } from './stores/notification';
import ToastNotification from './components/ToastNotification.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();

const sidebarToggled = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const toggleSidebar = () => {
  sidebarToggled.value = !sidebarToggled.value;
};
</script>

<template>
  <div :class="['wrapper', { 'sidebar-toggled': sidebarToggled }]">
    <LoadingSpinner v-if="authStore.isLoading" />
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <img alt="Mecon logo" class="logo" src="/src/img/logo_mecon_ss_gestion_admin_produccion.svg" />
        <img alt="Sigma logo" class="logo-collapsed" src="/src/img/logosigma.svg" />
      </div>
      <div class="list-group">
        <RouterLink to="/" class="list-group-item">
          <i class="fas fa-tachometer-alt"></i> <span>Dashboard</span>
        </RouterLink>
        <RouterLink to="/proyectos" class="list-group-item">
          <i class="fas fa-project-diagram"></i> <span>Proyectos</span>
        </RouterLink>
        <RouterLink v-if="authStore.isAuthenticated" to="/staff" class="list-group-item">
          <i class="fas fa-users"></i> <span>Staff</span>
        </RouterLink>
        <RouterLink v-if="authStore.isAuthenticated" to="/integraciones" class="list-group-item">
          <i class="fas fa-puzzle-piece"></i> <span>Integraciones</span>
        </RouterLink>
        <RouterLink v-if="authStore.isAuthenticated" to="/users" class="list-group-item">
          <i class="fas fa-user-shield"></i> <span>Usuarios</span>
        </RouterLink>
        <RouterLink v-if="authStore.isAuthenticated" to="/admin" class="list-group-item">
          <i class="fas fa-file-import"></i> <span>Administración</span>
        </RouterLink>
      </div>

      <div class="sidebar-footer">
        <div v-if="authStore.isAuthenticated" class="user-info">
          <div class="user-details">
            <i class="fas fa-user-circle fa-lg"></i>
            <div class="user-text">
              <div class="fw-bold">{{ authStore.user?.nombre || 'Usuario' }}</div>
              <small class="text-muted">{{ authStore.user?.email || '' }}</small>
            </div>
          </div>
          <button @click="handleLogout" class="btn-logout">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
        <div v-if="!authStore.isAuthenticated" class="auth-links">
            <RouterLink to="/login" class="list-group-item">
              <i class="fas fa-sign-in-alt"></i> <span>Login</span>
            </RouterLink>
            <RouterLink to="/register" class="list-group-item">
              <i class="fas fa-user-plus"></i> <span>Register</span>
            </RouterLink>
        </div>
      </div>
    </div>
    <!-- /#sidebar-wrapper -->

    <!-- Main Content -->
    <div class="main-content">
        <nav class="navbar navbar-light bg-light">
          <button class="btn btn-primary d-md-none" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
        </nav>
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
  width: 250px;
  display: flex;
  flex-direction: column;
  background-color: var(--sidebar-background-color);
  transition: margin-left 0.3s ease;
  border-right: 1px solid #e0e0e0;
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
  display: none;
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
  background-color: #5FBFBD;
  color: #fff;
}

.list-group-item i {
  margin-right: 1rem;
  font-size: 1.2rem;
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
  transition: color 0.3s;
}

.btn-logout:hover {
  color: #5FBFBD;
}

.auth-links {
    padding-top: 1rem;
}

.main-content {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
}

.content-container {
  padding-bottom: 2rem;
}

@media (max-width: 768px) {
  .sidebar {
    margin-left: -250px;
  }

  .wrapper.sidebar-toggled .sidebar {
    margin-left: 0;
  }

  .sidebar .logo {
    display: block;
  }

  .sidebar .logo-collapsed {
    display: none;
  }
}

@media (min-width: 769px) {
  .sidebar-collapsed .sidebar {
    width: 80px;
  }

  .sidebar-collapsed .sidebar .logo {
    display: none;
  }

  .sidebar-collapsed .sidebar .logo-collapsed {
    display: block;
    width: 40px;
    height: 40px;
  }

  .sidebar-collapsed .sidebar .list-group-item span {
    display: none;
  }

  .sidebar-collapsed .sidebar .list-group-item i {
    margin-right: 0;
  }

  .sidebar-collapsed .sidebar .user-text, .sidebar-collapsed .sidebar .btn-logout {
      display: none;
  }
}

</style>
