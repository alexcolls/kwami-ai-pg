<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BasePanel from '@/components/ui/BasePanel.vue';
import { panelIcons } from '@/constants/panel-icons';

const { t } = useI18n();
</script>

<template>
  <BasePanel :title="t('sidebar.panels.wallet')" :icon="panelIcons.wallet">
    <div class="coming-soon">
      <iconify-icon :icon="panelIcons.wallet" class="coming-soon-icon"></iconify-icon>
      <h3>{{ t('sidebar.panels.wallet') }}</h3>
      <p>{{ t('apps.comingSoon') }}</p>
    </div>
  </BasePanel>
</template>

<style scoped>
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 24px;
  text-align: center;
  color: var(--text-muted);
}

.coming-soon-icon {
  font-size: 48px;
  color: var(--accent-primary);
  opacity: 0.5;
}

.coming-soon h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
}

.coming-soon p {
  font-size: 13px;
  margin: 0;
}
</style>
