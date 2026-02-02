<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useKwami } from '@/composables/useKwami';
import { useUIStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import AuthGuard from '@/components/auth/AuthGuard.vue';
import WelcomeScreen from '@/components/welcome/WelcomeScreen.vue';
import TheSidebar from '@/components/sidebar/TheSidebar.vue';
import ControlBar from '@/components/controls/ControlBar.vue';
import AvatarPanel from '@/components/panels/avatar/AvatarPanel.vue';
import ScenePanel from '@/components/panels/scene/ScenePanel.vue';
import VoicePanel from '@/components/panels/voice/VoicePanel.vue';
import EnhancementsPanel from '@/components/panels/enhancements/EnhancementsPanel.vue';
import TranscriptionPanel from '@/components/panels/transcription/TranscriptionPanel.vue';
import PersonaPanel from '@/components/panels/persona/PersonaPanel.vue';
import MemoryPanel from '@/components/panels/memory/MemoryPanel.vue';
import ToolsPanel from '@/components/panels/tools/ToolsPanel.vue';
import InfoPanel from '@/components/panels/info/InfoPanel.vue';
import MetricsPanel from '@/components/panels/metrics/MetricsPanel.vue';
import AccountPanel from '@/components/panels/account/AccountPanel.vue';
import ThemePanel from '@/components/panels/theme/ThemePanel.vue';
import LLMPanel from '@/components/panels/models/LLMPanel.vue';
import STTPanel from '@/components/panels/models/STTPanel.vue';
import TTSPanel from '@/components/panels/models/TTSPanel.vue';
import UnifiedModelsPanel from '@/components/panels/models/unified/UnifiedModelsPanel.vue';
import RotationDisplay from '@/components/ui/RotationDisplay.vue';

const { kwami, init, switchRenderer } = useKwami();
const uiStore = useUIStore();
const authStore = useAuthStore();

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Welcome screen state
const showWelcome = ref(false);
const hasShownWelcome = ref(false);

// Watch for authentication to show welcome screen
watch(() => authStore.isAuthenticated, (isAuth, wasAuth) => {
  // Show welcome when user just logged in (was not auth, now is auth)
  if (isAuth && !wasAuth && !hasShownWelcome.value) {
    showWelcome.value = true;
    hasShownWelcome.value = true;
  }
});

function onWelcomeComplete() {
  showWelcome.value = false;
}

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

  // Console info
  console.log('🎮 Kwami Playground (🫧 blob renderer)');
  console.log('Shortcuts: R=randomize, L=listening, T=thinking, I=idle, P=toggle panel');
  console.log('Renderer: B=blob, O|C=orbital-shards');
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
    if (e.key === 'c' || e.key === 'C' || e.key === 'o' || e.key === 'O') switchRenderer('orbital-shards');
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
  <!-- Welcome screen shown after login -->
  <WelcomeScreen
    v-if="showWelcome"
    :visible="showWelcome"
    :duration="3500"
    @complete="onWelcomeComplete"
  />

  <AuthGuard>
    <div id="kwami-root">
      <!-- Canvas always renders for background effect -->
      <canvas id="kwami-canvas" ref="canvasRef"></canvas>

      <!-- UI controls only shown when authenticated and welcome complete -->
      <template v-if="authStore.isAuthenticated && !showWelcome">
        <!-- Control Bar (top-right) -->
        <div class="control-bar-container">
          <ControlBar />
        </div>

        <!-- Rotation Display (bottom-left) -->
        <RotationDisplay />

        <TheSidebar>
          <AvatarPanel v-if="uiStore.activePanel === 'avatar'" />
          <ScenePanel v-if="uiStore.activePanel === 'scene'" />
          <VoicePanel v-if="uiStore.activePanel === 'voice'" />
          <EnhancementsPanel v-if="uiStore.activePanel === 'enhancements'" />
          <TranscriptionPanel v-if="uiStore.activePanel === 'transcription'" />
          <PersonaPanel v-if="uiStore.activePanel === 'persona'" />
          <MemoryPanel v-if="uiStore.activePanel === 'memory'" />
          <ToolsPanel v-if="uiStore.activePanel === 'tools'" />
          <InfoPanel v-if="uiStore.activePanel === 'info'" />
          <MetricsPanel v-if="uiStore.activePanel === 'metrics'" />
          <AccountPanel v-if="uiStore.activePanel === 'account'" />
          <ThemePanel v-if="uiStore.activePanel === 'theme'" />
          <LLMPanel v-if="uiStore.activePanel === 'llm'" />
          <STTPanel v-if="uiStore.activePanel === 'stt'" />
          <TTSPanel v-if="uiStore.activePanel === 'tts'" />
          <UnifiedModelsPanel v-if="uiStore.activePanel === 'models'" />
        </TheSidebar>
      </template>
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

/* Control Bar Container */
.control-bar-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
}
</style>
