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
    console.error('Registration error:', error);
  }
};
</script>

<template>
  <main class="auth-container">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="form-group">
        <label for="nombre">Name:</label>
        <input type="text" id="nombre" v-model="nombre" required>
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">Register</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p class="switch-auth">Already have an account? <RouterLink to="/login">Login here</RouterLink></p>
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
