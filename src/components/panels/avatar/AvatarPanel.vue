<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import { useAvatarStore, type CrystalFormation, type AvatarState } from '@/stores/avatar';
import { useBlobStore, type SkinType } from '@/stores/avatar.blob';
import BasePanel from '@/components/ui/BasePanel.vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BlobSettings from './BlobSettings.vue';
import CrystalSettings from './CrystalSettings.vue';
import ParticlesSettings from './ParticlesSettings.vue';

const { kwami, rendererType: kwamiRendererType, switchRenderer } = useKwami();
const avatarStore = useAvatarStore();
const blobStore = useBlobStore();

// Use store state
const { crystal, particles, rendererType, blobPresets, crystalPresets, particlesPresets } = storeToRefs(avatarStore);
const { skin, shape, animation, cursorTouch, audio } = storeToRefs(blobStore);

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
    blobStore.syncFromKwami(blobInstance);
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

// =====================================================
// Sync Store to Kwami - Blob watchers (new structure)
// =====================================================

// SKIN watchers
watch(() => skin.value.type, (v) => kwami.value?.avatar.setSkin({ skin: 'tricolor', subtype: v as SkinType }));
watch(() => skin.value.colors, (v) => getBlob()?.setColors(v.x, v.y, v.z), { deep: true });
watch(() => skin.value.opacity, (v) => kwami.value?.avatar.setOpacity(v));
watch(() => skin.value.shininess, (v) => kwami.value?.avatar.setShininess(v));
watch(() => skin.value.lightIntensity, (v) => getBlob()?.setLightIntensity(v));
watch(() => skin.value.wireframe, (v) => kwami.value?.avatar.setWireframe(v));
watch(() => skin.value.glassMode, (v) => getBlob()?.setGlassMode(v));
watch(() => skin.value.resolution, (v) => getBlob()?.setResolution(v));

