<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useKwami } from '@/composables/useKwami';
import { useUIStore } from '@/stores/ui';
import { useInteractionStore, type InteractionAction } from '@/stores/interaction';
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
    case 'pulse':
      // Pulse effect is visual-only, handled by the renderer's touch system
      break;
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
  const clickHandler = config.click.enabled
    ? () => executeInteractionAction(config.click.action)
    : undefined;

  if (blob) {
    blob.onClick = clickHandler;
  }
  if (crystal) {
    crystal.onClick = clickHandler;
  }

  // Apply double-click callback
  const doubleClickHandler = config.doubleClick.enabled
    ? () => executeInteractionAction(config.doubleClick.action)
    : undefined;

  if (blob) {
    blob.onDoubleClick = doubleClickHandler;
  }
  if (crystal) {
    crystal.onDoubleClick = doubleClickHandler;
  }

  // Apply right-click callbacks
  const rightClickHandler = config.rightClick.enabled
    ? () => executeInteractionAction(config.rightClick.action)
    : () => {};
  const doubleRightClickHandler = config.doubleRightClick.enabled
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

onMounted(() => {
  if (canvasRef.value) {
    // Determine renderer from URL
    const urlParams = new URLSearchParams(window.location.search);
    const rendererType = (urlParams.get('renderer') as 'blob' | 'crystal') || 'blob';

    init(canvasRef.value, rendererType);

    // Apply initial interaction configuration
    applyInteractionConfig();

    // Console info
    const rendererEmoji = rendererType === 'crystal' ? '💎' : '🫧';
    console.log(`🎮 Kwami Playground (${rendererEmoji} ${rendererType} renderer)`);
    console.log('Shortcuts: R=randomize, L=listening, T=thinking, I=idle, P=toggle panel');
    console.log('Renderer: B=blob, C=crystal');
    console.log('Access kwami via window.kwami in console');
  }

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
</script>

<template>
  <div id="kwami-root">
    <canvas id="kwami-canvas" ref="canvasRef"></canvas>

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
</style>
