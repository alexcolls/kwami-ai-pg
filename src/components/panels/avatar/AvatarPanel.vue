<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import { useAvatarStore, type SkinSubtype, type CrystalFormation, type AvatarState } from '@/stores/avatar';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BlobSettings from './BlobSettings.vue';
import CrystalSettings from './CrystalSettings.vue';
import ParticlesSettings from './ParticlesSettings.vue';

const { kwami, rendererType: kwamiRendererType, switchRenderer } = useKwami();
const avatarStore = useAvatarStore();

// Use store state
const { blob, crystal, particles, activeState, rendererType, blobPresets, crystalPresets, particlesPresets } = storeToRefs(avatarStore);

// Helpers
function getBlob() {
  return kwami.value?.avatar.getBlob();
}
function getCrystal() {
  return kwami.value?.avatar.getCrystal();
}
function getParticles() {
  return kwami.value?.avatar.getParticles();
}

// Sync from Kwami to Store
function syncFromKwami() {
  if (!kwami.value) return;
  
  const blobInstance = getBlob();
  if (blobInstance) {
    avatarStore.syncBlobFromExternal(blobInstance);
  }

  const crystalInstance = getCrystal();
  if (crystalInstance) {
    avatarStore.syncCrystalFromExternal(crystalInstance);
  }

  const particlesInstance = getParticles();
  if (particlesInstance) {
    avatarStore.syncParticlesFromExternal(particlesInstance);
  }
  
  // Sync renderer type from kwami
  avatarStore.setRendererType(kwamiRendererType.value as 'blob' | 'crystal' | 'particles');
}

// Sync Store to Kwami - Blob watchers
watch(
  () => blob.value.colors,
  (v) => getBlob()?.setColors(v.x, v.y, v.z),
  { deep: true }
);
watch(
  () => blob.value.spikes,
  (v) => getBlob()?.setSpikes(v.x, v.y, v.z),
  { deep: true }
);
watch(
  () => blob.value.amplitude,
  (v) => getBlob()?.setAmplitude(v.x, v.y, v.z),
  { deep: true }
);
watch(
  () => blob.value.time,
  (v) => getBlob()?.setTime(v.x, v.y, v.z),
  { deep: true }
);
watch(
  () => blob.value.rotation,
  (v) => kwami.value?.avatar.setRotation(v.x, v.y, v.z),
  { deep: true }
);
// Apply starting rotation position (degrees to radians)
watch(
  () => blob.value.startRotation,
  (v) => {
    const b = getBlob();
    if (b) {
      const mesh = b.getMesh();
      if (mesh) {
        const degToRad = (deg: number) => (deg * Math.PI) / 180;
        mesh.rotation.x = degToRad(v.x);
        mesh.rotation.y = degToRad(v.y);
        mesh.rotation.z = degToRad(v.z);
      }
    }
  },
  { deep: true }
);
watch(() => blob.value.scale, (v) => kwami.value?.avatar.setScale(v));
watch(() => blob.value.opacity, (v) => kwami.value?.avatar.setOpacity(v));
watch(() => blob.value.shininess, (v) => kwami.value?.avatar.setShininess(v));
watch(() => blob.value.lightIntensity, (v) => getBlob()?.setLightIntensity(v));
watch(() => blob.value.wireframe, (v) => kwami.value?.avatar.setWireframe(v));
watch(
  () => blob.value.skin,
  (v) => kwami.value?.avatar.setSkin({ skin: 'tricolor', subtype: v as SkinSubtype })
);
watch(() => blob.value.resolution, (v) => getBlob()?.setResolution(v));
watch(() => blob.value.touchStrength, (v) => {
  const b = getBlob();
  if (b) (b as { touchStrength: number }).touchStrength = v;
});
watch(() => blob.value.touchDuration, (v) => {
  const b = getBlob();
  if (b) (b as { touchDuration: number }).touchDuration = v;
});
watch(() => blob.value.maxTouchPoints, (v) => {
  const b = getBlob();
  if (b) (b as { maxTouchPoints: number }).maxTouchPoints = v;
});
watch(() => blob.value.transitionSpeed, (v) => {
  const b = getBlob();
  if (b) (b as { transitionSpeed: number }).transitionSpeed = v;
});
watch(() => blob.value.thinkingDuration, (v) => {
  const b = getBlob();
  if (b) (b as { thinkingDuration: number }).thinkingDuration = v;
});

