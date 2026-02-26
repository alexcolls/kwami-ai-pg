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

import { useWorkspaceStore } from '@/stores/workspace';
import { useKwamiConfigWatchers } from '@/composables/useKwamiConfigSync';
import { useSearchResults } from '@/composables/useSearchResults';
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

function faviconForUrl(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  } catch {
    return '';
  }
}

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
    <div id="kwami-root">
      <!-- Canvas always renders for background effect -->
      <canvas id="kwami-canvas" ref="canvasRef"></canvas>

      <!-- UI controls only shown when authenticated and welcome complete -->
        <template v-if="authStore.isAuthenticated && !showWelcome">
        <!-- Web search results overlay (store-driven so it always shows when data exists) -->
        <Teleport to="body">
          <div
            v-if="searchStore.hasSearchData || searchStore.error"
            class="search-overlay"
            role="region"
            aria-label="Web search results"
          >
            <div class="search-overlay-backdrop" @click="searchStore.clear" />
            <div class="search-overlay-panel">
              <header class="search-overlay-header">
                <span class="search-overlay-title">
                  <iconify-icon icon="ph:magnifying-glass-duotone" />
                  Web search
                </span>
                <button type="button" class="search-overlay-close" @click="searchStore.clear" aria-label="Close">
                  <iconify-icon icon="ph:x" />
                </button>
              </header>
              <p v-if="searchStore.query" class="search-overlay-query">“{{ searchStore.query }}”</p>
              <p v-if="searchStore.answer" class="search-overlay-answer">{{ searchStore.answer }}</p>
              <div v-if="searchStore.error" class="search-overlay-error">{{ searchStore.error }}</div>
              <ul v-else class="search-overlay-list">
                <li v-for="(r, i) in searchStore.results" :key="i" class="search-overlay-item">
                  <a :href="r.url" target="_blank" rel="noopener noreferrer" class="search-overlay-card">
                    <span class="search-overlay-card-img-wrap">
                      <img
                        v-if="faviconForUrl(r.url)"
                        :src="faviconForUrl(r.url)"
                        alt=""
                        class="search-overlay-card-img"
                        loading="lazy"
                      />
                      <iconify-icon v-else icon="ph:link-duotone" class="search-overlay-card-icon" />
                    </span>
                    <span class="search-overlay-card-body">
                      <span class="search-overlay-card-title">{{ r.title }}</span>
                      <span class="search-overlay-card-desc">{{ (r.content || '').slice(0, 200) }}{{ (r.content || '').length > 200 ? '…' : '' }}</span>
                      <span class="search-overlay-card-url">{{ r.url }}</span>
                    </span>
                    <iconify-icon icon="ph:arrow-square-out-duotone" class="search-overlay-card-arrow" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Teleport>
        <!-- Control Bar (top-right) -->
        <div class="control-bar-container">
          <EnergyBadge />
          <ControlBar />
        </div>

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

/* Control Bar Container */
.control-bar-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Web search overlay – store-driven, impossible to miss */
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}
.search-overlay-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
}
.search-overlay-panel {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  min-height: 320px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow:
    var(--glass-shadow),
    0 0 0 1px rgba(0, 217, 255, 0.1),
    0 0 48px rgba(0, 217, 255, 0.08);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.search-overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}
.search-overlay-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent-primary);
}
.search-overlay-title iconify-icon {
  font-size: 1.25rem;
}
.search-overlay-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}
.search-overlay-close:hover {
  background: var(--surface-3);
  color: var(--text-primary);
}
.search-overlay-query {
  padding: 12px 20px 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
}
.search-overlay-answer {
  padding: 8px 20px 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-primary);
}
.search-overlay-error {
  padding: 20px;
  color: var(--error);
}
.search-overlay-list {
  list-style: none;
  margin: 0;
  padding: 12px 20px 20px;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
}
.search-overlay-item {
  margin-bottom: 10px;
}
.search-overlay-item:last-child {
  margin-bottom: 0;
}
.search-overlay-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  text-decoration: none;
  color: inherit;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.search-overlay-card:hover {
  background: var(--surface-2);
  border-color: rgba(0, 217, 255, 0.25);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.1);
}
.search-overlay-card-img-wrap {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: var(--surface-3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.search-overlay-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.search-overlay-card-icon {
  font-size: 1.75rem;
  color: var(--text-muted);
}
.search-overlay-card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.search-overlay-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--accent-primary);
  line-height: 1.3;
}
.search-overlay-card-desc {
  font-size: 0.82rem;
  line-height: 1.4;
  color: var(--text-secondary);
}
.search-overlay-card-url {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search-overlay-card-arrow {
  flex-shrink: 0;
  font-size: 1.25rem;
  color: var(--text-muted);
  margin-top: 2px;
}
</style>
