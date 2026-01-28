<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/ui/BaseButton.vue';

const authStore = useAuthStore();
const isLoading = ref(false);

async function handleGoogleSignIn() {
  isLoading.value = true;
  await authStore.signInWithGoogle();
  // Note: This will redirect to Google, so loading state may not be visible
  isLoading.value = false;
}
</script>

<template>
  <BaseButton
    variant="secondary"
    :loading="isLoading"
    block
    @click="handleGoogleSignIn"
  >
    <template #default>
      <iconify-icon icon="logos:google-icon" class="google-icon"></iconify-icon>
      Continue with Google
    </template>
  </BaseButton>
</template>

<style scoped>
.google-icon {
  font-size: 18px;
  margin-right: 8px;
}
</style>
