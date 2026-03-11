<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { WelcomeAnimatedRingsHandle } from '@/components/welcome/imported/Welcome';
import { createWelcomeAnimatedRings } from '@/components/welcome/imported/Welcome';

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
const ringsContainerRef = ref<HTMLElement | null>(null);
let ringsHandle: WelcomeAnimatedRingsHandle | null = null;

let timeoutId: ReturnType<typeof setTimeout> | null = null;

function startTimer() {
  timeoutId = setTimeout(() => {
    isFadingOut.value = true;
    setTimeout(() => {
      isVisible.value = false;
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
    emit('complete');
  }, 300);
}

function initRings() {
  if (!ringsContainerRef.value || ringsHandle) return;
  ringsHandle = createWelcomeAnimatedRings({
    mount: ringsContainerRef.value,
    insert: 'first',
    zIndex: '1',
    ringCount: 120,
    baseRadiusRatio: 0.12,
    ringStrokeWidth: 2,
    cycleSeconds: 6,
    ringPulsePxPerIndex: 4,
    rotationDegreesPerSecond: 360,
    animateGradient: true,
    includeWordmark: true,
    opacity: 1,
    autoStart: true,
    resize: 'auto',
  });
}

function destroyRings() {
  if (ringsHandle) {
    ringsHandle.destroy();
    ringsHandle = null;
  }
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      isVisible.value = true;
      isFadingOut.value = false;
      nextTick(() => {
        initRings();
        requestAnimationFrame(() => startTimer());
      });
    }
  },
);

watch(isVisible, (v) => {
  if (!v) destroyRings();
});

onMounted(() => {
  if (props.visible) {
    nextTick(() => {
      initRings();
      requestAnimationFrame(() => startTimer());
    });
  }
});

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId);
  destroyRings();
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
        <!-- Mount point for imported Welcome animation (exact same as web welcome) -->
        <div ref="ringsContainerRef" class="welcome-rings-mount"></div>
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
  background: linear-gradient(135deg, #050510 0%, #0a0a20 50%, #050510 100%);
  cursor: pointer;
  transition: opacity 0.8s ease-out;
}

.welcome-rings-mount {
  position: absolute;
  inset: 0;
  overflow: hidden;
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
