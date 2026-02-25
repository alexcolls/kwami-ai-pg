<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useWorkspaceStore } from '@/stores/workspace';
import { useKwamiConfigSync } from '@/composables/useKwamiConfigSync';
import { getGradient } from '@/composables/useKwamiGradient';

const uiStore = useUIStore();
const workspaceStore = useWorkspaceStore();
const { switchToKwami } = useKwamiConfigSync();

const trayExpanded = ref(false);
const kwamiListRef = ref<HTMLElement | null>(null);

const activeWorkspace = computed(() => workspaceStore.getActiveWorkspace());
const workspaces = computed(() => workspaceStore.workspaces);

const emit = defineEmits<{
  (e: 'add-click'): void;
  (e: 'edit-click', ws: { id: string; name: string; colors: { x: string; y: string; z: string } }): void;
}>();

function toggleTray() {
  trayExpanded.value = !trayExpanded.value;
  if (trayExpanded.value && uiStore.isPanelOpen) {
    uiStore.togglePanel();
  }
}

function switchKwami(id: string) {
  switchToKwami(id);
  trayExpanded.value = false;
}

function onAddClick(event?: MouseEvent) {
  event?.stopPropagation();
  emit('add-click');
}

function onEditClick(ws: { id: string; name: string; colors: { x: string; y: string; z: string } }, event?: MouseEvent) {
  event?.stopPropagation();
  emit('edit-click', ws);
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (trayExpanded.value && !target.closest('.kwami-selector')) {
    trayExpanded.value = false;
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

function scrollListToBottom() {
  requestAnimationFrame(() => {
    if (kwamiListRef.value) {
      kwamiListRef.value.scrollTop = kwamiListRef.value.scrollHeight;
    }
  });
}

defineExpose({ scrollListToBottom });
</script>

<template>
  <div class="kwami-selector" :class="{ expanded: trayExpanded }">
    <button class="kwami-active-btn" @click.stop="toggleTray" title="Switch Kwami">
      <div
        v-if="activeWorkspace"
        class="kwami-preview"
        :style="{ background: getGradient(activeWorkspace.colors) }"
      ></div>
    </button>

    <div class="kwami-tray" :class="{ visible: trayExpanded }">
      <div class="kwami-tray-header">
        <span class="kwami-tray-title">Your Kwamis</span>
      </div>
      <div ref="kwamiListRef" class="kwami-list">
        <button
          v-for="ws in workspaces"
          :key="ws.id"
          type="button"
          class="kwami-item"
          :class="{ active: ws.id === activeWorkspace?.id }"
          @click="switchKwami(ws.id)"
        >
          <div class="kwami-item-preview" :style="{ background: getGradient(ws.colors) }"></div>
          <div class="kwami-item-info">
            <span
              class="kwami-item-name"
              :title="'Edit name & gradient: ' + ws.name"
              @click.stop="onEditClick(ws, $event)"
            >{{ ws.name }}</span>
            <span v-if="ws.emoji" class="kwami-item-emoji">{{ ws.emoji }}</span>
          </div>
          <iconify-icon
            icon="ph:pencil-simple-duotone"
            class="kwami-item-edit"
            title="Edit name & gradient"
            @click.stop="onEditClick(ws, $event)"
          />
        </button>
      </div>
      <button type="button" class="kwami-add-btn" @click="onAddClick($event)" title="Create new Kwami">
        <iconify-icon icon="ph:plus-bold"></iconify-icon>
        <span>New Kwami</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.kwami-selector {
  position: relative;
}

.kwami-active-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-1);
  border: 2px solid var(--accent-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  padding: 4px;
  box-shadow: 0 0 16px var(--accent-glow);
}

.kwami-active-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 0 24px var(--accent-glow);
}

.kwami-selector.expanded .kwami-active-btn {
  background: var(--accent-glow);
}

.kwami-preview {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
}

.kwami-tray {
  position: absolute;
  top: -10px;
  left: calc(100% + 22px);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow);
  padding: 12px;
  min-width: 200px;
  max-width: 240px;
  overflow-x: hidden;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-10px);
  transition: all var(--duration-normal) var(--ease-out);
  z-index: 100;
  pointer-events: none;
}

.kwami-tray.visible {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
  pointer-events: auto;
}

.kwami-tray-header {
  padding: 0 4px 8px;
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 8px;
}

.kwami-tray-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.kwami-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
}

.kwami-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.kwami-item:hover {
  background: var(--surface-2);
}

.kwami-item.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  box-shadow: 0 2px 12px var(--accent-glow);
}

.kwami-item-preview {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
}

.kwami-item-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.kwami-item-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  cursor: pointer;
}

.kwami-item-name:hover {
  text-decoration: underline;
}

.kwami-item-edit {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--radius-sm);
}

.kwami-item-edit:hover {
  color: var(--accent-primary);
  background: var(--surface-2);
}

.kwami-item-emoji {
  font-size: 10px;
  color: var(--text-muted);
}

.kwami-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background: transparent;
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.kwami-add-btn:hover {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  border-style: solid;
  color: var(--accent-primary);
}
</style>
