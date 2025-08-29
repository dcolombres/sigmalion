import { createRouter, createWebHistory } from 'vue-router'
import ProyectosView from '../views/ProyectosView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'
import StaffListView from '../views/StaffListView.vue'
import StaffDetailView from '../views/StaffDetailView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import IntegracionesListView from '../views/IntegracionesListView.vue'
import IntegracionDetailView from '../views/IntegracionDetailView.vue'
import UsersListView from '../views/UsersListView.vue'
import UserDetailView from '../views/UserDetailView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DashboardView
    },
    {
      path: '/proyectos',
      name: 'proyectos',
      component: ProyectosView
    },
    {
      path: '/staff',
      name: 'staff-list',
      component: StaffListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/staff/:id',
      name: 'staff-detail',
      component: StaffDetailView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/integraciones',
      name: 'integraciones-list',
      component: IntegracionesListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/integraciones/:id',
      name: 'integracion-detail',
      component: IntegracionDetailView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users-list',
      component: UsersListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users/:id',
      name: 'user-detail',
      component: UserDetailView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/proyecto/:id',
      name: 'project-detail',
      component: ProjectDetailView,
      props: true, // Pass route params as props to the component
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // This route requires auth, check if logged in. If not, redirect to login page.
    next('/login');
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    // If logged in, redirect from login/register pages to home
    next('/');
  } else {
    next(); // Carry on
  }
});

export default router