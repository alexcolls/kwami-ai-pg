<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import { useAvatarStore, type AvatarState } from '@/stores/avatar';
import { useBlobStore, type SkinType } from '@/stores/avatar.blob';
import { useCrystalStore, type CrystalFormation } from '@/stores/avatar.crystal';
import { useParticlesStore } from '@/stores/avatar.particles';
import BasePanel from '@/components/ui/BasePanel.vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BlobSettings from './BlobSettings.vue';
import CrystalSettings from './CrystalSettings.vue';
import ParticlesSettings from './ParticlesSettings.vue';

const { kwami, rendererType: kwamiRendererType, switchRenderer } = useKwami();
const avatarStore = useAvatarStore();
const blobStore = useBlobStore();
const crystalStore = useCrystalStore();
const particlesStore = useParticlesStore();

// Use store state
const { rendererType, blobPresets, crystalPresets, particlesPresets } = storeToRefs(avatarStore);
const { skin, shape, animation, cursorTouch, audio } = storeToRefs(blobStore);
const { 
  appearance: crystalAppearance, 
  colors: crystalColors, 
  glow: crystalGlow, 
  animation: crystalAnimation, 
  audio: crystalAudio 
} = storeToRefs(crystalStore);
const { 
  formation: particlesFormation, 
  visual: particlesVisual, 
  transform: particlesTransform, 
  physics: particlesPhysics, 
  animation: particlesAnimation, 
  audio: particlesAudio 
} = storeToRefs(particlesStore);

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
    crystalStore.syncFromKwami(crystalInstance);
  }

  const particlesInstance = getParticles();
  if (particlesInstance) {
    particlesStore.syncFromKwami(particlesInstance);
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

// Sync Store to Kwami - Crystal watchers (new structure)

// APPEARANCE watchers
watch(() => crystalAppearance.value.formation, (v) => getCrystal()?.setFormation({ formation: v as CrystalFormation }));
watch(() => crystalAppearance.value.shardCount, (v) => getCrystal()?.setShardCount(v));
watch(() => crystalAppearance.value.scale, (v) => getCrystal()?.setScale(v));

// COLORS watchers
watch(
  () => ({ primary: crystalColors.value.primary, secondary: crystalColors.value.secondary, accent: crystalColors.value.accent }),
  (v) => getCrystal()?.setColors(v.primary, v.secondary, v.accent),
  { deep: true }
);
watch(
  () => crystalColors.value.core,
  (v) => getCrystal()?.setCoreColors(v.inner, v.outer),
  { deep: true }
);

// GLOW watchers
watch(() => crystalGlow.value.intensity, (v) => getCrystal()?.setGlowIntensity(v));

// ANIMATION watchers
watch(
  () => crystalAnimation.value.rotation,
  (v) => getCrystal()?.setRotation(v.x, v.y, v.z),
  { deep: true }
);

// AUDIO watchers
watch(
  () => crystalAudio.value,
  (v) => {
    const c = getCrystal();
    if (c && c.audioEffects) {
      c.audioEffects.enabled = v.enabled;
      c.audioEffects.reactivity = v.reactivity;
      c.audioEffects.smoothing = v.smoothing;
      c.audioEffects.bassOrbitBoost = v.frequencyBoosts.bass;
      c.audioEffects.midRotationBoost = v.frequencyBoosts.mid;
      c.audioEffects.highGlowBoost = v.frequencyBoosts.high;
    }
  },
  { deep: true }
);

// Sync Store to Kwami - Particles watchers (new structure)

// FORMATION watchers
watch(() => particlesFormation.value.type, (v) => getParticles()?.setFormation(v, true));

// VISUAL watchers
watch(
  () => particlesVisual.value,
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

// TRANSFORM watchers
watch(() => particlesTransform.value.scale, (v) => getParticles()?.setScale(v));

// PHYSICS watchers
watch(
  () => particlesPhysics.value,
  (v) => getParticles()?.setPhysics(v),
  { deep: true }
);

// ANIMATION watchers
watch(
  () => particlesAnimation.value,
  (v) => getParticles()?.setAnimation(v),
  { deep: true }
);

// AUDIO watchers
watch(
  () => particlesAudio.value,
  (v) => {
    const p = getParticles();
    if (p) {
      p.setAudioEffects({
        enabled: v.enabled,
        reactivity: v.reactivity,
        smoothing: v.smoothing,
        scalePulse: v.scalePulse,
        movementIntensity: v.movementIntensity,
        bassInfluence: v.frequencyInfluence.bass,
        midInfluence: v.frequencyInfluence.mid,
        highInfluence: v.frequencyInfluence.high,
      });
    }
  },
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
  crystalStore.resetAll();
  particlesStore.resetAll();
  
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
      c.setFormation({ formation: crystalAppearance.value.formation as CrystalFormation });
      c.setColors(crystalColors.value.primary, crystalColors.value.secondary, crystalColors.value.accent);
      c.setCoreColors(crystalColors.value.core.inner, crystalColors.value.core.outer);
      c.setGlowIntensity(crystalGlow.value.intensity);
      c.setShardCount(crystalAppearance.value.shardCount);
      c.setScale(crystalAppearance.value.scale);
      c.setRotation(crystalAnimation.value.rotation.x, crystalAnimation.value.rotation.y, crystalAnimation.value.rotation.z);
    }
  } else if (rendererType.value === 'particles') {
    const p = getParticles();
    if (p) {
      p.setColors(particlesVisual.value.color, particlesVisual.value.glowColor);
      p.setOpacity(particlesVisual.value.opacity);
      p.setParticleSize(particlesVisual.value.particleSize);
      p.setGlowIntensity(particlesVisual.value.glowIntensity);
      p.setSharpness(particlesVisual.value.sharpness);
      p.setScale(particlesTransform.value.scale);
      p.setFormation(particlesFormation.value.type, false);
      p.setPhysics(particlesPhysics.value);
      p.setAnimation(particlesAnimation.value);
      p.setAudioEffects({
        enabled: particlesAudio.value.enabled,
        reactivity: particlesAudio.value.reactivity,
        smoothing: particlesAudio.value.smoothing,
        scalePulse: particlesAudio.value.scalePulse,
        movementIntensity: particlesAudio.value.movementIntensity,
        bassInfluence: particlesAudio.value.frequencyInfluence.bass,
        midInfluence: particlesAudio.value.frequencyInfluence.mid,
        highInfluence: particlesAudio.value.frequencyInfluence.high,
      });
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
    
    // Manually sync preset to kwami instance (watchers may not fire for all nested changes)
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
    } else if (rendererType.value === 'crystal') {
      const c = getCrystal();
      if (c) {
        c.setFormation({ formation: crystalAppearance.value.formation as CrystalFormation });
        c.setColors(crystalColors.value.primary, crystalColors.value.secondary, crystalColors.value.accent);
        c.setCoreColors(crystalColors.value.core.inner, crystalColors.value.core.outer);
        c.setGlowIntensity(crystalGlow.value.intensity);
        c.setShardCount(crystalAppearance.value.shardCount);
        c.setScale(crystalAppearance.value.scale);
        c.setRotation(crystalAnimation.value.rotation.x, crystalAnimation.value.rotation.y, crystalAnimation.value.rotation.z);
        
        // Audio
        if (c.audioEffects) {
          c.audioEffects.enabled = crystalAudio.value.enabled;
          c.audioEffects.reactivity = crystalAudio.value.reactivity;
          c.audioEffects.smoothing = crystalAudio.value.smoothing;
          c.audioEffects.bassOrbitBoost = crystalAudio.value.frequencyBoosts.bass;
          c.audioEffects.midRotationBoost = crystalAudio.value.frequencyBoosts.mid;
          c.audioEffects.highGlowBoost = crystalAudio.value.frequencyBoosts.high;
        }
      }
    } else if (rendererType.value === 'particles') {
      const p = getParticles();
      if (p) {
        p.setFormation(particlesFormation.value.type, false);
        p.setColors(particlesVisual.value.color, particlesVisual.value.glowColor);
        p.setOpacity(particlesVisual.value.opacity);
        p.setParticleSize(particlesVisual.value.particleSize);
        p.setGlowIntensity(particlesVisual.value.glowIntensity);
        p.setSharpness(particlesVisual.value.sharpness);
        p.setScale(particlesTransform.value.scale);
        p.setPhysics(particlesPhysics.value);
        p.setAnimation(particlesAnimation.value);
        p.setAudioEffects({
          enabled: particlesAudio.value.enabled,
          reactivity: particlesAudio.value.reactivity,
          smoothing: particlesAudio.value.smoothing,
          scalePulse: particlesAudio.value.scalePulse,
          movementIntensity: particlesAudio.value.movementIntensity,
          bassInfluence: particlesAudio.value.frequencyInfluence.bass,
          midInfluence: particlesAudio.value.frequencyInfluence.mid,
          highInfluence: particlesAudio.value.frequencyInfluence.high,
        });
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
    <CrystalSettings v-if="rendererType === 'crystal'" />
    <ParticlesSettings v-if="rendererType === 'particles'" />
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
