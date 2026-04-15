<script setup lang="ts">
import { computed } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useThemeStore } from '@/stores/theme';

const props = withDefaults(defineProps<{
  title: string;
  icon: string;
  noPadding?: boolean;
  showSizeButtons?: boolean;
  showCloseButton?: boolean;
}>(), {
  noPadding: false,
  showSizeButtons: true,
  showCloseButton: true,
});

const uiStore = useUIStore();
const themeStore = useThemeStore();

type PanelRatio = 0.25 | 0.5 | 1;

interface SizeButtonConfig {
  id: string;
  ratio: PanelRatio;
  label: string;
  icon: string;
}

const baseSizeButtons: SizeButtonConfig[] = [
  { id: 'small', ratio: 0.25, label: 'Resize panel to 25%', icon: 'ph:arrows-in-simple-duotone' },
  { id: 'medium', ratio: 0.5, label: 'Resize panel to 50%', icon: 'ph:arrows-horizontal-duotone' },
  { id: 'large', ratio: 1, label: 'Resize panel to 100%', icon: 'ph:arrows-out-simple-duotone' },
];

const orderedSizeButtons = computed(() => {
  const isRightSidebar = themeStore.sidebarPosition === 'right';
  return isRightSidebar ? [...baseSizeButtons].reverse() : baseSizeButtons;
});

const isRightSidebar = computed(() => themeStore.sidebarPosition === 'right');

const currentRatio = computed(() => {
  if (uiStore.maxAllowedWidth <= 0) return 0;
  return uiStore.panelWidth / uiStore.maxAllowedWidth;
});

function isActiveRatio(ratio: PanelRatio) {
  return Math.abs(currentRatio.value - ratio) < 0.08;
}

function applyPanelRatio(ratio: PanelRatio) {
  const targetWidth = Math.round(uiStore.maxAllowedWidth * ratio);
  uiStore.setPanelWidth(targetWidth);
}

function closePanel() {
  if (uiStore.isPanelOpen) {
    uiStore.togglePanel();
  }
}
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon :icon="icon" class="panel-icon"></iconify-icon>
      <h2>{{ title }}</h2>
      <div class="header-actions">
        <div
          v-if="props.showCloseButton && !isRightSidebar"
          class="header-control-group close-group"
        >
          <button
            class="close-btn"
            title="Close panel"
            @click="closePanel"
          >
            <iconify-icon icon="ph:x"></iconify-icon>
          </button>
        </div>

        <div v-if="props.showSizeButtons" class="header-control-group">
          <button
            v-for="button in orderedSizeButtons"
            :key="button.id"
            class="size-btn"
            :class="{ active: isActiveRatio(button.ratio) }"
            :title="button.label"
            @click="applyPanelRatio(button.ratio)"
          >
            <iconify-icon :icon="button.icon"></iconify-icon>
          </button>
        </div>

        <div
          v-if="props.showCloseButton && isRightSidebar"
          class="header-control-group close-group"
        >
          <button
            class="close-btn"
            title="Close panel"
            @click="closePanel"
          >
            <iconify-icon icon="ph:x"></iconify-icon>
          </button>
        </div>

        <slot name="actions"></slot>
      </div>
    </div>

    <div class="panel-body" :class="{ 'no-padding': props.noPadding }">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.panel-inner {
  animation: fadeIn 0.2s var(--ease-out);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--glass-border);
  background: transparent;
  flex-shrink: 0;
}

.panel-icon {
  font-size: 22px;
  color: var(--accent-primary);
}

h2 {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-group {
  margin-right: 2px;
}

.size-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.size-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.size-btn.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.size-btn iconify-icon {
  font-size: 14px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.close-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.close-btn iconify-icon {
  font-size: 15px;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
  margin-bottom: max(4px, calc(var(--radius-xl, 16px) - 16px));
  scrollbar-width: thin;
  scrollbar-color: var(--surface-3) transparent;
  
  /* Multi-column responsive grid layout */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-content: start;
}

.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-track {
  background: transparent;
}

.panel-body::-webkit-scrollbar-thumb {
  background: var(--surface-3);
  border-radius: 3px;
}

.panel-body.no-padding {
  padding: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
