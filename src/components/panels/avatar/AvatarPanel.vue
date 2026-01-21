<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useKwami } from '@/composables/useKwami';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BlobSettings from './BlobSettings.vue';
import CrystalSettings from './CrystalSettings.vue';

const { kwami, rendererType, switchRenderer } = useKwami();

// Types
type SkinSubtype = 'poles' | 'donut' | 'vintage';
type CrystalFormation = 'constellation' | 'helix' | 'vortex';

interface BlobPanelState {
  colors: { x: string; y: string; z: string };
  spikes: { x: number; y: number; z: number };
  amplitude: { x: number; y: number; z: number };
  time: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  opacity: number;
  shininess: number;
  lightIntensity: number;
  wireframe: boolean;
  skin: string;
  resolution: number;
  touchStrength: number;
  touchDuration: number;
  maxTouchPoints: number;
  transitionSpeed: number;
  thinkingDuration: number;
}

interface CrystalPanelState {
  formation: string;
  colors: { primary: string; secondary: string; accent: string };
  coreColors: { inner: string; outer: string };
  glowIntensity: number;
  shardCount: number;
  scale: number;
  rotation: { x: number; y: number; z: number };
  audioEffects: {
    reactivity: number;
    bassOrbitBoost: number;
    midRotationBoost: number;
    highGlowBoost: number;
    enabled: boolean;
  };
  transitionSpeed: number;
  thinkingDuration: number;
}

function getDefaultBlobState(): BlobPanelState {
  return {
    colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
    spikes: { x: 0.2, y: 0.2, z: 0.2 },
    amplitude: { x: 0.8, y: 0.8, z: 0.8 },
    time: { x: 1, y: 1, z: 1 },
    rotation: { x: 0.002, y: 0.003, z: 0.001 },
    scale: 3.2,
    opacity: 1,
    shininess: 50,
    lightIntensity: 0,
    wireframe: false,
    skin: 'poles',
    resolution: 180,
    touchStrength: 1,
    touchDuration: 1100,
    maxTouchPoints: 5,
    transitionSpeed: 0.05,
    thinkingDuration: 10000,
  };
}

function getDefaultCrystalState(): CrystalPanelState {
  return {
    formation: 'constellation',
    colors: { primary: '#00e5ff', secondary: '#7c4dff', accent: '#ff4081' },
    coreColors: { inner: '#ffffff', outer: '#00ffff' },
    glowIntensity: 1.2,
    shardCount: 24,
    scale: 1,
    rotation: { x: 0, y: 0.002, z: 0 },
    audioEffects: {
      reactivity: 1.5,
      bassOrbitBoost: 0.4,
      midRotationBoost: 0.6,
      highGlowBoost: 0.8,
      enabled: true,
    },
    transitionSpeed: 0.05,
    thinkingDuration: 10000,
  };
}

const blobState = reactive<BlobPanelState>(getDefaultBlobState());
const crystalState = reactive<CrystalPanelState>(getDefaultCrystalState());
const activeState = ref<'idle' | 'listening' | 'thinking'>('idle');

// Helpers
function getBlob() {
  return kwami.value?.avatar.getBlob();
}
function getCrystal() {
  return kwami.value?.avatar.getCrystal();
}

// Sync
function syncFromKwami() {
  if (!kwami.value) return;
  const blob = getBlob();
  if (blob) {
    const c = blob.getColors();
    blobState.colors = { x: c.x, y: c.y, z: c.z };
    blobState.spikes = blob.getSpikes();
    blobState.amplitude = blob.getAmplitude();
    blobState.time = blob.getTime();
    blobState.rotation = blob.getRotation();
    blobState.scale = blob.getScale();
    blobState.opacity = blob.getOpacity();
    blobState.shininess = blob.getShininess();
    blobState.lightIntensity = blob.lightIntensity;
    blobState.wireframe = blob.getWireframe();
    blobState.skin = blob.getCurrentSkinSubtype() as SkinSubtype;
  }

  const crystal = getCrystal();
  if (crystal) {
    crystalState.formation = crystal.getFormation().formation as CrystalFormation;
    crystalState.colors = crystal.getColors();
    // crystalState.coreColors = crystal.getCoreColors()
    crystalState.scale = crystal.getScale();
    crystalState.rotation = crystal.getRotation();
    // crystalState.glowIntensity = crystal.getGlowIntensity()
    // crystalState.shardCount = crystal.getShardCount()
  }
}

// Watchers: Sync changes from state to Kwami
watch(
  () => blobState.colors,
  (v) => getBlob()?.setColors(v.x, v.y, v.z),
  { deep: true },
);
watch(
  () => blobState.spikes,
  (v) => getBlob()?.setSpikes(v.x, v.y, v.z),
  { deep: true },
);
watch(
  () => blobState.amplitude,
  (v) => getBlob()?.setAmplitude(v.x, v.y, v.z),
  { deep: true },
);
watch(
  () => blobState.time,
  (v) => getBlob()?.setTime(v.x, v.y, v.z),
  { deep: true },
);
watch(
  () => blobState.rotation,
  (v) => kwami.value?.avatar.setRotation(v.x, v.y, v.z),
  { deep: true },
);
watch(
  () => blobState.scale,
  (v) => kwami.value?.avatar.setScale(v),
);
watch(
  () => blobState.opacity,
  (v) => kwami.value?.avatar.setOpacity(v),
);
watch(
  () => blobState.shininess,
  (v) => kwami.value?.avatar.setShininess(v),
);
watch(
  () => blobState.lightIntensity,
  (v) => getBlob()?.setLightIntensity(v),
);
watch(
  () => blobState.wireframe,
  (v) => kwami.value?.avatar.setWireframe(v),
);
watch(
  () => blobState.skin,
  (v) => kwami.value?.avatar.setSkin({ skin: 'tricolor', subtype: v as SkinSubtype }),
);

