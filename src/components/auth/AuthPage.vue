<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import AuthForm from './AuthForm.vue';
import GoogleButton from './GoogleButton.vue';
import KwamiLogo from '@/components/ui/KwamiLogo.vue';
import WelcomeHero from './WelcomeHero.vue';
import WelcomeBlob from './WelcomeBlob.vue';

const { t } = useI18n();

const overlayRef = ref<HTMLElement | null>(null);
const scrollY = ref(0);
const viewportH = ref(window.innerHeight || 1);

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function onScroll() {
  scrollY.value = overlayRef.value?.scrollTop ?? 0;
}

function onResize() {
  viewportH.value = window.innerHeight || 1;
}

onMounted(() => {
  window.addEventListener('resize', onResize, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});

const heroProgress = computed(() =>
  clamp(scrollY.value / (viewportH.value * 0.85), 0, 1),
);

const eased = computed(() => {
  const t = heroProgress.value;
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
});

const titleOpacity = computed(() => 1 - clamp(heroProgress.value / 0.6, 0, 1));
const subtitleOpacity = computed(() => 1 - clamp(heroProgress.value / 0.45, 0, 1));

const blobStyle = computed(() => {
  const p = eased.value;
  const shiftX = -28 * p;
  const shiftY = -4 * p;
  const scale = 1 - 0.15 * p;
  return {
    transform: `translate3d(${shiftX}vw, ${shiftY}vh, 0) scale(${scale})`,
  };
});

const loginPanelStyle = computed(() => {
  const p = eased.value;
  const translateX = 80 * (1 - p);
  const opacity = clamp((heroProgress.value - 0.3) / 0.5, 0, 1);
  return {
    transform: `translate3d(${translateX}px, 0, 0)`,
    opacity: String(opacity),
    pointerEvents: (opacity > 0.5 ? 'auto' : 'none') as 'auto' | 'none',
  };
});
</script>

<template>
  <div ref="overlayRef" class="page" @scroll.passive="onScroll">
    <div class="ambient" aria-hidden="true" />

    <!-- Fixed hero title -->
    <h1
      class="hero-title"
      :style="{ opacity: titleOpacity }"
      aria-label="kwami"
    >
      <span class="title-main">KWAMI</span>
    </h1>

    <!-- Fixed subtitle -->
    <p
      class="title-sub"
      :style="{ opacity: subtitleOpacity }"
    >
      THE AI THAT FEELS ALIVE
    </p>

    <!-- Blob: fixed, centered, shifts left on scroll -->
    <div class="blob-zone" :style="blobStyle">
      <WelcomeBlob />
    </div>

    <!-- Login panel: slides in from right on scroll -->
    <div class="login-panel-wrapper" :style="loginPanelStyle">
      <div class="auth-container">
        <div class="auth-header">
          <div class="logo">
            <KwamiLogo width="160" :stroke-width="3" />
          </div>
          <h2 class="panel-title">{{ t('auth.welcome') }}</h2>
          <p class="panel-subtitle">{{ t('auth.signInContinue') }}</p>
        </div>

        <div class="auth-content">
          <GoogleButton />

          <div class="divider">
            <span>{{ t('auth.orContinueWithEmail') }}</span>
          </div>

          <AuthForm />
        </div>
      </div>
    </div>

    <!-- Scroll track -->
    <main class="scroll-main">
      <WelcomeHero />
      <div class="scroll-spacer" aria-hidden="true" />
    </main>

    <div class="auth-footer">
      <p>{{ t('auth.footer') }}</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1000;
  background:
    radial-gradient(ellipse 120% 82% at 50% -20%, rgba(53, 158, 238, 0.1), transparent 55%),
    radial-gradient(ellipse 76% 55% at 82% 32%, rgba(239, 71, 111, 0.08), transparent 52%),
    radial-gradient(ellipse 76% 55% at 10% 70%, rgba(3, 206, 164, 0.08), transparent 50%),
    #06070a;
}

