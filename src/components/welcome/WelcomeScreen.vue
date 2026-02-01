<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import WelcomeRings from '@/components/ui/WelcomeRings.vue';

export interface WelcomeScreenProps {
  /** Whether the welcome screen is visible */
  visible?: boolean;
  /** Duration to show the welcome screen in ms (default 4000) */
  duration?: number;
}

const props = withDefaults(defineProps<WelcomeScreenProps>(), {
  visible: true,
  duration: 4000,
});

const emit = defineEmits<{
  (e: 'complete'): void;
}>();

const isVisible = ref(props.visible);
const isFadingOut = ref(false);
const isRunning = ref(false);

let timeoutId: ReturnType<typeof setTimeout> | null = null;

function startAnimation() {
  isRunning.value = true;
  
  // Start fade out after duration
  timeoutId = setTimeout(() => {
    isFadingOut.value = true;
    
    // Complete after fade out animation
    setTimeout(() => {
      isVisible.value = false;
      isRunning.value = false;
      emit('complete');
    }, 800);
  }, props.duration);
}

function skip() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  isFadingOut.value = true;
  setTimeout(() => {
    isVisible.value = false;
    isRunning.value = false;
    emit('complete');
  }, 300);
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    isVisible.value = true;
    isFadingOut.value = false;
    isRunning.value = false;
    // Small delay to ensure mount
    requestAnimationFrame(() => {
      startAnimation();
    });
  }
});

onMounted(() => {
  if (props.visible) {
    // Small delay to ensure mount
    requestAnimationFrame(() => {
      startAnimation();
    });
  }
});

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="welcome-fade">
      <div
        v-if="isVisible"
        class="welcome-screen"
        :class="{ 'fading-out': isFadingOut }"
        @click="skip"
      >
        <!-- Animated rings with wordmark - exact original settings -->
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
          :running="isRunning"
          z-index="1"
        />
        
        <!-- Skip hint -->
        <div class="skip-hint">
          Click anywhere to skip
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.welcome-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #050510 0%, #0a0a20 50%, #050510 100%);
  cursor: pointer;
  transition: opacity 0.8s ease-out;
}

.welcome-screen.fading-out {
  opacity: 0;
}

.skip-hint {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
  z-index: 10;
  animation: hintFadeIn 1s ease-out 2s forwards;
  opacity: 0;
}

@keyframes hintFadeIn {
  to {
    opacity: 1;
  }
}

/* Transition */
.welcome-fade-enter-active {
  transition: opacity 0.3s ease-out;
}

.welcome-fade-leave-active {
  transition: opacity 0.8s ease-out;
}

.welcome-fade-enter-from,
.welcome-fade-leave-to {
  opacity: 0;
}
</style>