// SHAPE watchers
watch(() => shape.value.scale, (v) => kwami.value?.avatar.setScale(v));
watch(() => shape.value.spikes, (v) => getBlob()?.setSpikes(v.x, v.y, v.z), { deep: true });
watch(() => shape.value.amplitude, (v) => getBlob()?.setAmplitude(v.x, v.y, v.z), { deep: true });
// Position (was startRotation) - convert degrees to radians
watch(
  () => shape.value.position,
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

// ANIMATION watchers
watch(() => animation.value.time, (v) => getBlob()?.setTime(v.x, v.y, v.z), { deep: true });
watch(() => animation.value.rotation, (v) => kwami.value?.avatar.setRotation(v.x, v.y, v.z), { deep: true });
watch(() => animation.value.breathing, (v) => {
  const b = getBlob();
  if (b && b.audioEffects) b.audioEffects.breathing = v;
});

// CURSOR & TOUCH watchers
watch(() => cursorTouch.value.touch.strength, (v) => getBlob()?.setTouchStrength(v));
watch(() => cursorTouch.value.touch.duration, (v) => getBlob()?.setTouchDuration(v));
watch(() => cursorTouch.value.touch.maxPoints, (v) => getBlob()?.setMaxTouchPoints(v));

// AUDIO watchers
watch(
  () => audio.value,
  (a) => {
    const b = getBlob();
    if (!b || !b.audioEffects) return;
    
    b.audioEffects.enabled = a.enabled;
    b.audioEffects.reactivity = a.reactivity;
    b.audioEffects.sensitivity = a.sensitivity;
    b.audioEffects.responseSpeed = a.responseSpeed;
    b.audioEffects.transientBoost = a.transientBoost;
    b.audioEffects.bassSpike = a.frequencySpikes.bass;
    b.audioEffects.midSpike = a.frequencySpikes.mid;
    b.audioEffects.highSpike = a.frequencySpikes.high;
    b.audioEffects.timeEnabled = a.timeModulation.enabled;
    b.audioEffects.midTime = a.timeModulation.mid;
    b.audioEffects.highTime = a.timeModulation.high;
    b.audioEffects.ultraTime = a.timeModulation.ultra;
  },
  { deep: true }
);

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
    if (c) {
      // Crystal audio effects are set directly on properties
      Object.assign(c.audioEffects, v);
    }
  },
  { deep: true }
);
// Crystal transition watchers
watch(() => crystal.value.transitionSpeed, (v) => {
  const c = getCrystal();
  if (c) c.transitionSpeed = v;
});
watch(() => crystal.value.thinkingDuration, (v) => {
  const c = getCrystal();
  if (c) c.thinkingDuration = v;
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

function handleRandomize() {
  kwami.value?.avatar.randomize();
  syncFromKwami();
}

function handleReset() {
  // Reset store state
  avatarStore.reset();
  blobStore.resetAll();
  
  // Apply defaults to kwami instance
  if (rendererType.value === 'blob') {
    const b = getBlob();
    if (b && kwami.value) {
      // Skin
      kwami.value.avatar.setColors(skin.value.colors.x, skin.value.colors.y, skin.value.colors.z);
      kwami.value.avatar.setOpacity(skin.value.opacity);
      kwami.value.avatar.setShininess(skin.value.shininess);
      kwami.value.avatar.setWireframe(skin.value.wireframe);
      b.setLightIntensity(skin.value.lightIntensity);
      b.setResolution(skin.value.resolution);
      // Shape
      kwami.value.avatar.setScale(shape.value.scale);
      b.setSpikes(shape.value.spikes.x, shape.value.spikes.y, shape.value.spikes.z);
      b.setAmplitude(shape.value.amplitude.x, shape.value.amplitude.y, shape.value.amplitude.z);
      // Animation
      b.setTime(animation.value.time.x, animation.value.time.y, animation.value.time.z);
      kwami.value.avatar.setRotation(animation.value.rotation.x, animation.value.rotation.y, animation.value.rotation.z);
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
    // Switch renderer if needed
    if (kwamiRendererType.value !== rendererType.value) {
      switchRenderer(rendererType.value);
    }
    
    // Manually sync blob preset to kwami instance (watchers may not fire for all nested changes)
    if (rendererType.value === 'blob') {
      const b = getBlob();
      if (b && kwami.value) {
        // Skin
        kwami.value.avatar.setSkin({ skin: 'tricolor', subtype: skin.value.type as SkinType });
        b.setColors(skin.value.colors.x, skin.value.colors.y, skin.value.colors.z);
        kwami.value.avatar.setOpacity(skin.value.opacity);
        kwami.value.avatar.setShininess(skin.value.shininess);
        b.setLightIntensity(skin.value.lightIntensity);
        kwami.value.avatar.setWireframe(skin.value.wireframe);
        b.setGlassMode(skin.value.glassMode);
        b.setResolution(skin.value.resolution);
        
        // Shape
        kwami.value.avatar.setScale(shape.value.scale);
        b.setSpikes(shape.value.spikes.x, shape.value.spikes.y, shape.value.spikes.z);
        b.setAmplitude(shape.value.amplitude.x, shape.value.amplitude.y, shape.value.amplitude.z);
        const mesh = b.getMesh();
        if (mesh) {
          const degToRad = (deg: number) => (deg * Math.PI) / 180;
          mesh.rotation.x = degToRad(shape.value.position.x);
          mesh.rotation.y = degToRad(shape.value.position.y);
          mesh.rotation.z = degToRad(shape.value.position.z);
        }
        
        // Animation
        b.setTime(animation.value.time.x, animation.value.time.y, animation.value.time.z);
        kwami.value.avatar.setRotation(animation.value.rotation.x, animation.value.rotation.y, animation.value.rotation.z);
        if (b.audioEffects) {
          b.audioEffects.breathing = animation.value.breathing;
        }
        
        // Touch
        b.setTouchStrength(cursorTouch.value.touch.strength);
        b.setTouchDuration(cursorTouch.value.touch.duration);
        b.setMaxTouchPoints(cursorTouch.value.touch.maxPoints);
        
        // Audio
        if (b.audioEffects) {
          b.audioEffects.enabled = audio.value.enabled;
          b.audioEffects.reactivity = audio.value.reactivity;
          b.audioEffects.sensitivity = audio.value.sensitivity;
          b.audioEffects.responseSpeed = audio.value.responseSpeed;
          b.audioEffects.transientBoost = audio.value.transientBoost;
          b.audioEffects.bassSpike = audio.value.frequencySpikes.bass;
          b.audioEffects.midSpike = audio.value.frequencySpikes.mid;
          b.audioEffects.highSpike = audio.value.frequencySpikes.high;
          b.audioEffects.timeEnabled = audio.value.timeModulation.enabled;
          b.audioEffects.midTime = audio.value.timeModulation.mid;
          b.audioEffects.highTime = audio.value.timeModulation.high;
          b.audioEffects.ultraTime = audio.value.timeModulation.ultra;
        }
      }
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
  <BasePanel icon="ph:ghost-duotone" title="3D Avatar">
    <!-- Avatar Type Selector -->
    <PanelSection title="Avatar Type" icon="ph:swap-duotone" collapsible>
      <p class="section-desc">Choose the visual style for your avatar</p>
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
    <PanelSection title="Quick Presets" icon="ph:magic-wand-duotone" collapsible>
      <p class="section-desc">Apply pre-configured looks or randomize</p>
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
      <div class="preset-actions">
        <button class="action-btn randomize" @click="handleRandomize" title="Randomize all settings">
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
    <BlobSettings v-if="rendererType === 'blob'" />
    <CrystalSettings v-if="rendererType === 'crystal'" v-model:state="crystal" />
    <ParticlesSettings v-if="rendererType === 'particles'" v-model:state="particles" />
  </BasePanel>
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