.ambient {
  position: fixed;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1000px;
  height: 52%;
  background: radial-gradient(ellipse at center, rgba(53, 158, 238, 0.1) 0%, transparent 72%);
  pointer-events: none;
  z-index: 0;
}

/* ── KWAMI title ─────────────────────────────────── */

.hero-title {
  position: fixed;
  left: 50%;
  top: 42%;
  transform: translate(-50%, -50%);
  z-index: 31;
  margin: 0;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 180ms ease;
}

.title-main {
  display: block;
  font-size: clamp(3.2rem, 17vw, 10.2rem);
  font-weight: 900;
  line-height: 0.84;
  letter-spacing: 0.03em;
  color: #f6f8ff;
  text-shadow: 0 0 34px rgba(53, 158, 238, 0.22);
}

.title-sub {
  position: fixed;
  left: 50%;
  top: 52%;
  transform: translateX(-50%);
  z-index: 31;
  margin: 0;
  font-size: clamp(0.75rem, 1.9vw, 1.1rem);
  letter-spacing: 0.42em;
  font-weight: 700;
  color: rgba(180, 188, 210, 0.9);
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 180ms ease;
}

/* ── Blob zone ───────────────────────────────────── */

.blob-zone {
  position: fixed;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  transition: transform 120ms linear;
}

/* ── Login panel (right side) ────────────────────── */

.login-panel-wrapper {
  position: fixed;
  right: 5vw;
  top: 50%;
  transform: translateY(-50%);
  z-index: 40;
  width: min(420px, 88vw);
  transition: transform 120ms linear, opacity 180ms ease;
}

.auth-container {
  position: relative;
  width: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid transparent;
  border-radius: var(--radius-xl, 16px);
  background-clip: padding-box;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(0, 0, 0, 0.1),
    0 0 60px rgba(124, 77, 255, 0.15),
    0 0 100px rgba(0, 229, 255, 0.1);
  padding: 32px;
  overflow: hidden;
}

.auth-container::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-xl, 16px);
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(126, 243, 17, 0.267) 50%,
    rgba(124, 77, 255, 0.2) 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.auth-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  pointer-events: none;
}

.auth-header {
  position: relative;
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  filter: drop-shadow(0 0 20px rgba(239, 71, 111, 0.4))
          drop-shadow(0 0 40px rgba(53, 158, 238, 0.3));
  animation: logoGlow 4s ease-in-out infinite alternate;
}

@keyframes logoGlow {
  from {
    filter: drop-shadow(0 0 20px rgba(239, 71, 111, 0.4))
            drop-shadow(0 0 40px rgba(53, 158, 238, 0.3));
  }
  to {
    filter: drop-shadow(0 0 30px rgba(3, 206, 164, 0.5))
            drop-shadow(0 0 50px rgba(255, 196, 61, 0.4));
  }
}

.panel-title {
  font-size: 26px;
  font-weight: 600;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
}

.panel-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.auth-content {
  display: flex;
  flex-direction: column;
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
}

/* ── Scroll track ────────────────────────────────── */

.scroll-main {
  position: relative;
  z-index: 10;
}

.scroll-spacer {
  height: 100dvh;
}

/* ── Footer ──────────────────────────────────────── */

.auth-footer {
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  text-align: center;
  z-index: 6;
  pointer-events: none;
}

.auth-footer p {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
  letter-spacing: 0.5px;
}

/* ── Responsive ──────────────────────────────────── */

@media (max-width: 900px) {
  .login-panel-wrapper {
    right: 50%;
    transform: translate(50%, -50%);
  }

  .hero-title {
    top: 28%;
  }

  .title-sub {
    top: 38%;
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 24px;
  }

  .panel-title {
    font-size: 20px;
  }

  .scroll-spacer {
    height: 80dvh;
  }
}
</style>
