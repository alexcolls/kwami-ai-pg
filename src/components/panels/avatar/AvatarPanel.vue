<script setup lang="ts">
import { onMounted, onUnmounted, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import { useAvatarStore, type AvatarState } from '@/stores/avatar';
import { useBlobXyzStore, type SkinType } from '@/stores/avatar.blob-xyz';
import { useOrbitalShardsStore, type OrbitalShardsFormation } from '@/stores/avatar.orbital-shards';
import { useStarsGenesisStore } from '@/stores/avatar.stars-genesis';
import { useCrystalBallStore, type CrystalBallStyle } from '@/stores/avatar.crystal-ball';
import BasePanel from '@/components/ui/BasePanel.vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BlobXyzSettings from './BlobXyzSettings.vue';
import OrbitalShardsSettings from './OrbitalShardsSettings.vue';
import StarsGenesisSettings from './StarsGenesisSettings.vue';
import CrystalBallSettings from './CrystalBallSettings.vue';

const { kwami, rendererType: kwamiRendererType, switchRenderer } = useKwami();
const avatarStore = useAvatarStore();
const blobStore = useBlobXyzStore();
const orbitalShardsStore = useOrbitalShardsStore();
const starsGenesisStore = useStarsGenesisStore();
const crystalBallStore = useCrystalBallStore();

// Use store state
const { rendererType, blobPresets, orbitalShardsPresets, starsGenesisPresets, crystalBallPresets } = storeToRefs(avatarStore);
const { skin, shape, animation, cursorTouch, audio } = storeToRefs(blobStore);
const { 
  appearance: orbitalShardsAppearance, 
  colors: orbitalShardsColors, 
  glow: orbitalShardsGlow, 
  animation: orbitalShardsAnimation, 
  audio: orbitalShardsAudio 
} = storeToRefs(orbitalShardsStore);
const { 
  formation: starsGenesisFormation, 
  visual: starsGenesisVisual, 
  transform: starsGenesisTransform, 
  physics: starsGenesisPhysics, 
  animation: starsGenesisAnimation, 
  audio: starsGenesisAudio 
} = storeToRefs(starsGenesisStore);
const {
  style: crystalBallStyle,
  colors: crystalBallColors,
  volume: crystalBallVolume,
  animation: crystalBallAnimation,
  surface: crystalBallSurface,
  audio: crystalBallAudio
} = storeToRefs(crystalBallStore);

// Computed: get the presets for the current renderer
const currentPresets = computed(() => {
  switch (rendererType.value) {
    case 'blob': return blobPresets.value;
    case 'orbital-shards': return orbitalShardsPresets.value;
    case 'stars-genesis': return starsGenesisPresets.value;
    case 'crystal-ball': return crystalBallPresets.value;
    default: return blobPresets.value;
  }
});

// Helpers
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

// Sync from Kwami to Store
function syncFromKwami() {
  if (!kwami.value) return;
  
  const blobInstance = getBlob();
  if (blobInstance) {
    blobStore.syncFromKwami(blobInstance);
  }

  const orbitalShardsInstance = getOrbitalShards();
  if (orbitalShardsInstance) {
    orbitalShardsStore.syncFromKwami(orbitalShardsInstance);
  }

  const starsGenesisInstance = getStarsGenesis();
  if (starsGenesisInstance) {
    starsGenesisStore.syncFromKwami(starsGenesisInstance as any);
  }

  const crystalBallInstance = getCrystalBall();
  if (crystalBallInstance) {
    crystalBallStore.syncFromKwami(crystalBallInstance as any);
  }
  
  // Sync renderer type from kwami
  avatarStore.setRendererType(kwamiRendererType.value as 'blob' | 'orbital-shards' | 'stars-genesis' | 'crystal-ball');
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

// Sync Store to Kwami - Orbital Shards watchers (new structure)

// APPEARANCE watchers
watch(() => orbitalShardsAppearance.value.formation, (v) => getOrbitalShards()?.setFormation({ formation: v as OrbitalShardsFormation }));
watch(() => orbitalShardsAppearance.value.shardCount, (v) => getOrbitalShards()?.setShardCount(v));
watch(() => orbitalShardsAppearance.value.scale, (v) => getOrbitalShards()?.setScale(v));

// COLORS watchers
watch(
  () => ({ primary: orbitalShardsColors.value.primary, secondary: orbitalShardsColors.value.secondary, accent: orbitalShardsColors.value.accent }),
  (v) => (getOrbitalShards() as any)?.setOrbitalShardsColors(v.primary, v.secondary, v.accent),
  { deep: true }
);
watch(
  () => orbitalShardsColors.value.core,
  (v) => getOrbitalShards()?.setCoreColors(v.inner, v.outer),
  { deep: true }
);

// GLOW watchers
watch(() => orbitalShardsGlow.value.intensity, (v) => getOrbitalShards()?.setGlowIntensity(v));

// ANIMATION watchers
watch(
  () => orbitalShardsAnimation.value.rotation,
  (v) => getOrbitalShards()?.setRotation(v.x, v.y, v.z),
  { deep: true }
);

// AUDIO watchers
watch(
  () => orbitalShardsAudio.value,
  (v) => {
    const c = getOrbitalShards();
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
watch(() => starsGenesisFormation.value.type, (v) => getStarsGenesis()?.setFormation(v, true));

// VISUAL watchers
watch(
  () => starsGenesisVisual.value,
  (v) => {
    const p = getStarsGenesis();
    if (p) {
      p.setColors(v.color, v.glowColor);
      p.setOpacity(v.opacity);
      p.setStarSize(v.starSize);
      p.setGlowIntensity(v.glowIntensity);
      p.setSharpness(v.sharpness);
    }
  },
  { deep: true }
);

// TRANSFORM watchers
watch(() => starsGenesisTransform.value.scale, (v) => getStarsGenesis()?.setScale(v));

// PHYSICS watchers
watch(
  () => starsGenesisPhysics.value,
  (v) => getStarsGenesis()?.setPhysics(v),
  { deep: true }
);

// ANIMATION watchers
watch(
  () => starsGenesisAnimation.value,
  (v) => getStarsGenesis()?.setAnimation(v),
  { deep: true }
);

// AUDIO watchers
watch(
  () => starsGenesisAudio.value,
  (v) => {
    const p = getStarsGenesis();
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

// =====================================================
// Sync Store to Kwami - Crystal Ball watchers
// =====================================================

// STYLE watchers
watch(() => crystalBallStyle.value.preset, (v) => getCrystalBall()?.setStyle({ style: v as CrystalBallStyle }));

// COLORS watchers
watch(
  () => crystalBallColors.value,
  (v) => getCrystalBall()?.setColors(v.primary, v.secondary),
  { deep: true }
);

// VOLUME watchers
watch(() => crystalBallVolume.value.iterations, (v) => getCrystalBall()?.setIterations(v));
watch(() => crystalBallVolume.value.depth, (v) => getCrystalBall()?.setDepth(v));
watch(() => crystalBallVolume.value.smoothing, (v) => getCrystalBall()?.setSmoothing(v));
watch(() => crystalBallVolume.value.noiseScale, (v) => getCrystalBall()?.setNoiseScale(v));

// ANIMATION watchers
watch(() => crystalBallAnimation.value.displacementSpeed, (v) => getCrystalBall()?.setDisplacementSpeed(v));
watch(() => crystalBallAnimation.value.displacementStrength, (v) => getCrystalBall()?.setDisplacementStrength(v));
watch(() => crystalBallAnimation.value.pulseSpeed, (v) => getCrystalBall()?.setPulseSpeed(v));
watch(() => crystalBallAnimation.value.pulseIntensity, (v) => getCrystalBall()?.setPulseIntensity(v));
watch(
  () => crystalBallAnimation.value.rotation,
  (v) => getCrystalBall()?.setRotation(v.x, v.y, v.z),
  { deep: true }
);

// SURFACE watchers
watch(() => crystalBallSurface.value.scale, (v) => getCrystalBall()?.setScale(v));

// AUDIO watchers
watch(
  () => crystalBallAudio.value,
  (v) => {
    const cb = getCrystalBall();
    if (cb) {
      cb.setAudioEnabled(v.enabled);
      cb.setAudioReactivity(v.reactivity);
    }
  },
  { deep: true }
);

// Sync renderer type changes
watch(rendererType, (type) => {
  if (kwamiRendererType.value !== type) {
    switchRenderer(type as any);
  }
});

// Actions
function handleSwitchRenderer(type: 'blob' | 'orbital-shards' | 'stars-genesis' | 'crystal-ball') {
  avatarStore.setRendererType(type);
  switchRenderer(type as any);
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
  } else if (rendererType.value === 'orbital-shards') {
    const c = getOrbitalShards();
    if (c) {
      c.setFormation({ formation: orbitalShardsAppearance.value.formation as OrbitalShardsFormation });
      (c as any).setOrbitalShardsColors(orbitalShardsColors.value.primary, orbitalShardsColors.value.secondary, orbitalShardsColors.value.accent);
      c.setCoreColors(orbitalShardsColors.value.core.inner, orbitalShardsColors.value.core.outer);
      c.setGlowIntensity(orbitalShardsGlow.value.intensity);
      c.setShardCount(orbitalShardsAppearance.value.shardCount);
      c.setScale(orbitalShardsAppearance.value.scale);
      c.setRotation(orbitalShardsAnimation.value.rotation.x, orbitalShardsAnimation.value.rotation.y, orbitalShardsAnimation.value.rotation.z);
    }
  } else if (rendererType.value === 'stars-genesis') {
    const p = getStarsGenesis();
    if (p) {
      p.setColors(starsGenesisVisual.value.color, starsGenesisVisual.value.glowColor);
      p.setOpacity(starsGenesisVisual.value.opacity);
      p.setStarSize(starsGenesisVisual.value.starSize);
      p.setGlowIntensity(starsGenesisVisual.value.glowIntensity);
      p.setSharpness(starsGenesisVisual.value.sharpness);
      p.setScale(starsGenesisTransform.value.scale);
      p.setFormation(starsGenesisFormation.value.type, false);
      p.setPhysics(starsGenesisPhysics.value);
      p.setAnimation(starsGenesisAnimation.value);
      p.setAudioEffects({
        enabled: starsGenesisAudio.value.enabled,
        reactivity: starsGenesisAudio.value.reactivity,
        smoothing: starsGenesisAudio.value.smoothing,
        scalePulse: starsGenesisAudio.value.scalePulse,
        movementIntensity: starsGenesisAudio.value.movementIntensity,
        bassInfluence: starsGenesisAudio.value.frequencyInfluence.bass,
        midInfluence: starsGenesisAudio.value.frequencyInfluence.mid,
        highInfluence: starsGenesisAudio.value.frequencyInfluence.high,
      });
    }
  }
}

function handleApplyPreset(presetId: string) {
  const success = avatarStore.applyPreset(presetId);
  if (success) {
    // Switch renderer if needed
    if (kwamiRendererType.value !== rendererType.value) {
      switchRenderer(rendererType.value as any);
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
    } else if (rendererType.value === 'orbital-shards') {
      const c = getOrbitalShards();
      if (c) {
        c.setFormation({ formation: orbitalShardsAppearance.value.formation as OrbitalShardsFormation });
        (c as any).setOrbitalShardsColors(orbitalShardsColors.value.primary, orbitalShardsColors.value.secondary, orbitalShardsColors.value.accent);
        c.setCoreColors(orbitalShardsColors.value.core.inner, orbitalShardsColors.value.core.outer);
        c.setGlowIntensity(orbitalShardsGlow.value.intensity);
        c.setShardCount(orbitalShardsAppearance.value.shardCount);
        c.setScale(orbitalShardsAppearance.value.scale);
        c.setRotation(orbitalShardsAnimation.value.rotation.x, orbitalShardsAnimation.value.rotation.y, orbitalShardsAnimation.value.rotation.z);
        
        // Audio
        if (c.audioEffects) {
          c.audioEffects.enabled = orbitalShardsAudio.value.enabled;
          c.audioEffects.reactivity = orbitalShardsAudio.value.reactivity;
          c.audioEffects.smoothing = orbitalShardsAudio.value.smoothing;
          c.audioEffects.bassOrbitBoost = orbitalShardsAudio.value.frequencyBoosts.bass;
          c.audioEffects.midRotationBoost = orbitalShardsAudio.value.frequencyBoosts.mid;
          c.audioEffects.highGlowBoost = orbitalShardsAudio.value.frequencyBoosts.high;
        }
      }
    } else if (rendererType.value === 'stars-genesis') {
      const p = getStarsGenesis();
      if (p) {
        p.setFormation(starsGenesisFormation.value.type, false);
        p.setColors(starsGenesisVisual.value.color, starsGenesisVisual.value.glowColor);
        p.setOpacity(starsGenesisVisual.value.opacity);
        p.setStarSize(starsGenesisVisual.value.starSize);
        p.setGlowIntensity(starsGenesisVisual.value.glowIntensity);
        p.setSharpness(starsGenesisVisual.value.sharpness);
        p.setScale(starsGenesisTransform.value.scale);
        p.setPhysics(starsGenesisPhysics.value);
        p.setAnimation(starsGenesisAnimation.value);
        p.setAudioEffects({
          enabled: starsGenesisAudio.value.enabled,
          reactivity: starsGenesisAudio.value.reactivity,
          smoothing: starsGenesisAudio.value.smoothing,
          scalePulse: starsGenesisAudio.value.scalePulse,
          movementIntensity: starsGenesisAudio.value.movementIntensity,
          bassInfluence: starsGenesisAudio.value.frequencyInfluence.bass,
          midInfluence: starsGenesisAudio.value.frequencyInfluence.mid,
          highInfluence: starsGenesisAudio.value.frequencyInfluence.high,
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
        <label class="renderer-option" :class="{ active: rendererType === 'orbital-shards' }">
          <input
            type="radio"
            name="renderer"
            value="orbital-shards"
            :checked="rendererType === 'orbital-shards'"
            @change="handleSwitchRenderer('orbital-shards')"
          />
          <iconify-icon icon="ph:diamond-duotone" class="renderer-icon"></iconify-icon>
          <span class="renderer-label">Orbital Shards</span>
        </label>
        <label class="renderer-option" :class="{ active: rendererType === 'stars-genesis' }">
          <input
            type="radio"
            name="renderer"
            value="stars-genesis"
            :checked="rendererType === 'stars-genesis'"
            @change="handleSwitchRenderer('stars-genesis')"
          />
          <iconify-icon icon="ph:circles-three-plus-duotone" class="renderer-icon"></iconify-icon>
          <span class="renderer-label">Particles</span>
        </label>
        <label class="renderer-option" :class="{ active: rendererType === 'crystal-ball' }">
          <input
            type="radio"
            name="renderer"
            value="crystal-ball"
            :checked="rendererType === 'crystal-ball'"
            @change="handleSwitchRenderer('crystal-ball')"
          />
          <iconify-icon icon="ph:globe-simple-duotone" class="renderer-icon"></iconify-icon>
          <span class="renderer-label">Crystal Ball</span>
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
    <BlobXyzSettings v-if="rendererType === 'blob'" />
    <OrbitalShardsSettings v-if="rendererType === 'orbital-shards'" />
    <StarsGenesisSettings v-if="rendererType === 'stars-genesis'" />
    <CrystalBallSettings v-if="rendererType === 'crystal-ball'" />
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