watch(
  () => crystalState.formation,
  (v) => getCrystal()?.setFormation({ formation: v as CrystalFormation }),
);
watch(
  () => crystalState.colors,
  (v) => getCrystal()?.setColors(v.primary, v.secondary, v.accent),
  { deep: true },
);
watch(
  () => crystalState.coreColors,
  (v) => getCrystal()?.setCoreColors(v.inner, v.outer),
  { deep: true },
);
watch(
  () => crystalState.glowIntensity,
  (v) => getCrystal()?.setGlowIntensity(v),
);
watch(
  () => crystalState.shardCount,
  (v) => getCrystal()?.setShardCount(v),
);
watch(
  () => crystalState.scale,
  (v) => getCrystal()?.setScale(v),
);
watch(
  () => crystalState.rotation,
  (v) => getCrystal()?.setRotation(v.x, v.y, v.z),
  { deep: true },
);

function handleSwitchRenderer(type: 'blob' | 'crystal') {
  switchRenderer(type);
}
function handleStateChange(state: 'idle' | 'listening' | 'thinking') {
  activeState.value = state;
  kwami.value?.avatar.setState(state);
}
function handleRandomize() {
  kwami.value?.avatar.randomize();
  syncFromKwami();
}
function handleExport() {
  kwami.value?.avatar.exportGLTF();
}
function handleReset() {
  if (rendererType.value === 'blob') Object.assign(blobState, getDefaultBlobState());
  else Object.assign(crystalState, getDefaultCrystalState());
}

onMounted(() => {
  syncFromKwami();
  window.addEventListener(
    'kwami:stateChanged',
    ((e: CustomEvent) => (activeState.value = e.detail)) as EventListener,
  );
  window.addEventListener('kwami:randomized', () => syncFromKwami());
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:ghost-duotone" class="panel-icon"></iconify-icon>
      <h2>Avatar</h2>
    </div>

    <div class="panel-body">
      <!-- Renderer Selector -->
      <PanelSection title="Renderer">
        <div class="renderer-selector">
          <label class="renderer-option" :class="{ active: rendererType === 'blob' }">
            <input
              type="radio"
              name="renderer"
              value="blob"
              :checked="rendererType === 'blob'"
              @change="handleSwitchRenderer('blob')"
            />
            <iconify-icon icon="ph:circle-wavy-duotone" class="renderer-icon"></iconify-icon>
            <span class="renderer-label">Blob</span>
          </label>
          <label class="renderer-option" :class="{ active: rendererType === 'crystal' }">
            <input
              type="radio"
              name="renderer"
              value="crystal"
              :checked="rendererType === 'crystal'"
              @change="handleSwitchRenderer('crystal')"
            />
            <iconify-icon icon="ph:diamond-duotone" class="renderer-icon"></iconify-icon>
            <span class="renderer-label">Crystal</span>
          </label>
        </div>
      </PanelSection>

      <!-- Sub-components -->
      <BlobSettings v-if="rendererType === 'blob'" :state="blobState" />
      <CrystalSettings v-if="rendererType === 'crystal'" :state="crystalState" />

      <PanelSection title="State">
        <div class="state-buttons">
          <BaseButton
            :variant="activeState === 'idle' ? 'primary' : 'secondary'"
            @click="handleStateChange('idle')"
            size="sm"
            icon="ph:moon-stars-duotone"
            >Idle</BaseButton
          >
          <BaseButton
            :variant="activeState === 'listening' ? 'primary' : 'secondary'"
            @click="handleStateChange('listening')"
            size="sm"
            icon="ph:microphone-duotone"
            >Listen</BaseButton
          >
          <BaseButton
            :variant="activeState === 'thinking' ? 'primary' : 'secondary'"
            @click="handleStateChange('thinking')"
            size="sm"
            icon="ph:brain-duotone"
            >Think</BaseButton
          >
        </div>
      </PanelSection>

      <PanelSection title="Actions">
        <div class="action-buttons">
          <BaseButton variant="primary" @click="handleRandomize" icon="ph:dice-five-duotone" block
            >Randomize</BaseButton
          >
          <div class="row-2" style="gap: 8px; margin-top: 8px">
            <BaseButton variant="secondary" @click="handleExport" icon="ph:cube-duotone" block
              >Export GLTF</BaseButton
            >
            <BaseButton
              variant="secondary"
              @click="handleReset"
              icon="ph:arrow-counter-clockwise-duotone"
              block
              >Reset</BaseButton
            >
          </div>
        </div>
      </PanelSection>
    </div>
  </div>
</template>

<style scoped>
/* Renderer Selector */
.renderer-selector {
  display: flex;
  gap: 8px;
}

.renderer-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
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
  font-size: 28px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.renderer-option.active .renderer-icon {
  color: var(--accent-primary);
}

.renderer-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.renderer-option.active .renderer-label {
  color: var(--text-primary);
}

/* State Buttons */
.state-buttons {
  display: flex;
  gap: 6px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row-2 {
  display: flex;
  gap: 8px;
}

.row-2 > * {
  flex: 1;
}
</style>
