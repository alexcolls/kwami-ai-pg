<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useWorkspaceStore } from '@/stores/workspace';

const uiStore = useUIStore();
const workspaceStore = useWorkspaceStore();

const trayExpanded = ref(false);

const activeWorkspace = computed(() => workspaceStore.getActiveWorkspace());
const workspaces = computed(() => workspaceStore.workspaces);

const panelIcons: Record<string, string> = {
  avatar: 'ph:ghost-duotone',
  scene: 'ph:mountains-duotone',
  interaction: 'ph:cursor-click-duotone',
  audio: 'ph:waveform-duotone',
  voice: 'ph:microphone-duotone',
  enhancements: 'ph:sliders-duotone',
  persona: 'ph:user-circle-duotone',
  memory: 'ph:brain-duotone',
  tools: 'ph:wrench-duotone',
  metrics: 'ph:chart-line-up-duotone',
  transcription: 'ph:chat-circle-text-duotone',
  info: 'ph:info-duotone',
  account: 'ph:user-duotone',
  // Model Panels
  models: 'ph:cpu-duotone',
  llm: 'ph:brain-duotone',
  stt: 'ph:ear-duotone',
  tts: 'lucide:audio-lines',
  vision: 'ph:eye-duotone',
};

function toggleTray() {
  trayExpanded.value = !trayExpanded.value;
}

function switchKwami(id: string) {
  workspaceStore.setActive(id);
  trayExpanded.value = false;
}

function addKwami() {
  workspaceStore.addKwami();
}

// Close tray when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (trayExpanded.value && !target.closest('.kwami-selector')) {
    trayExpanded.value = false;
  }
}

// Add event listener for clicking outside (simple version)
import { onMounted, onUnmounted } from 'vue';

function handleKeydown(e: KeyboardEvent) {
  if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

  const panelTypes = [
    'avatar', 'scene', 'interaction', 'audio',
    'voice', 'enhancements', 'metrics', 'transcription',
    'persona', 'memory', 'tools',
    'info', 'account'
  ];

  if (e.key >= '1' && e.key <= '9') {
    const idx = parseInt(e.key) - 1;
    const panel = panelTypes[idx];
    if (panel) uiStore.setPanel(panel);
  } else if (e.key === '0') {
    uiStore.setPanel('memory');
  } else if (e.key === '-') {
    uiStore.setPanel('tools');
  } else if (e.key === '=') {
    uiStore.setPanel('info');
  } else if (e.key.toLowerCase() === 'p') {
    uiStore.togglePanel();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeydown);
});

function getGradient(colors: { x: string; y: string; z: string }) {
  return `linear-gradient(135deg, ${colors.x} 0%, ${colors.y} 50%, ${colors.z} 100%)`;
}

// Toggle panel or switch to it
function handlePanelClick(panel: string) {
  if (uiStore.activePanel === panel && uiStore.isPanelOpen) {
    // Clicking active panel closes it
    uiStore.togglePanel();
  } else {
    // Clicking different panel opens/switches to it
    uiStore.setPanel(panel);
  }
}
</script>

<template>
  <div class="switcher-column">
    <!-- Kwami Selector -->
    <div class="kwami-selector" :class="{ expanded: trayExpanded }">
      <button class="kwami-active-btn" @click.stop="toggleTray" title="Switch Kwami">
        <div 
          v-if="activeWorkspace"
          class="kwami-preview" 
          :style="{ background: getGradient(activeWorkspace.colors) }"
        ></div>
      </button>
      
      <!-- Tray -->
      <div class="kwami-tray" :class="{ visible: trayExpanded }">
        <div class="kwami-tray-header">
          <span class="kwami-tray-title">Your Kwamis</span>
        </div>
        <div class="kwami-list">
          <button 
            v-for="ws in workspaces" 
            :key="ws.id"
            class="kwami-item" 
            :class="{ active: ws.id === activeWorkspace?.id }"
            @click="switchKwami(ws.id)"
          >
            <div class="kwami-item-preview" :style="{ background: getGradient(ws.colors) }"></div>
            <div class="kwami-item-info">
              <span class="kwami-item-name">{{ ws.name }}</span>
              <span class="kwami-item-emoji">{{ ws.emoji }}</span>
            </div>
          </button>
        </div>
        <button class="kwami-add-btn" @click="addKwami" title="Create new Kwami">
          <iconify-icon icon="ph:plus-bold"></iconify-icon>
          <span>New Kwami</span>
        </button>
      </div>
    </div>

    <div class="nav-divider"></div>

    <!-- Visual Group -->
    <div class="nav-group">
      <span class="switcher-label">Visual</span>
      <button
        v-for="p in ['avatar', 'scene', 'interaction', 'audio']"
        :key="p"
        class="nav-btn"
        :class="{ active: uiStore.activePanel === p && uiStore.isPanelOpen }"
        @click="handlePanelClick(p)"
        :title="p.charAt(0).toUpperCase() + p.slice(1)"
      >
        <iconify-icon :icon="panelIcons[p]"></iconify-icon>
      </button>
    </div>

    <div class="nav-divider"></div>

    <!-- Agent Group -->
    <div class="nav-group">
      <span class="switcher-label">Agent</span>
      <!-- Models (unified panel) -->
      <button
        class="nav-btn"
        :class="{ active: uiStore.activePanel === 'models' && uiStore.isPanelOpen }"
        @click="handlePanelClick('models')"
        title="Models"
      >
        <iconify-icon :icon="panelIcons['models']"></iconify-icon>
      </button>
      <button
        v-for="p in ['voice', 'enhancements', 'memory', 'tools', 'persona']"
        :key="p"
        class="nav-btn"
        :class="{ active: uiStore.activePanel === p && uiStore.isPanelOpen }"
        @click="handlePanelClick(p)"
        :title="p.charAt(0).toUpperCase() + p.slice(1)"
      >
        <iconify-icon :icon="panelIcons[p]"></iconify-icon>
      </button>
    </div>

    <div class="nav-divider"></div>

    <!-- Config Group -->
    <div class="nav-group">
      <span class="switcher-label">Info</span>
      <button
        v-for="p in ['transcription', 'metrics', 'info']"
        :key="p"
        class="nav-btn"
        :class="{ active: uiStore.activePanel === p && uiStore.isPanelOpen }"
        @click="handlePanelClick(p)"
        :title="p.charAt(0).toUpperCase() + p.slice(1)"
      >
        <iconify-icon :icon="panelIcons[p]"></iconify-icon>
      </button>
    </div>

    <div class="nav-spacer"></div>

    <!-- Account -->
    <button
      class="nav-btn account-btn"
      :class="{ active: uiStore.activePanel === 'account' && uiStore.isPanelOpen }"
      @click="handlePanelClick('account')"
      title="Account"
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

/* Kwami Selector Styles */
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
  transform: translateX(2px);
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