// Sync Store to Kwami - Crystal watchers
watch(
  () => crystal.value.formation,
  (v) => getCrystal()?.setFormation({ formation: v as CrystalFormation })
);
watch(
  () => crystal.value.colors,
  (v) => getCrystal()?.setColors(v.primary, v.secondary, v.accent),
  { deep: true }
);
watch(
  () => crystal.value.coreColors,
  (v) => getCrystal()?.setCoreColors(v.inner, v.outer),
  { deep: true }
);
watch(() => crystal.value.glowIntensity, (v) => getCrystal()?.setGlowIntensity(v));
watch(() => crystal.value.shardCount, (v) => getCrystal()?.setShardCount(v));
watch(() => crystal.value.scale, (v) => getCrystal()?.setScale(v));
watch(
  () => crystal.value.rotation,
  (v) => getCrystal()?.setRotation(v.x, v.y, v.z),
  { deep: true }
);
// Crystal audio effects watchers
watch(
  () => crystal.value.audioEffects,
  (v) => {
    const c = getCrystal();
    if (c && typeof (c as any).setAudioEffects === 'function') {
      (c as any).setAudioEffects(v);
    }
  },
  { deep: true }
);
// Crystal transition watchers
watch(() => crystal.value.transitionSpeed, (v) => {
  const c = getCrystal();
  if (c) (c as { transitionSpeed?: number }).transitionSpeed = v;
});
watch(() => crystal.value.thinkingDuration, (v) => {
  const c = getCrystal();
  if (c) (c as { thinkingDuration?: number }).thinkingDuration = v;
});

// Sync Store to Kwami - Particles watchers
watch(
  () => particles.value.visual,
  (v) => {
    const p = getParticles();
    if (p) {
      p.setColors(v.color, v.glowColor);
      p.setOpacity(v.opacity);
      p.setParticleSize(v.particleSize);
      p.setGlowIntensity(v.glowIntensity);
      p.setSharpness(v.sharpness);
    }
  },
  { deep: true }
);
watch(
  () => particles.value.formation.type,
  (v) => getParticles()?.setFormation(v, true) // true = smooth transition
);
watch(() => particles.value.scale, (v) => getParticles()?.setScale(v));
watch(
  () => particles.value.physics,
  (v) => getParticles()?.setPhysics(v),
  { deep: true }
);
watch(
  () => particles.value.animation,
  (v) => getParticles()?.setAnimation(v),
  { deep: true }
);
watch(
  () => particles.value.audioEffects,
  (v) => getParticles()?.setAudioEffects(v),
  { deep: true }
);

// Sync renderer type changes
watch(rendererType, (type) => {
  if (kwamiRendererType.value !== type) {
    switchRenderer(type);
  }
});

// Actions
function handleSwitchRenderer(type: 'blob' | 'crystal' | 'particles') {
  avatarStore.setRendererType(type);
  switchRenderer(type);
}

