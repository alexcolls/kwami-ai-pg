<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useKwami } from '@/composables/useKwami';
import { useUIStore } from '@/stores/ui';
import TheSidebar from '@/components/sidebar/TheSidebar.vue';
import AvatarPanel from '@/components/panels/avatar/AvatarPanel.vue';
import AgentPanel from '@/components/panels/agent/AgentPanel.vue';
import ScenePanel from '@/components/panels/scene/ScenePanel.vue';
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

const canvasRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (canvasRef.value) {
    // Determine renderer from URL
    const urlParams = new URLSearchParams(window.location.search);
    const rendererType = (urlParams.get('renderer') as 'blob' | 'crystal') || 'blob';

    init(canvasRef.value, rendererType);

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
