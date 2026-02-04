<script setup lang="ts">
import { onMounted, onUnmounted, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import { useAvatarStore, type AvatarState } from '@/stores/avatar';
import { useBlobXyzStore } from '@/stores/avatar.blob-xyz';
import { useOrbitalShardsStore } from '@/stores/avatar.orbital-shards';
import { useStarsGenesisStore } from '@/stores/avatar.stars-genesis';
import { useCrystalBallStore } from '@/stores/avatar.crystal-ball';
import { useBlackHoleStore } from '@/stores/avatar.black-hole';
import BasePanel from '@/components/ui/BasePanel.vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BlobXyzSettings from './BlobXyzSettings.vue';
import OrbitalShardsSettings from './OrbitalShardsSettings.vue';
import StarsGenesisSettings from './StarsGenesisSettings.vue';
import CrystalBallSettings from './CrystalBallSettings.vue';
import BlackHoleSettings from './BlackHoleSettings.vue';

// Sync composables
import { useBlobXyzSync } from '@/composables/avatar/sync/useBlobXyzSync';
import { useOrbitalShardsSync } from '@/composables/avatar/sync/useOrbitalShardsSync';
import { useStarsGenesisSync } from '@/composables/avatar/sync/useStarsGenesisSync';
import { useCrystalBallSync } from '@/composables/avatar/sync/useCrystalBallSync';
import { useBlackHoleSync } from '@/composables/avatar/sync/useBlackHoleSync';

const { kwami, rendererType: kwamiRendererType, switchRenderer } = useKwami();
const avatarStore = useAvatarStore();
const blobStore = useBlobXyzStore();
const orbitalShardsStore = useOrbitalShardsStore();
const starsGenesisStore = useStarsGenesisStore();
const crystalBallStore = useCrystalBallStore();
const blackHoleStore = useBlackHoleStore();

// Use store state
const {
  rendererType,
  blobXyzPresets,
  orbitalShardsPresets,
  starsGenesisPresets,
  crystalBallPresets,
  blackHolePresets,
} = storeToRefs(avatarStore);

// =====================================================
// HELPERS
// =====================================================

function getBlob() {
  return kwami.value?.avatar.getBlob();
}
function getOrbitalShards() {
  return kwami.value?.avatar.getOrbitalShards();
}
function getStarsGenesis() {
  return kwami.value?.avatar.getStarsGenesis();
}
function getCrystalBall() {
  return (kwami.value?.avatar as any)?.getCrystalBall?.();
}
function getBlackHole() {
  return (kwami.value?.avatar as any)?.getBlackHole?.();
}

// =====================================================
// SYNC COMPOSABLES
// =====================================================

const { syncFromKwami: syncBlobFromKwami, applyToKwami: applyBlobToKwami } = useBlobXyzSync({
  kwami,
  getBlob,
});

const { syncFromKwami: syncOrbitalShardsFromKwami, applyToKwami: applyOrbitalShardsToKwami } = useOrbitalShardsSync({
  kwami,
  getOrbitalShards,
});

const { syncFromKwami: syncStarsGenesisFromKwami, applyToKwami: applyStarsGenesisToKwami } = useStarsGenesisSync({
  kwami,
  getStarsGenesis,
});

const { syncFromKwami: syncCrystalBallFromKwami, applyToKwami: applyCrystalBallToKwami } = useCrystalBallSync({
  kwami,
  getCrystalBall,
});

const { syncFromKwami: syncBlackHoleFromKwami, applyToKwami: applyBlackHoleToKwami } = useBlackHoleSync({
  kwami,
  getBlackHole,
});

// =====================================================
// COMPUTED
// =====================================================

const currentPresets = computed(() => {
  switch (rendererType.value) {
    case 'blob-xyz':
      return blobXyzPresets.value;
    case 'orbital-shards':
      return orbitalShardsPresets.value;
    case 'stars-genesis':
      return starsGenesisPresets.value;
    case 'crystal-ball':
      return crystalBallPresets.value;
    case 'black-hole':
      return blackHolePresets.value;
    default:
      return blobXyzPresets.value;
  }
});

// =====================================================
// SYNC FUNCTIONS
// =====================================================

function syncFromKwami() {
  if (!kwami.value) return;

  syncBlobFromKwami();
  syncOrbitalShardsFromKwami();
  syncStarsGenesisFromKwami();
  syncCrystalBallFromKwami();
  syncBlackHoleFromKwami();

  // Sync renderer type from kwami
  avatarStore.setRendererType(
    kwamiRendererType.value as
      | 'blob-xyz'
      | 'orbital-shards'
      | 'stars-genesis'
      | 'crystal-ball'
      | 'black-hole',
  );
}

/** Apply the current store state to the kwami instance for the specified renderer */
function applyCurrentRendererToKwami(type: string) {
  switch (type) {
    case 'blob-xyz':
      applyBlobToKwami();
      break;
    case 'orbital-shards':
      applyOrbitalShardsToKwami();
      break;
    case 'stars-genesis':
      applyStarsGenesisToKwami();
      break;
    case 'crystal-ball':
      applyCrystalBallToKwami();
      break;
    case 'black-hole':
      applyBlackHoleToKwami();
      break;
  }
}

// =====================================================
// RENDERER TYPE WATCHER
// =====================================================

watch(rendererType, (type) => {
  if (kwamiRendererType.value !== type) {
    switchRenderer(type as any);
  }
});

// =====================================================
// PERSISTENCE WATCHERS
// =====================================================

// Watch all individual stores for changes and save to localStorage
watch(
  () => [
    blobStore.skin,
    blobStore.shape,
    blobStore.animation,
    blobStore.clickEvents,
    blobStore.cursorTouch,
    blobStore.audio,
  ],
  () => avatarStore.saveSettings(),
  { deep: true }
);

watch(
  () => [
    orbitalShardsStore.appearance,
    orbitalShardsStore.colors,
    orbitalShardsStore.glow,
    orbitalShardsStore.animation,
    orbitalShardsStore.audio,
    orbitalShardsStore.clickEvents,
    orbitalShardsStore.cursorTouch,
  ],
  () => avatarStore.saveSettings(),
  { deep: true }
);

watch(
  () => [
    starsGenesisStore.formation,
    starsGenesisStore.visual,
    starsGenesisStore.transform,
    starsGenesisStore.physics,
    starsGenesisStore.animation,
    starsGenesisStore.audio,
    starsGenesisStore.clickEvents,
    starsGenesisStore.cursorTouch,
  ],
  () => avatarStore.saveSettings(),
  { deep: true }
);

watch(
  () => [
    crystalBallStore.style,
    crystalBallStore.colors,
    crystalBallStore.volume,
    crystalBallStore.animation,
    crystalBallStore.surface,
    crystalBallStore.audio,
    crystalBallStore.clickEvents,
    crystalBallStore.cursorTouch,
  ],
  () => avatarStore.saveSettings(),
  { deep: true }
);

watch(
  () => [
    blackHoleStore.colorScheme,
    blackHoleStore.core,
    blackHoleStore.disk,
    blackHoleStore.colors,
    blackHoleStore.stars,
    blackHoleStore.animation,
    blackHoleStore.effects,
    blackHoleStore.audio,
    blackHoleStore.clickEvents,
    blackHoleStore.cursorTouch,
    blackHoleStore.scale,
    blackHoleStore.cameraZoom,
  ],
  () => avatarStore.saveSettings(),
  { deep: true }
);

// Save renderer type changes
watch(rendererType, () => avatarStore.saveSettings());

// =====================================================
// ACTIONS
// =====================================================

function handleSwitchRenderer(
  type: 'blob-xyz' | 'orbital-shards' | 'stars-genesis' | 'crystal-ball' | 'black-hole',
) {
  avatarStore.setRendererType(type);
  switchRenderer(type as any);
  // Apply saved config immediately after switch to avoid showing default state
  applyCurrentRendererToKwami(type);
}

function handleRandomize() {
  kwami.value?.avatar.randomize();
  syncFromKwami();
}

function handleReset() {
  // Reset store state
  avatarStore.reset();
  blobStore.resetAll();
  orbitalShardsStore.resetAll();
  starsGenesisStore.resetAll();
  crystalBallStore.resetAll();
  blackHoleStore.resetAll();

  // Apply defaults to kwami instance using sync composables
  switch (rendererType.value) {
    case 'blob-xyz':
      applyBlobToKwami();
      break;
    case 'orbital-shards':
      applyOrbitalShardsToKwami();
      break;
    case 'stars-genesis':
      applyStarsGenesisToKwami();
      break;
    case 'crystal-ball':
      applyCrystalBallToKwami();
      break;
    case 'black-hole':
      applyBlackHoleToKwami();
      break;
  }
}

function handleApplyPreset(presetId: string) {
  const success = avatarStore.applyPreset(presetId);
  if (success) {
    // Switch renderer if needed
    if (kwamiRendererType.value !== rendererType.value) {
      switchRenderer(rendererType.value as any);
    }

    // Apply preset to kwami instance using sync composables
    switch (rendererType.value) {
      case 'blob-xyz':
        applyBlobToKwami();
        break;
      case 'orbital-shards':
        applyOrbitalShardsToKwami();
        break;
      case 'stars-genesis':
        applyStarsGenesisToKwami();
        break;
      case 'crystal-ball':
        applyCrystalBallToKwami();
        break;
      case 'black-hole':
        applyBlackHoleToKwami();
        break;
    }
  }
}

// =====================================================
// EVENT HANDLERS
// =====================================================

function onStateChanged(e: Event) {
  avatarStore.setActiveState((e as CustomEvent).detail as AvatarState);
}
function onRandomized() {
  // After randomize, sync the new state from kwami to store
  syncFromKwami();
  avatarStore.saveSettings();
}
function onRendererChanged() {
  // When renderer changes externally (e.g., via interaction or API),
  // apply the persisted store state to kwami
  // The handleSwitchRenderer already applies immediately for UI-triggered switches,
  // but this catches other renderer change sources
  applyCurrentRendererToKwami(rendererType.value);
}

// =====================================================
// LIFECYCLE
// =====================================================

onMounted(() => {
  // If settings were loaded from localStorage, apply store state to kwami
  // Otherwise sync from kwami (first time use)
  if (avatarStore.isInitialized) {
    // Switch to the saved renderer type if different
    if (kwamiRendererType.value !== rendererType.value) {
      switchRenderer(rendererType.value as any);
    }
    // Apply the saved state to kwami
    applyCurrentRendererToKwami(rendererType.value);
  } else {
    syncFromKwami();
  }

  window.addEventListener('kwami:stateChanged', onStateChanged);
  window.addEventListener('kwami:randomized', onRandomized);
  window.addEventListener('kwami:rendererChanged', onRendererChanged);
});

onUnmounted(() => {
  window.removeEventListener('kwami:stateChanged', onStateChanged);
  window.removeEventListener('kwami:randomized', onRandomized);
  window.removeEventListener('kwami:rendererChanged', onRendererChanged);
});
</script>

<template>
  <BasePanel icon="ph:ghost-duotone" title="3D Avatar">
    <!-- Avatar Type Selector -->
    <PanelSection title="Avatar Type" icon="ph:swap-duotone" collapsible>
      <p class="section-desc">Choose the visual style for your avatar</p>
      <div class="renderer-selector">
        <label class="renderer-option" :class="{ active: rendererType === 'blob-xyz' }">
          <input
            type="radio"
            name="renderer"
            value="blob-xyz"
            :checked="rendererType === 'blob-xyz'"
            @change="handleSwitchRenderer('blob-xyz')"
          />
          <iconify-icon icon="ph:circle-wavy-duotone" class="renderer-icon"></iconify-icon>
          <div class="renderer-content">
            <span class="renderer-label">Blob XYZ</span>
            <span class="renderer-desc">Organic morphing shape</span>
          </div>
        </label>
        <label class="renderer-option" :class="{ active: rendererType === 'orbital-shards' }">
          <input
            type="radio"
            name="renderer"
            value="orbital-shards"
            :checked="rendererType === 'orbital-shards'"
            @change="handleSwitchRenderer('orbital-shards')"
          />
          <iconify-icon icon="ph:atom-duotone" class="renderer-icon"></iconify-icon>
          <div class="renderer-content">
            <span class="renderer-label">Orbital Shards</span>
            <span class="renderer-desc">Floating fragments in orbit</span>
          </div>
        </label>
        <label class="renderer-option" :class="{ active: rendererType === 'stars-genesis' }">
          <input
            type="radio"
            name="renderer"
            value="stars-genesis"
            :checked="rendererType === 'stars-genesis'"
            @change="handleSwitchRenderer('stars-genesis')"
          />
          <iconify-icon icon="ph:shooting-star-duotone" class="renderer-icon"></iconify-icon>
          <div class="renderer-content">
            <span class="renderer-label">Stars Genesis</span>
            <span class="renderer-desc">Cosmic particle field</span>
          </div>
        </label>
        <label class="renderer-option" :class="{ active: rendererType === 'crystal-ball' }">
          <input
            type="radio"
            name="renderer"
            value="crystal-ball"
            :checked="rendererType === 'crystal-ball'"
            @change="handleSwitchRenderer('crystal-ball')"
          />
          <iconify-icon icon="ph:planet-duotone" class="renderer-icon"></iconify-icon>
          <div class="renderer-content">
            <span class="renderer-label">Crystal Ball</span>
            <span class="renderer-desc">Mystical glowing sphere</span>
          </div>
        </label>
        <label class="renderer-option" :class="{ active: rendererType === 'black-hole' }">
          <input
            type="radio"
            name="renderer"
            value="black-hole"
            :checked="rendererType === 'black-hole'"
            @change="handleSwitchRenderer('black-hole')"
          />
          <iconify-icon icon="ph:circle-dashed-duotone" class="renderer-icon"></iconify-icon>
          <div class="renderer-content">
            <span class="renderer-label">Black Hole</span>
            <span class="renderer-desc">Gravitational void effect</span>
          </div>
        </label>
      </div>
    </PanelSection>

    <!-- Presets -->
    <PanelSection title="Quick Presets" icon="ph:magic-wand-duotone" collapsible>
      <p class="section-desc">Apply pre-configured looks or randomize</p>
      <div class="presets-grid">
        <button
          v-for="preset in currentPresets"
          :key="preset.id"
          class="preset-btn"
          @click="handleApplyPreset(preset.id)"
          :title="preset.name"
        >
          <iconify-icon :icon="preset.icon" class="preset-icon"></iconify-icon>
          <span class="preset-name">{{ preset.name }}</span>
        </button>
      </div>
      <div class="preset-actions">
        <button
          class="action-btn randomize"
          @click="handleRandomize"
          title="Randomize all settings"
        >
          <iconify-icon icon="ph:dice-five-duotone"></iconify-icon>
          <span>Randomize</span>
        </button>
        <button class="action-btn reset" @click="handleReset" title="Reset to defaults">
          <iconify-icon icon="ph:arrow-counter-clockwise-duotone"></iconify-icon>
          <span>Reset</span>
        </button>
      </div>
    </PanelSection>

    <!-- Sub-components -->
    <BlobXyzSettings v-if="rendererType === 'blob-xyz'" />
    <OrbitalShardsSettings v-if="rendererType === 'orbital-shards'" />
    <StarsGenesisSettings v-if="rendererType === 'stars-genesis'" />
    <CrystalBallSettings v-if="rendererType === 'crystal-ball'" />
    <BlackHoleSettings v-if="rendererType === 'black-hole'" />
  </BasePanel>
</template>

<style scoped>
/* Renderer Selector */
.renderer-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.renderer-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.renderer-option:hover {
  background: var(--surface-2);
  transform: translateY(-2px);
}

.renderer-option.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  box-shadow: 0 4px 20px var(--accent-glow);
}

.renderer-option input {
  display: none;
}

.renderer-icon {
  font-size: 26px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.renderer-option.active .renderer-icon {
  color: var(--accent-primary);
}

.renderer-option:hover .renderer-icon {
  color: var(--accent-primary);
}

.renderer-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.renderer-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.renderer-option.active .renderer-label {
  color: var(--text-primary);
}

.renderer-option:hover .renderer-label {
  color: var(--text-primary);
}

.renderer-desc {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.renderer-option.active .renderer-desc {
  color: var(--text-secondary);
}

/* Presets Grid */
.presets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  background: var(--surface-2);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.preset-btn:active {
  transform: translateY(0);
}

.preset-icon {
  font-size: 22px;
  color: var(--accent-primary);
}

.preset-name {
  font-size: 9px;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.2;
}

.preset-btn:hover .preset-name {
  color: var(--text-primary);
}

/* Preset Actions */
.preset-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn iconify-icon {
  font-size: 16px;
}

.action-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.action-btn.randomize:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.action-btn.reset:hover {
  border-color: var(--warning);
  color: var(--warning);
}

/* Section Description */
.section-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0 0 12px 0;
  line-height: 1.4;
}
</style>
