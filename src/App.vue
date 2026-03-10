<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useKwami } from '@/composables/useKwami';
import { useSceneBackground } from '@/composables/useSceneBackground';
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
import ModelsPanel from '@/components/panels/models/ModelsPanel.vue';
import EnergyPanel from '@/components/panels/energy/EnergyPanel.vue';
import EnergyBadge from '@/components/energy/EnergyBadge.vue';
import SearchOrbitCards from '@/components/search/SearchOrbitCards.vue';

import { useWorkspaceStore } from '@/stores/workspace';
import { useKwamiConfigWatchers } from '@/composables/useKwamiConfigSync';
import { useSearchResults } from '@/composables/useSearchResults';
import { useNavigation } from '@/composables/useNavigation';
import { useSearchStore } from '@/stores/search';
import { useAvatarStore } from '@/stores/avatar';
import { useBlobXyzSync } from '@/composables/avatar/sync/useBlobXyzSync';
import { useOrbitalShardsSync } from '@/composables/avatar/sync/useOrbitalShardsSync';
import { useStarsGenesisSync } from '@/composables/avatar/sync/useStarsGenesisSync';
import { useCrystalBallSync } from '@/composables/avatar/sync/useCrystalBallSync';
import { useBlackHoleSync } from '@/composables/avatar/sync/useBlackHoleSync';

const { kwami, init, switchRenderer, rendererType: kwamiRendererType } = useKwami();
const { initialize: initSceneBackground } = useSceneBackground();
import { useVoiceStore } from '@/stores/voice';
import { useCreditsStore } from '@/stores/credits';

const uiStore = useUIStore();
const authStore = useAuthStore();
const workspaceStore = useWorkspaceStore();

// Search results: callback + event listener both update store; panel reads store
const searchResults = useSearchResults();
const searchStore = useSearchStore();
const avatarStore = useAvatarStore();

// Navigation: extension opens tab/split; no sidebar
useNavigation();

// Sync per-kwami config: apply config when switching kwami, debounced save to DB
useKwamiConfigWatchers();
const voiceStore = useVoiceStore();
const creditsStore = useCreditsStore();

