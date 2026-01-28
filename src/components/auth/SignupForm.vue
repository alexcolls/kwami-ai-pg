<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const emit = defineEmits<{
  (e: 'switch-to-login'): void;
}>();

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isSubmitting = ref(false);
const formError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

async function handleSubmit() {
  formError.value = null;
  successMessage.value = null;

  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    formError.value = 'Passwords do not match';
    return;
  }

  // Validate password length
  if (password.value.length < 6) {
    formError.value = 'Password must be at least 6 characters';
    return;
  }

  isSubmitting.value = true;

  const result = await authStore.signUpWithEmail(email.value, password.value);

  if (!result.success) {
    formError.value = result.error?.message || 'Failed to sign up';
  } else {
    // Check if email confirmation is required
    if (result.data?.user && !result.data?.session) {
      successMessage.value = 'Check your email to confirm your account';
    }
  }

  isSubmitting.value = false;
}
</script>

<template>
  <form class="signup-form" @submit.prevent="handleSubmit">
    <BaseInput
      v-model="email"
      label="Email"
      type="email"
      placeholder="you@example.com"
      icon="ph:envelope"
      :disabled="isSubmitting"
      block
    />

    <BaseInput
      v-model="password"
      label="Password"
      type="password"
      placeholder="At least 6 characters"
      icon="ph:lock"
      :disabled="isSubmitting"
      block
    />

    <BaseInput
      v-model="confirmPassword"
      label="Confirm Password"
      type="password"
      placeholder="Confirm your password"
      icon="ph:lock-key"
      :disabled="isSubmitting"
      block
    />

    <div v-if="formError" class="form-error">
      <iconify-icon icon="ph:warning-circle-fill"></iconify-icon>
      {{ formError }}
    </div>

    <div v-if="successMessage" class="form-success">
      <iconify-icon icon="ph:check-circle-fill"></iconify-icon>
      {{ successMessage }}
    </div>

    <BaseButton
      type="submit"
      variant="primary"
      :loading="isSubmitting"
      :disabled="!email || !password || !confirmPassword"
      block
    >
      Create Account
    </BaseButton>

    <p class="switch-text">
      Already have an account?
      <button type="button" class="link-btn" @click="emit('switch-to-login')">
        Sign in
      </button>
    </p>
  </form>
</template>

<style scoped>
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--error-glow);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: var(--radius-md);
  color: var(--error);
  font-size: 13px;
}

.form-error iconify-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.form-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--success-glow);
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: var(--radius-md);
  color: var(--success);
  font-size: 13px;
}

.form-success iconify-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.switch-text {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.link-btn {
  background: none;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  padding: 0;
  transition: color var(--duration-fast) ease;
}

.link-btn:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}
</style>
