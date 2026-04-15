<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

defineProps<{
  open: boolean;
  kwamiName: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
const { t } = useI18n();
</script>

<template>
  <ConfirmDialog
    :open="open"
    :title="t('sidebarModals.deleteKwamiTitle')"
    icon="ph:trash-duotone"
    :confirm-label="t('sidebarModals.delete')"
    confirm-variant="danger"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  >
    <p>{{ t('sidebarModals.deleteConfirm', { name: kwamiName }) }}</p>
  </ConfirmDialog>
</template>