// Avatar sync composables (used to apply saved state on init)
const { applyToKwami: applyBlobToKwami } = useBlobXyzSync({
  kwami,
  getBlob: () => kwami.value?.avatar.getBlob(),
});
const { applyToKwami: applyOrbitalShardsToKwami } = useOrbitalShardsSync({
  kwami,
  getOrbitalShards: () => kwami.value?.avatar.getOrbitalShards(),
});
const { applyToKwami: applyStarsGenesisToKwami } = useStarsGenesisSync({
  kwami,
  getStarsGenesis: () => kwami.value?.avatar.getStarsGenesis(),
});
const { applyToKwami: applyCrystalBallToKwami } = useCrystalBallSync({
  kwami,
  getCrystalBall: () => (kwami.value?.avatar as any)?.getCrystalBall?.(),
});
const { applyToKwami: applyBlackHoleToKwami } = useBlackHoleSync({
  kwami,
  getBlackHole: () => (kwami.value?.avatar as any)?.getBlackHole?.(),
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Welcome screen state
const showWelcome = ref(false);
const hasShownWelcome = ref(false);

// Watch for authentication: welcome screen, credits, load kwamis from DB
watch(
  () => authStore.isAuthenticated,
  (isAuth, wasAuth) => {
    if (isAuth && wasAuth === false && !hasShownWelcome.value) {
      showWelcome.value = true;
      hasShownWelcome.value = true;
    }
    if (isAuth) {
      creditsStore.init();
      const uid = authStore.userId;
      if (uid) void workspaceStore.loadFromDb(uid);
    }
  },
  { immediate: true },
);

// Refresh energy/credits when user disconnects from voice (usage is reported on session end)
function onKwamiDisconnected() {
  creditsStore.loadBalance();
  creditsStore.loadUsageLogs();
}
function onKwamiConfigApplied() {
  applySavedAvatarState();
  applySavedPersonaState();
  initSceneBackground();
}

onMounted(() => {
  window.addEventListener('kwami:disconnected', onKwamiDisconnected);
  window.addEventListener('kwami:configApplied', onKwamiConfigApplied);
});
onUnmounted(() => {
  window.removeEventListener('kwami:disconnected', onKwamiDisconnected);
  window.removeEventListener('kwami:configApplied', onKwamiConfigApplied);
});

function onWelcomeComplete() {
  showWelcome.value = false;
}

// Track if Kwami has been initialized
const isInitialized = ref(false);

// Apply saved avatar state to kwami instance
function applySavedAvatarState() {
  const savedRenderer = avatarStore.rendererType;

  // Switch to saved renderer if different from default
  if (kwamiRendererType.value !== savedRenderer) {
    switchRenderer(savedRenderer as any);
  }

  // Apply the saved state for the active renderer
  switch (savedRenderer) {
    case 'blob-xyz': applyBlobToKwami(); break;
    case 'orbital-shards': applyOrbitalShardsToKwami(); break;
    case 'stars-genesis': applyStarsGenesisToKwami(); break;
    case 'crystal-ball': applyCrystalBallToKwami(); break;
    case 'black-hole': applyBlackHoleToKwami(); break;
  }
}

// Apply current store persona to the Kwami instance so the live agent matches the active kwami config
function applySavedPersonaState() {
  if (!kwami.value) return;
  const saved = voiceStore.personaConfig;
  kwami.value.persona.updateConfig({
    name: saved.name,
    personality: saved.personality,
    systemPrompt: saved.systemPrompt,
    traits: [...saved.traits],
    conversationStyle: saved.conversationStyle,
    responseLength: saved.responseLength,
    emotionalTone: saved.emotionalTone,
    emotionalTraits: { ...saved.emotionalTraits },
  });
}

// Initialize Kwami when canvas becomes available (after auth)
function initializeKwami() {
  if (isInitialized.value || !canvasRef.value) return;

  // Default to blob renderer (will be overridden by saved state if available)
  const rendererType = 'blob-xyz';

  init(canvasRef.value, rendererType, {
    onSearchResults: (data) => searchResults.setResults(data),
  });
  isInitialized.value = true;

  // Initialize scene background from saved settings
  initSceneBackground();

  // Apply saved avatar state (renderer type + settings) from localStorage
  if (avatarStore.isInitialized) {
    applySavedAvatarState();
  }

  // Apply saved persona config to kwami
  applySavedPersonaState();

  // Trigger initial resize to ensure proper sizing
  requestAnimationFrame(() => {
    handleResize();
  });

  // Console info
  console.log('🎮 Kwami App (🫧 blob renderer)');
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

    // Panel size shortcuts (Alt+1/2/3)
    if (e.altKey && e.key === '1') {
      e.preventDefault();
      uiStore.setSizePreset('small');
    }
    if (e.altKey && e.key === '2') {
      e.preventDefault();
      uiStore.setSizePreset('medium');
    }
    if (e.altKey && e.key === '3') {
      e.preventDefault();
      uiStore.setSizePreset('large');
    }

    // Panel toggle
    if (e.key === 'p' || e.key === 'P') {
      uiStore.togglePanel();
    }
    // Renderer switch shortcuts
    if (e.key === 'b' || e.key === 'B') switchRenderer('blob-xyz');
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
    <div id="kwami-root" class="root-layout">
      <!-- Main area: canvas + overlays (no nav sidebar) -->
      <div class="main-area">
        <canvas id="kwami-canvas" ref="canvasRef"></canvas>

        <!-- UI controls only shown when authenticated and welcome complete -->
        <template v-if="authStore.isAuthenticated && !showWelcome">
          <!-- Search results as orbit cards around the Kwami (blob) -->
          <SearchOrbitCards />
          <!-- Control Bar (top-right of main area; moves with canvas when nav opens) -->
          <div class="control-bar-container">
            <EnergyBadge />
            <ControlBar />
          </div>
        </template>
      </div>

      <template v-if="authStore.isAuthenticated && !showWelcome">
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
          <ModelsPanel v-if="uiStore.activePanel === 'models'" />
          <EnergyPanel v-if="uiStore.activePanel === 'credits'" />
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

/* Root layout: flex row for main area + nav sidebar */
.root-layout {
  display: flex;
  flex-direction: row;
}

/* Main area: canvas + overlays; always full width */
.main-area {
  flex: 1;
  min-width: 0;
  position: relative;
  overflow: hidden;
}

/* Canvas fills main area */
.main-area canvas#kwami-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Control Bar: positioned at top-right of main area (moves with canvas) */
.control-bar-container {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
