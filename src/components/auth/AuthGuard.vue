<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AuthPage from './AuthPage.vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
});
</script>

<template>
  <div class="auth-guard">
    <!-- Loading state -->
    <div v-if="authStore.loading" class="loading-container">
      <div class="loading-spinner">
        <iconify-icon icon="ph:spinner-gap-bold" class="spin"></iconify-icon>
      </div>
      <p class="loading-text">Loading...</p>
    </div>

    <!-- Not authenticated - show auth page -->
    <AuthPage v-else-if="!authStore.isAuthenticated" />

    <!-- Authenticated - show app content -->
    <div v-else class="app-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-guard {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
}

.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #050510 0%, #0a0a20 50%, #050510 100%);
  gap: 16px;
}

.loading-spinner {
  font-size: 48px;
  color: var(--accent-primary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.app-content {
  width: 100%;
  height: 100%;
}
</style>
