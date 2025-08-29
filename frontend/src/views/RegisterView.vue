<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const nombre = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');

const handleRegister = async () => {
  try {
    await authStore.register(nombre.value, email.value, password.value);
    alert('User registered successfully. You can now log in.');
    router.push('/login'); // Redirect to login after successful registration
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Registration failed.';
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card card">
      <div class="card-body">
        <div class="text-center mb-4">
          <img src="/src/img/logosigma.svg" alt="SIGMA Logo" width="150" />
          <h2 class="mt-3">Register</h2>
        </div>
        <form @submit.prevent="handleRegister">
          <div class="form-group mb-3">
            <label for="name">Name</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-user"></i></span>
              <input type="text" id="name" class="form-control" v-model="nombre" required placeholder="Enter your name">
            </div>
          </div>
          <div class="form-group mb-3">
            <label for="email">Email</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-envelope"></i></span>
              <input type="email" id="email" class="form-control" v-model="email" required placeholder="Enter your email">
            </div>
          </div>
          <div class="form-group mb-4">
            <label for="password">Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-lock"></i></span>
              <input type="password" id="password" class="form-control" v-model="password" required placeholder="Enter your password">
            </div>
          </div>
          <button type="submit" class="btn btn-primary w-100">Register</button>
          <p v-if="errorMessage" class="error-message mt-3">{{ errorMessage }}</p>
        </form>
        <p class="text-center mt-4">Already have an account? <RouterLink to="/login">Login here</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
}

.auth-card {
  width: 100%;
  max-width: 450px;
}

.input-group-text {
    background-color: #f0f0f0;
    border-right: none;
}

.form-control {
    border-left: none;
}

.error-message {
  color: #e74c3c;
  text-align: center;
}
</style>
