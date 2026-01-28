<script setup lang="ts">
import { ref } from 'vue';
import LoginForm from './LoginForm.vue';
import SignupForm from './SignupForm.vue';
import GoogleButton from './GoogleButton.vue';

const mode = ref<'login' | 'signup'>('login');
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <div class="logo">
          <iconify-icon icon="ph:brain-duotone" class="logo-icon"></iconify-icon>
          <span class="logo-text">Kwami</span>
        </div>
        <h1 class="title">{{ mode === 'login' ? 'Welcome back' : 'Create account' }}</h1>
        <p class="subtitle">
          {{ mode === 'login' ? 'Sign in to continue to Kwami Playground' : 'Get started with Kwami Playground' }}
        </p>
      </div>

      <div class="auth-content">
        <GoogleButton />

        <div class="divider">
          <span>or</span>
        </div>

        <LoginForm
          v-if="mode === 'login'"
          @switch-to-signup="mode = 'signup'"
        />

        <SignupForm
          v-else
          @switch-to-login="mode = 'login'"
        />
      </div>
    </div>

    <div class="auth-footer">
      <p>Powered by Supabase Auth</p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #050510 0%, #0a0a20 50%, #050510 100%);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--glass-shadow);
  padding: 32px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.logo-icon {
  font-size: 36px;
  color: var(--accent-primary);
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
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
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--glass-border);
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
}

.auth-footer p {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}
</style>
