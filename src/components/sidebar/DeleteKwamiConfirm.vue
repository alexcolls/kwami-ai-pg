<script setup lang="ts">
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

defineProps<{
  open: boolean;
  kwamiName: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <ConfirmDialog
    :open="open"
    title="Delete Kwami"
    icon="ph:trash-duotone"
    confirm-label="Delete"
    confirm-variant="danger"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  >
    <p>Delete <strong>{{ kwamiName }}</strong>? This cannot be undone.</p>
  </ConfirmDialog>
</template>
