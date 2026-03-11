<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AuthPage from './AuthPage.vue';
import WelcomeRings from '@/components/ui/WelcomeRings.vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
});
</script>

<template>
  <div class="auth-guard">
    <!-- Loading state: Welcome layer effect (rings) instead of spinner -->
    <Transition name="fade">
      <div v-if="authStore.loading" class="loading-container welcome-layer">
        <WelcomeRings
          :ring-count="120"
          :ring-stroke-width="2"
          :base-radius-ratio="0.12"
          :cycle-seconds="6"
          :ring-pulse-px-per-index="4"
          :rotation-degrees-per-second="360"
          :animate-gradient="true"
          :include-wordmark="true"
          :opacity="1"
          :running="true"
          z-index="1"
        />
      </div>
    </Transition>

    <!-- App content (always rendered for canvas background) -->
    <div class="app-content" :class="{ 'behind-auth': !authStore.isAuthenticated && !authStore.loading }">
      <slot />
    </div>

    <!-- Auth overlay (shown when not authenticated) -->
    <Transition name="fade">
      <AuthPage v-if="!authStore.isAuthenticated && !authStore.loading" />
    </Transition>
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

.loading-container.welcome-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #050510 0%, #0a0a20 50%, #050510 100%);
  z-index: 2000;
}

.app-content {
  width: 100%;
  height: 100%;
  transition: filter 0.3s ease;
}

/* When auth overlay is shown, slightly blur the background canvas */
.app-content.behind-auth {
  pointer-events: none;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
