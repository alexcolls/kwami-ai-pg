<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import WelcomeRings from '@/components/welcome/WelcomeRings.vue';

import './welcome-layer.css';

const DEFAULT_WELCOME_SOUND = '/welcome.mp3';

export interface WelcomeScreenProps {
  visible?: boolean;
  duration?: number;
  soundUrl?: string;
}

const props = withDefaults(defineProps<WelcomeScreenProps>(), {
  visible: true,
  duration: 4000,
  soundUrl: DEFAULT_WELCOME_SOUND,
});

const emit = defineEmits<{ (e: 'complete'): void }>();

const isVisible = ref(props.visible);
let timeoutId: ReturnType<typeof setTimeout> | null = null;

function playWelcomeSound() {
  const url = props.soundUrl?.trim();
  if (!url) return;
  try {
    const audio = new Audio(url);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

function startTimer() {
  timeoutId = setTimeout(() => {
    isVisible.value = false;
    emit('complete');
  }, props.duration);
}

function skip() {
  if (timeoutId) clearTimeout(timeoutId);
  isVisible.value = false;
  emit('complete');
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      isVisible.value = true;
      nextTick(() => {
        playWelcomeSound();
        startTimer();
      });
    }
  },
);

onMounted(() => {
  if (props.visible) {
    nextTick(() => {
      playWelcomeSound();
      startTimer();
    });
  }
});

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="welcome-fade">
      <div
        v-if="isVisible"
        class="welcome-screen welcome-screen--rings"
        @click="skip"
      >
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
        <div class="skip-hint">Click anywhere to skip</div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.welcome-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  cursor: pointer;
}

.welcome-screen--rings {
  background: radial-gradient(
    circle at center,
    #0a0a0a 0%,
    #050505 45%,
    #000000 100%
  );
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
