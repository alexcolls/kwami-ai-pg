<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import AuthForm from './AuthForm.vue';
import GoogleButton from './GoogleButton.vue';
import KwamiLogo from '@/components/ui/KwamiLogo.vue';
import BackgroundRings from '@/components/ui/BackgroundRings.vue';

const { t } = useI18n();
</script>

<template>
  <div class="auth-overlay">
    <!-- Subtle background rings from corner -->
    <BackgroundRings
      :ring-count="80"
      :stroke-width="1.5"
      :max-ring-opacity="0.2"
      :expansion-factor="0.012"
      :center-offset="{ x: 0.15, y: -0.15 }"
      z-index="0"
    />
    
    <div class="auth-container">
      <div class="auth-header">
        <div class="logo">
          <KwamiLogo width="160" :stroke-width="3" />
        </div>
        <h1 class="title">{{ t('auth.welcome') }}</h1>
        <p class="subtitle">{{ t('auth.signInContinue') }}</p>
      </div>

      <div class="auth-content">
        <GoogleButton />

        <div class="divider">
          <span>{{ t('auth.orContinueWithEmail') }}</span>
        </div>

        <AuthForm />
      </div>
    </div>

    <div class="auth-footer">
      <p>{{ t('auth.poweredBySupabase') }}</p>
    </div>
  </div>
</template>

<style scoped>
.auth-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
  
  /* Lighter overlay to show more of the canvas */
  background: rgba(5, 5, 16, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.auth-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  
  /* Glassmorphism effect */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  
  /* Glass border with gradient */
  border: 1px solid transparent;
  border-radius: var(--radius-xl);
  background-clip: padding-box;
  
  /* Multi-layer shadow for depth */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(0, 0, 0, 0.1),
    0 0 60px rgba(124, 77, 255, 0.15),
    0 0 100px rgba(0, 229, 255, 0.1);
  
  padding: 32px;
  overflow: hidden;
  
  /* Subtle animation */
  animation: containerFadeIn 0.5s ease-out;
}

/* Gradient border overlay */
.auth-container::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-xl);
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

/* Subtle light reflection at top */
.auth-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  pointer-events: none;
}

@keyframes containerFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    backdrop-filter: blur(24px);
  }
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

.title {
  font-size: 26px;
  font-weight: 600;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
}

.subtitle {
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
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
}

.auth-footer p {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
  letter-spacing: 0.5px;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .auth-overlay {
    padding: 16px;
  }
  
  .auth-container {
    padding: 24px;
  }
  
  .logo-icon {
    font-size: 28px;
  }
  
  .logo-text {
    font-size: 20px;
  }
  
  .title {
    font-size: 20px;
  }
}
</style>
