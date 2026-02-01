<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const authStore = useAuthStore();

// Form state
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isSubmitting = ref(false);
const isCheckingEmail = ref(false);
const formError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Email existence state: null = not checked, true = exists, false = new user
const emailExists = ref<boolean | null>(null);
const emailChecked = ref(false);
// Manual mode toggle (used when email check fails)
const manualMode = ref<'signin' | 'signup' | null>(null);

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Computed
const isValidEmail = computed(() => emailRegex.test(email.value));
const isNewUser = computed(() => {
  if (manualMode.value === 'signup') return true;
  if (manualMode.value === 'signin') return false;
  return emailChecked.value && emailExists.value === false;
});
const showPasswordFields = computed(() => emailChecked.value);

const buttonText = computed(() => {
  if (isCheckingEmail.value) return 'Checking...';
  if (!emailChecked.value) return 'Continue';
  if (isNewUser.value) return 'Sign Up';
  return 'Sign In';
});

const canSubmit = computed(() => {
  if (!isValidEmail.value) return false;
  if (!emailChecked.value) return true; // Can click to check email
  if (isNewUser.value) {
    return password.value.length >= 6 && confirmPassword.value.length >= 6;
  }
  return password.value.length > 0;
});

// Watch email changes to reset state when email changes
watch(email, () => {
  if (emailChecked.value) {
    emailChecked.value = false;
    emailExists.value = null;
    manualMode.value = null;
    password.value = '';
    confirmPassword.value = '';
    formError.value = null;
    successMessage.value = null;
  }
});

// Check email existence
async function checkEmail() {
  if (!isValidEmail.value) return;
  
  isCheckingEmail.value = true;
  formError.value = null;

  const result = await authStore.checkEmailExists(email.value);
  
  if (result.error) {
    // If email check fails (no backend), default to sign-in mode
    // User can toggle to sign-up if needed
    console.warn('Email check failed, defaulting to sign-in mode:', result.error);
    emailExists.value = true; // Assume existing user
    emailChecked.value = true;
  } else {
    emailExists.value = result.exists;
    emailChecked.value = true;
  }

  isCheckingEmail.value = false;
}

// Toggle between sign in and sign up modes
function toggleMode() {
  manualMode.value = isNewUser.value ? 'signin' : 'signup';
  password.value = '';
  confirmPassword.value = '';
  formError.value = null;
}

// Handle form submission
async function handleSubmit() {
  formError.value = null;
  successMessage.value = null;

  // If email not checked yet, check it first
  if (!emailChecked.value) {
    await checkEmail();
    return;
  }

  // Validate for signup
  if (isNewUser.value) {
    if (password.value !== confirmPassword.value) {
      formError.value = 'Passwords do not match';
      return;
    }
    if (password.value.length < 6) {
      formError.value = 'Password must be at least 6 characters';
      return;
    }
  }

  isSubmitting.value = true;

  if (isNewUser.value) {
    // Sign up
    const result = await authStore.signUpWithEmail(email.value, password.value);
    if (!result.success) {
      formError.value = result.error?.message || 'Failed to sign up';
    } else if (result.data?.user && !result.data?.session) {
      successMessage.value = 'Check your email to confirm your account';
    }
  } else {
    // Sign in
    const result = await authStore.signInWithEmail(email.value, password.value);
    if (!result.success) {
      // If user not found, suggest switching to sign up
      if (result.error?.message?.toLowerCase().includes('invalid login credentials')) {
        formError.value = 'Invalid credentials. New user? Click below to sign up.';
      } else {
        formError.value = result.error?.message || 'Failed to sign in';
      }
    }
  }

  isSubmitting.value = false;
}

// Go back to email input
function changeEmail() {
  emailChecked.value = false;
  emailExists.value = null;
  manualMode.value = null;
  password.value = '';
  confirmPassword.value = '';
  formError.value = null;
  successMessage.value = null;
}
</script>

<template>
  <form class="auth-form" @submit.prevent="handleSubmit">
    <!-- Email Input -->
    <div class="email-row">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon="ph:envelope"
        :disabled="isSubmitting || isCheckingEmail || emailChecked"
        block
      />
      <button
        v-if="emailChecked"
        type="button"
        class="change-email-btn"
        @click="changeEmail"
        title="Change email"
      >
        <iconify-icon icon="ph:pencil-simple"></iconify-icon>
      </button>
    </div>

    <!-- Password fields (shown after email check) -->
    <Transition name="slide-fade">
      <div v-if="showPasswordFields" class="password-fields">
        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          :placeholder="isNewUser ? 'At least 6 characters' : 'Your password'"
          icon="ph:lock"
          :disabled="isSubmitting"
          block
        />

        <!-- Confirm password (only for new users) -->
        <Transition name="slide-fade">
          <BaseInput
            v-if="isNewUser"
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            icon="ph:lock-key"
            :disabled="isSubmitting"
            block
          />
        </Transition>
      </div>
    </Transition>

    <!-- Error message -->
    <Transition name="fade">
      <div v-if="formError" class="form-error">
        <iconify-icon icon="ph:warning-circle-fill"></iconify-icon>
        {{ formError }}
      </div>
    </Transition>

    <!-- Success message -->
    <Transition name="fade">
      <div v-if="successMessage" class="form-success">
        <iconify-icon icon="ph:check-circle-fill"></iconify-icon>
        {{ successMessage }}
      </div>
    </Transition>

    <!-- Mode toggle -->
    <Transition name="fade">
      <div v-if="emailChecked" class="mode-toggle">
        <span class="mode-text">
          {{ isNewUser ? 'Already have an account?' : "Don't have an account?" }}
        </span>
        <button type="button" class="mode-link" @click="toggleMode">
          {{ isNewUser ? 'Sign in' : 'Sign up' }}
        </button>
      </div>
    </Transition>

    <!-- Submit button -->
    <BaseButton
      type="submit"
      variant="primary"
      :loading="isSubmitting || isCheckingEmail"
      :disabled="!canSubmit"
      block
    >
      {{ buttonText }}
    </BaseButton>
  </form>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.email-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.email-row :deep(.base-input) {
  flex: 1;
}

.change-email-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
  flex-shrink: 0;
}

.change-email-btn:hover {
  background: var(--glass-bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.change-email-btn iconify-icon {
  font-size: 18px;
}

.password-fields {
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

.mode-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
}

.mode-text {
  color: var(--text-secondary);
}

.mode-link {
  background: none;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  padding: 0;
  transition: color var(--duration-fast) ease;
}

.mode-link:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
