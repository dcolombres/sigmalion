<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value);
    console.log('Navigating to /');
    router.push('/'); // Redirect to home or dashboard
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Login failed. Please check your credentials.';
    console.error('Login error:', error);
  }
};
</script>

<template>
  <main class="auth-container">
    <div class="text-center mb-4">
      <img src="/src/img/logosigma.svg" alt="SIGMA Logo" width="150" />
    </div>
    <form @submit.prevent="handleLogin" class="auth-form">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">Login</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p class="switch-auth">Don't have an account? <RouterLink to="/register">Register here</RouterLink></p>
    </form>
  </main>
</template>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background-color: #fff;
}
.auth-container h2 {
  text-align: center;
  margin-bottom: 20px;
}
.auth-form .form-group {
  margin-bottom: 15px;
}
.auth-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.auth-form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.auth-form button {
  width: 100%;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
.auth-form button:hover {
  background-color: #2980b9;
}
.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 10px;
}
.switch-auth {
  text-align: center;
  margin-top: 15px;
}
.switch-auth a {
  color: #3498db;
  text-decoration: none;
}
.switch-auth a:hover {
  text-decoration: underline;
}
</style>
