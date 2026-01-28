<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useKwami } from '@/composables/useKwami';
import { useUIStore } from '@/stores/ui';
import { useInteractionStore, type InteractionAction } from '@/stores/interaction';
import { useAuthStore } from '@/stores/auth';
import AuthGuard from '@/components/auth/AuthGuard.vue';
import TheSidebar from '@/components/sidebar/TheSidebar.vue';
import AvatarPanel from '@/components/panels/avatar/AvatarPanel.vue';
import AgentPanel from '@/components/panels/agent/AgentPanel.vue';
import ScenePanel from '@/components/panels/scene/ScenePanel.vue';
import InteractionPanel from '@/components/panels/interaction/InteractionPanel.vue';
import AudioPanel from '@/components/panels/audio/AudioPanel.vue';
import VoicePanel from '@/components/panels/voice/VoicePanel.vue';
import EnhancementsPanel from '@/components/panels/enhancements/EnhancementsPanel.vue';
import TranscriptionPanel from '@/components/panels/transcription/TranscriptionPanel.vue';
import PersonaPanel from '@/components/panels/persona/PersonaPanel.vue';
import MemoryPanel from '@/components/panels/memory/MemoryPanel.vue';
import ToolsPanel from '@/components/panels/tools/ToolsPanel.vue';
import InfoPanel from '@/components/panels/info/InfoPanel.vue';
import MetricsPanel from '@/components/panels/metrics/MetricsPanel.vue';

const { kwami, init, switchRenderer } = useKwami();
const uiStore = useUIStore();
const interactionStore = useInteractionStore();
const authStore = useAuthStore();

// Logout handler
async function handleLogout() {
  await authStore.signOut();
}

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Execute interaction action based on config
function executeInteractionAction(action: InteractionAction) {
  if (!kwami.value) return;

  switch (action) {
    case 'toggleListening': {
      const currentState = kwami.value.getState() || 'idle';
      if (currentState === 'listening') {
        kwami.value.setState('idle');
      } else {
        kwami.value.setState('listening');
      }
      break;
    }
    case 'startListening':
      kwami.value.setState('listening');
      break;
    case 'stopListening':
      kwami.value.setState('idle');
      break;
    case 'randomize':
      kwami.value.avatar.randomize();
      window.dispatchEvent(new CustomEvent('kwami:randomized'));
      break;
    case 'switchRenderer': {
      const renderer = kwami.value.avatar.getRendererType();
      switchRenderer(renderer === 'blob' ? 'crystal' : 'blob');
      break;
    }
    case 'cycleState': {
      const states = ['idle', 'listening', 'thinking'] as const;
      const current = kwami.value.getState() || 'idle';
      const currentIndex = states.indexOf(current as typeof states[number]);
      const nextIndex = (currentIndex + 1) % states.length;
      const nextState = states[nextIndex] || 'idle';
      kwami.value.setState(nextState);
      window.dispatchEvent(new CustomEvent('kwami:stateChanged', { detail: nextState }));
      break;
    }
    case 'pulse': {
      // Trigger visual pulse effect on the current renderer
      const blob = kwami.value.avatar.getBlob();
      const crystal = kwami.value.avatar.getCrystal();
      if (blob) blob.triggerPulse();
      if (crystal) crystal.triggerPulse();
      break;
    }
    case 'none':
    default:
      break;
  }
}

// Apply interaction configuration to the Kwami instance
function applyInteractionConfig() {
  if (!kwami.value) return;

  const config = interactionStore.config;
  const blob = kwami.value.avatar.getBlob();
  const crystal = kwami.value.avatar.getCrystal();

  // Apply click callback
  // When enabled with a valid action: execute the action
  // When disabled or action is 'none': use no-op to prevent default pulse
  const clickHandler = config.click.enabled && config.click.action !== 'none'
    ? () => executeInteractionAction(config.click.action)
    : () => {}; // No-op prevents default pulse behavior

  if (blob) {
    blob.onClick = clickHandler;
  }
  if (crystal) {
    crystal.onClick = clickHandler;
  }

  // Apply double-click callback
  // When disabled or action is 'none': use no-op to prevent default toggle behavior
  const doubleClickHandler = config.doubleClick.enabled && config.doubleClick.action !== 'none'
    ? () => executeInteractionAction(config.doubleClick.action)
    : () => {};

  if (blob) {
    blob.onDoubleClick = doubleClickHandler;
  }
  if (crystal) {
    crystal.onDoubleClick = doubleClickHandler;
  }

  // Apply right-click callbacks
  const rightClickHandler = config.rightClick.enabled && config.rightClick.action !== 'none'
    ? () => executeInteractionAction(config.rightClick.action)
    : () => {};
  const doubleRightClickHandler = config.doubleRightClick.enabled && config.doubleRightClick.action !== 'none'
    ? () => executeInteractionAction(config.doubleRightClick.action)
    : () => {};

  if (blob) {
    blob.setRightClickCallback(rightClickHandler);
    blob.setDoubleRightClickCallback(doubleRightClickHandler);
  }
  if (crystal) {
    crystal.setRightClickCallback(rightClickHandler);
    crystal.setDoubleRightClickCallback(doubleRightClickHandler);
  }

  // Apply hover cursor style
  if (canvasRef.value) {
    canvasRef.value.style.cursor = config.hover.enabled
      ? config.hover.cursorStyle
      : 'default';
  }
}

