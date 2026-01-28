<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const emit = defineEmits<{
  (e: 'switch-to-signup'): void;
}>();

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isSubmitting = ref(false);
const formError = ref<string | null>(null);

async function handleSubmit() {
  formError.value = null;
  isSubmitting.value = true;

  const result = await authStore.signInWithEmail(email.value, password.value);

  if (!result.success) {
    formError.value = result.error?.message || 'Failed to sign in';
  }

  isSubmitting.value = false;
}
</script>

<template>
  <form class="login-form" @submit.prevent="handleSubmit">
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
      placeholder="Your password"
      icon="ph:lock"
      :disabled="isSubmitting"
      block
    />

    <div v-if="formError" class="form-error">
      <iconify-icon icon="ph:warning-circle-fill"></iconify-icon>
      {{ formError }}
    </div>

    <BaseButton
      type="submit"
      variant="primary"
      :loading="isSubmitting"
      :disabled="!email || !password"
      block
    >
      Sign In
    </BaseButton>

    <p class="switch-text">
      Don't have an account?
      <button type="button" class="link-btn" @click="emit('switch-to-signup')">
        Sign up
      </button>
    </p>
  </form>
</template>

<style scoped>
.login-form {
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