function handleStateChange(state: AvatarState) {
  avatarStore.setActiveState(state);
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
  // Reset store state
  avatarStore.reset();
  
  // Apply defaults to kwami instance
  if (rendererType.value === 'blob') {
    const b = getBlob();
    if (b && kwami.value) {
      kwami.value.avatar.setColors(blob.value.colors.x, blob.value.colors.y, blob.value.colors.z);
      kwami.value.avatar.setRotation(blob.value.rotation.x, blob.value.rotation.y, blob.value.rotation.z);
      kwami.value.avatar.setScale(blob.value.scale);
      kwami.value.avatar.setOpacity(blob.value.opacity);
      kwami.value.avatar.setShininess(blob.value.shininess);
      kwami.value.avatar.setWireframe(blob.value.wireframe);
      b.setSpikes(blob.value.spikes.x, blob.value.spikes.y, blob.value.spikes.z);
      b.setAmplitude(blob.value.amplitude.x, blob.value.amplitude.y, blob.value.amplitude.z);
      b.setTime(blob.value.time.x, blob.value.time.y, blob.value.time.z);
      b.setLightIntensity(blob.value.lightIntensity);
      b.setResolution(blob.value.resolution);
    }
  } else if (rendererType.value === 'crystal') {
    const c = getCrystal();
    if (c) {
      c.setFormation({ formation: crystal.value.formation as CrystalFormation });
      c.setColors(crystal.value.colors.primary, crystal.value.colors.secondary, crystal.value.colors.accent);
      c.setCoreColors(crystal.value.coreColors.inner, crystal.value.coreColors.outer);
      c.setGlowIntensity(crystal.value.glowIntensity);
      c.setShardCount(crystal.value.shardCount);
      c.setScale(crystal.value.scale);
      c.setRotation(crystal.value.rotation.x, crystal.value.rotation.y, crystal.value.rotation.z);
    }
  } else if (rendererType.value === 'particles') {
    const p = getParticles();
    if (p) {
      p.setColors(particles.value.visual.color, particles.value.visual.glowColor);
      p.setOpacity(particles.value.visual.opacity);
      p.setParticleSize(particles.value.visual.particleSize);
      p.setGlowIntensity(particles.value.visual.glowIntensity);
      p.setSharpness(particles.value.visual.sharpness);
      p.setScale(particles.value.scale);
      p.setFormation(particles.value.formation.type, false);
      p.setPhysics(particles.value.physics);
      p.setAnimation(particles.value.animation);
      p.setAudioEffects(particles.value.audioEffects);
    }
  }
}

function handleApplyPreset(presetId: string) {
  const success = avatarStore.applyPreset(presetId);
  if (success) {
    // Sync to kwami - watchers will handle most of it
    // But we need to switch renderer if needed
    if (kwamiRendererType.value !== rendererType.value) {
      switchRenderer(rendererType.value);
    }
  }
}

// Event handlers for cleanup
function onStateChanged(e: Event) {
  avatarStore.setActiveState((e as CustomEvent).detail as AvatarState);
}
function onRandomized() {
  syncFromKwami();
}
function onRendererChanged() {
  syncFromKwami();
}

onMounted(() => {
  syncFromKwami();
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
          <label class="renderer-option" :class="{ active: rendererType === 'particles' }">
            <input
              type="radio"
              name="renderer"
              value="particles"
              :checked="rendererType === 'particles'"
              @change="handleSwitchRenderer('particles')"
            />
            <iconify-icon icon="ph:circles-three-plus-duotone" class="renderer-icon"></iconify-icon>
            <span class="renderer-label">Particles</span>
          </label>
        </div>
      </PanelSection>

      <!-- Presets -->
      <PanelSection title="Quick Presets">
        <div class="presets-grid">
          <button
            v-for="preset in (rendererType === 'blob' ? blobPresets : rendererType === 'crystal' ? crystalPresets : particlesPresets)"
            :key="preset.id"
            class="preset-btn"
            @click="handleApplyPreset(preset.id)"
            :title="preset.name"
          >
            <iconify-icon :icon="preset.icon" class="preset-icon"></iconify-icon>
            <span class="preset-name">{{ preset.name }}</span>
          </button>
        </div>
      </PanelSection>

      <!-- Sub-components -->
      <BlobSettings v-if="rendererType === 'blob'" v-model:state="blob" />
      <CrystalSettings v-if="rendererType === 'crystal'" v-model:state="crystal" />
      <ParticlesSettings v-if="rendererType === 'particles'" v-model:state="particles" />

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
          <BaseButton
            :variant="activeState === 'speaking' ? 'primary' : 'secondary'"
            @click="handleStateChange('speaking')"
            size="sm"
            icon="ph:speaker-high-duotone"
            >Speak</BaseButton
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

/* State Buttons */
.state-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
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