// Watch interaction config for changes and apply them
watch(
  () => interactionStore.config,
  () => {
    applyInteractionConfig();
  },
  { deep: true }
);

// Also re-apply when renderer switches
window.addEventListener('kwami:rendererChanged', () => {
  // Small delay to ensure new renderer is initialized
  setTimeout(() => applyInteractionConfig(), 50);
});

// Track if Kwami has been initialized
const isInitialized = ref(false);

// Initialize Kwami when canvas becomes available (after auth)
function initializeKwami() {
  if (isInitialized.value || !canvasRef.value) return;

  // Default to blob renderer
  const rendererType = 'blob';

  init(canvasRef.value, rendererType);
  isInitialized.value = true;

  // Trigger initial resize to ensure proper sizing
  requestAnimationFrame(() => {
    handleResize();
  });

  // Apply initial interaction configuration
  applyInteractionConfig();

  // Console info
  console.log('🎮 Kwami Playground (🫧 blob renderer)');
  console.log('Shortcuts: R=randomize, L=listening, T=thinking, I=idle, P=toggle panel');
  console.log('Renderer: B=blob, C=crystal');
  console.log('Access kwami via window.kwami in console');
}

// Handle window resize - trigger scene resize and recenter avatar
function handleResize() {
  if (kwami.value && canvasRef.value) {
    // Get parent container size (not canvas size, as canvas has inline styles)
    const parent = canvasRef.value.parentElement;
    if (!parent) return;
    
    const width = parent.clientWidth || window.innerWidth;
    const height = parent.clientHeight || window.innerHeight;
    
    // Resize the scene (renderer and camera)
    kwami.value.avatar.getScene()?.resize(width, height);
    // Refresh blob position to recenter after resize
    kwami.value.avatar.getBlob()?.position.refresh();
  }
}

// Watch for canvas to become available (happens after auth guard shows slot)
watch(canvasRef, (canvas) => {
  if (canvas) {
    initializeKwami();
  }
});

onMounted(() => {
  // Try to initialize if canvas is already available
  initializeKwami();

  // Add resize listener
  window.addEventListener('resize', handleResize);

  // Shortcuts
  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    // Panel toggle
    if (e.key === 'p' || e.key === 'P') {
      uiStore.togglePanel();
    }
    // Renderer switch shortcuts
    if (e.key === 'b' || e.key === 'B') switchRenderer('blob');
    if (e.key === 'c' || e.key === 'C') switchRenderer('crystal');
    // Avatar state shortcuts
    if (e.key === 'r') {
      kwami.value?.avatar.randomize();
      window.dispatchEvent(new CustomEvent('kwami:randomized'));
      console.log('🎲 Randomized!');
    }
    if (e.key === 'l') {
      kwami.value?.setState('listening');
      window.dispatchEvent(new CustomEvent('kwami:stateChanged', { detail: 'listening' }));
      console.log('🎤 Listening mode');
    }
    if (e.key === 't') {
      kwami.value?.setState('thinking');
      window.dispatchEvent(new CustomEvent('kwami:stateChanged', { detail: 'thinking' }));
      console.log('🤔 Thinking mode');
    }
    if (e.key === 'i') {
      kwami.value?.setState('idle');
      window.dispatchEvent(new CustomEvent('kwami:stateChanged', { detail: 'idle' }));
      console.log('😴 Idle mode');
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <AuthGuard>
    <div id="kwami-root">
      <canvas id="kwami-canvas" ref="canvasRef"></canvas>

      <!-- User info & logout button -->
      <div class="user-controls">
        <span class="user-email">{{ authStore.userEmail }}</span>
        <button class="logout-btn" @click="handleLogout" title="Logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>

      <TheSidebar>
        <AvatarPanel v-if="uiStore.activePanel === 'avatar'" />
        <AgentPanel v-if="uiStore.activePanel === 'agent'" />
        <ScenePanel v-if="uiStore.activePanel === 'scene'" />
        <InteractionPanel v-if="uiStore.activePanel === 'interaction'" />
        <AudioPanel v-if="uiStore.activePanel === 'audio'" />
        <VoicePanel v-if="uiStore.activePanel === 'voice'" />
        <EnhancementsPanel v-if="uiStore.activePanel === 'enhancements'" />
        <TranscriptionPanel v-if="uiStore.activePanel === 'transcription'" />
        <PersonaPanel v-if="uiStore.activePanel === 'persona'" />
        <MemoryPanel v-if="uiStore.activePanel === 'memory'" />
        <ToolsPanel v-if="uiStore.activePanel === 'tools'" />
        <InfoPanel v-if="uiStore.activePanel === 'info'" />
        <MetricsPanel v-if="uiStore.activePanel === 'metrics'" />
      </TheSidebar>
    </div>
  </AuthGuard>
</template>

<style scoped>
/* Panel inner styling */
:deep(.panel-inner) {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* User controls */
.user-controls {
  position: fixed;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-email {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}
</style>
