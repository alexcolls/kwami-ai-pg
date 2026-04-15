<script setup lang="ts">
import { useUIStore } from '@/stores/ui';
import { panelIcons } from '@/constants/panel-icons';
import { usePanelShortcuts } from '@/composables/usePanelShortcuts';
import SidebarKwamiSection from '@/components/sidebar/SidebarKwamiSection.vue';
import { useI18n } from 'vue-i18n';

const uiStore = useUIStore();
const { handlePanelClick } = usePanelShortcuts();
const { t } = useI18n();

function panelTitle(panel: string): string {
  return t(`sidebar.panels.${panel}`);
}
</script>

<template>
  <div class="switcher-column">
    <SidebarKwamiSection />

    <div class="nav-divider"></div>

    <!-- Visual Group -->
    <div class="nav-group">
      <span class="switcher-label">{{ t('sidebar.visual') }}</span>
      <button
        v-for="p in ['avatar', 'audio', 'scene', 'theme']"
        :key="p"
        class="nav-btn"
        :class="{ active: uiStore.activePanel === p && uiStore.isPanelOpen }"
        @click="handlePanelClick(p)"
        :title="panelTitle(p)"
      >
        <iconify-icon :icon="panelIcons[p]"></iconify-icon>
      </button>
    </div>

    <div class="nav-divider"></div>

    <!-- Agent Group -->
    <div class="nav-group">
      <span class="switcher-label">{{ t('sidebar.agent') }}</span>

      <button
        v-for="p in ['models','voice', 'soul', 'memory', 'enhancements', 'tools']"
        :key="p"
        class="nav-btn"
        :class="{ active: uiStore.activePanel === p && uiStore.isPanelOpen }"
        @click="handlePanelClick(p)"
        :title="panelTitle(p)"
      >
        <iconify-icon :icon="panelIcons[p]"></iconify-icon>
      </button>
    </div>

    <div class="nav-divider"></div>

    <!-- Config Group -->
    <div class="nav-group">
      <span class="switcher-label">{{ t('sidebar.info') }}</span>
      <button
        v-for="p in ['transcription', 'communications', 'metrics', 'info']"
        :key="p"
        class="nav-btn"
        :class="{ active: uiStore.activePanel === p && uiStore.isPanelOpen }"
        @click="handlePanelClick(p)"
        :title="panelTitle(p)"
      >
        <iconify-icon :icon="panelIcons[p]"></iconify-icon>
      </button>
    </div>

    <div class="nav-spacer"></div>

    <!-- Energy -->
    <button
      class="nav-btn energy-btn"
      :class="{ active: uiStore.activePanel === 'credits' && uiStore.isPanelOpen }"
      @click="handlePanelClick('credits')"
      :title="t('sidebar.energy')"
    >
      <iconify-icon :icon="panelIcons.credits"></iconify-icon>
    </button>

    <!-- Account -->
    <button
      class="nav-btn account-btn"
      :class="{ active: uiStore.activePanel === 'account' && uiStore.isPanelOpen }"
      @click="handlePanelClick('account')"
      :title="t('sidebar.account')"
    >
      <iconify-icon icon="ph:user-duotone"></iconify-icon>
    </button>
  </div>
</template>

<style scoped>
.switcher-column {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow);
  pointer-events: auto;
  z-index: 102;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-divider {
  height: 1px;
  margin: 4px 0;
  background: var(--glass-border);
}

.nav-spacer {
  flex: 1;
}

.nav-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  font-size: 20px;
}

.nav-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
  transform: scale(1.08);
}

.nav-btn.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  box-shadow: 0 0 20px var(--accent-glow), 0 0 0 1px rgba(0, 217, 255, 0.2) inset;
}

/* Switcher Labels */
.switcher-label {
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-muted);
  text-align: center;
  padding: 0 4px;
}
</style>
