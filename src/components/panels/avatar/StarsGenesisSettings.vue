<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import { useStarsGenesisStore, type StarsGenesisFormationType, type StarsGenesisDensity } from '@/stores/avatar.stars-genesis';
import { useAvatarInteractions, actionOptions, cursorOptions } from '@/composables/avatar/useAvatarInteractions';
import { randomHex, randomInRange } from '@/utils/color';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import AudioVisualizer from '../audio/AudioVisualizer.vue';
import MicrophoneControl from '../audio/MicrophoneControl.vue';

const { kwami } = useKwami();
const starsGenesisStore = useStarsGenesisStore();
const { formation, visual, transform, physics, animation, orientation, clickEvents, cursorTouch, audio } = storeToRefs(starsGenesisStore);

// Link toggles
const linkRotation = ref(false);
const linkOrientation = ref(false);

// =====================================================
// COMPOSABLES
// =====================================================
function getStarsGenesis() {
  return kwami.value?.avatar.getStarsGenesis();
}

const { executeAction } = useAvatarInteractions({
  getRenderer: getStarsGenesis,
});

function testAction(action: any) {
  executeAction(action);
}

function randomBool(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

const densityOptions = [
  { label: 'Uniform', value: 'uniform' },
  { label: 'Center Heavy', value: 'center-heavy' },
  { label: 'Edge Heavy', value: 'edge-heavy' },
];

// =====================================================
// HELPERS
// =====================================================
// (Helpers removed as they are now imported or replaced by composables)

// =====================================================
// SECTION-SPECIFIC RANDOMIZERS
// =====================================================

// Formation Type
function randomizeFormationType() {
  const types: StarsGenesisFormationType[] = ['sphere', 'disc', 'ring', 'cube'];
  formation.value.type = types[Math.floor(Math.random() * types.length)] ?? 'sphere';
}

// Formation Settings
function randomizeFormationSettings() {
  formation.value.radius = randomInRange(0.5, 4, 0.1);
  formation.value.noise = randomInRange(0, 0.3, 0.01);
  const densities: StarsGenesisDensity[] = ['uniform', 'center-heavy', 'edge-heavy'];
  formation.value.density = densities[Math.floor(Math.random() * densities.length)] ?? 'uniform';
}

// Transform
function randomizeTransform() {
  transform.value.scale = randomInRange(0.5, 2, 0.05);
  transform.value.starCount = Math.floor(randomInRange(1000, 15000, 500));
}

// Colors
function randomizeColors() {
  visual.value.color = randomHex();
  visual.value.glowColor = randomHex();
}

// Visual Effects
function randomizeVisualEffects() {
  visual.value.starSize = randomInRange(0.1, 2, 0.05);
  visual.value.sizeVariation = randomInRange(0, 1, 0.05);
  visual.value.opacity = randomInRange(0.5, 1, 0.05);
  visual.value.glowIntensity = randomInRange(0, 1, 0.05);
  visual.value.brightnessVariation = randomInRange(0, 0.5, 0.05);
  visual.value.sharpness = randomInRange(0.3, 1, 0.05);
}

// Physics Forces
function randomizePhysicsForces() {
  physics.value.returnForce = randomInRange(0.005, 0.15, 0.005);
  physics.value.damping = randomInRange(0.8, 0.99, 0.01);
}

// Explosion
function randomizeExplosion() {
  physics.value.explosionForce = randomInRange(1, 25, 0.5);
  physics.value.explosionRadius = randomInRange(0.5, 5, 0.1);
}

// Leader/Follow
function randomizeLeaderFollow() {
  physics.value.leaderSpeed = randomInRange(0.005, 0.05, 0.002);
  physics.value.followDelay = randomInRange(0.002, 0.05, 0.002);
}

// Mouse Interaction
function randomizeMouseInteraction() {
  physics.value.mouseInfluence = randomInRange(0, 5, 0.1);
  physics.value.mouseRepulsion = randomInRange(0, 2, 0.05);
}

// Breathing Animation
function randomizeBreathing() {
  animation.value.breathing.enabled = randomBool(0.7);
  animation.value.breathing.speed = randomInRange(0.1, 3, 0.1);
  animation.value.breathing.intensity = randomInRange(0, 0.5, 0.01);
}

// Floating Animation
function randomizeFloating() {
  animation.value.floating.enabled = randomBool(0.6);
  animation.value.floating.speed = randomInRange(0.1, 2, 0.05);
  animation.value.floating.amplitude = randomInRange(0, 0.5, 0.01);
}

// Rotation Animation
function randomizeRotation() {
  animation.value.rotation.enabled = randomBool(0.8);
  if (linkRotation.value) {
    const speed = randomInRange(-0.3, 0.3, 0.01);
    animation.value.rotation.speedX = speed;
    animation.value.rotation.speedY = speed;
    animation.value.rotation.speedZ = speed;
  } else {
    animation.value.rotation.speedX = randomInRange(-0.3, 0.3, 0.01);
    animation.value.rotation.speedY = randomInRange(-0.3, 0.3, 0.01);
    animation.value.rotation.speedZ = randomInRange(-0.3, 0.3, 0.01);
  }
}

// Wave Animation
function randomizeWave() {
  animation.value.wave.enabled = randomBool(0.4);
  animation.value.wave.speed = randomInRange(0.1, 4, 0.1);
  animation.value.wave.amplitude = randomInRange(0, 0.3, 0.01);
}

// Turbulence Animation
function randomizeTurbulence() {
  animation.value.turbulence.enabled = randomBool(0.6);
  animation.value.turbulence.intensity = randomInRange(0, 0.1, 0.005);
  animation.value.turbulence.speed = randomInRange(0.1, 3, 0.1);
}

// Audio Settings
function randomizeAudio() {
  audio.value.reactivity = randomInRange(0, 3, 0.1);
  audio.value.smoothing = randomInRange(0.3, 0.95, 0.01);
  audio.value.movementIntensity = randomInRange(0, 2, 0.05);
  audio.value.scalePulse = randomBool(0.5);
}

// Frequency Influence
function randomizeFrequencyInfluence() {
  audio.value.frequencyInfluence.bass = randomInRange(0, 2, 0.05);
  audio.value.frequencyInfluence.mid = randomInRange(0, 2, 0.05);
  audio.value.frequencyInfluence.high = randomInRange(0, 2, 0.05);
}

// Orientation
function randomizeOrientation() {
  if (linkOrientation.value) {
    const pos = randomInRange(0, 360, 1);
    orientation.value.x = pos;
    orientation.value.y = pos;
    orientation.value.z = pos;
  } else {
    orientation.value.x = randomInRange(0, 360, 1);
    orientation.value.y = randomInRange(0, 360, 1);
    orientation.value.z = randomInRange(0, 360, 1);
  }
}

// =====================================================
// LINKED WATCHERS
// =====================================================

watch(() => animation.value.rotation.speedX, (val) => {
  if (linkRotation.value) {
    animation.value.rotation.speedY = val;
    animation.value.rotation.speedZ = val;
  }
});

watch(() => orientation.value.x, (val) => {
  if (linkOrientation.value) {
    orientation.value.y = val;
    orientation.value.z = val;
  }
});

// =====================================================
// INTERACTION WATCHERS
// =====================================================

watch(clickEvents, (config) => {
  const starsGenesis = getStarsGenesis();
  if (!starsGenesis) return;

  if ((starsGenesis as any).onClick !== undefined) {
    (starsGenesis as any).onClick = config.click.enabled && config.click.action !== 'none'
      ? () => executeAction(config.click.action)
      : () => {};
  }

  if ((starsGenesis as any).onDoubleClick !== undefined) {
    (starsGenesis as any).onDoubleClick = config.doubleClick.enabled && config.doubleClick.action !== 'none'
      ? () => executeAction(config.doubleClick.action)
      : () => {};
  }

  if ((starsGenesis as any).setRightClickCallback !== undefined) {
    if (config.rightClick.enabled && config.rightClick.action !== 'none') {
      (starsGenesis as any).setRightClickCallback(() => executeAction(config.rightClick.action));
    } else {
      (starsGenesis as any).setRightClickCallback(() => {});
    }
  }

  if ((starsGenesis as any).setDoubleRightClickCallback !== undefined) {
    if (config.doubleRightClick.enabled && config.doubleRightClick.action !== 'none') {
      (starsGenesis as any).setDoubleRightClickCallback(() => executeAction(config.doubleRightClick.action));
    } else {
      (starsGenesis as any).setDoubleRightClickCallback(() => {});
    }
  }
}, { deep: true, immediate: true });
</script>

<template>
  <!-- ==================== FORMATION TYPE ==================== -->
  <PanelSection title="Formation Type" icon="ph:shapes-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeFormationType" title="Randomize formation">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Base shape of the star cloud</p>
    <div class="formation-selector">
      <label
        v-for="form in (['sphere', 'disc', 'ring', 'cube'] as const)"
        :key="form"
        class="formation-option"
        :class="{ active: formation.type === form }"
      >
        <input type="radio" :value="form" v-model="formation.type" />
        <iconify-icon
          :icon="
            form === 'sphere' ? 'ph:globe-duotone'
            : form === 'disc' ? 'ph:circle-duotone'
            : form === 'ring' ? 'ph:circle-notch-duotone'
            : 'ph:cube-duotone'
          "
          class="formation-icon"
        ></iconify-icon>
        <span class="formation-label">{{ form.charAt(0).toUpperCase() + form.slice(1) }}</span>
      </label>
    </div>
  </PanelSection>

  <!-- ==================== FORMATION SETTINGS ==================== -->
  <PanelSection title="Formation Settings" icon="ph:circles-three-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeFormationSettings" title="Randomize settings">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Radius, density distribution, and noise</p>
    <div class="slider-group">
      <BaseSlider label="Radius" :min="0.5" :max="4" :step="0.1" v-model="formation.radius" />
      <BaseSlider label="Noise" :min="0" :max="0.3" :step="0.01" v-model="formation.noise" />
    </div>
    <div style="margin-top: 12px">
      <BaseSelect label="Density" v-model="formation.density" :options="densityOptions" />
    </div>
  </PanelSection>

  <!-- ==================== PARTICLE COUNT ==================== -->
  <PanelSection title="Particle Count" icon="ph:dots-nine-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeTransform" title="Randomize count">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Number of stars and overall scale</p>
    <div class="slider-group">
      <BaseSlider label="Count" :min="1000" :max="15000" :step="500" v-model="transform.starCount" />
      <BaseSlider label="Scale" :min="0.5" :max="2" :step="0.05" v-model="transform.scale" />
    </div>
  </PanelSection>

  <!-- ==================== COLORS ==================== -->
  <PanelSection title="Colors" icon="ph:palette-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeColors" title="Randomize colors">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Particle and glow color scheme</p>
    <div class="row-2">
      <BaseColorPicker label="Particle" v-model="visual.color" />
      <BaseColorPicker label="Glow" v-model="visual.glowColor" />
    </div>
  </PanelSection>

  <!-- ==================== VISUAL EFFECTS ==================== -->
  <PanelSection title="Visual Effects" icon="ph:sparkle-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeVisualEffects" title="Randomize visuals">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Size, opacity, glow, and sharpness</p>
    <div class="slider-group">
      <BaseSlider label="Particle Size" :min="0.1" :max="2" :step="0.05" v-model="visual.starSize" />
      <BaseSlider label="Size Variation" :min="0" :max="1" :step="0.05" v-model="visual.sizeVariation" />
      <BaseSlider label="Opacity" :min="0.1" :max="1" :step="0.05" v-model="visual.opacity" />
      <BaseSlider label="Glow Intensity" :min="0" :max="1" :step="0.05" v-model="visual.glowIntensity" />
      <BaseSlider label="Brightness Var." :min="0" :max="0.5" :step="0.05" v-model="visual.brightnessVariation" />
      <BaseSlider label="Sharpness" :min="0" :max="1" :step="0.05" v-model="visual.sharpness" />
    </div>
  </PanelSection>

  <!-- ==================== PHYSICS FORCES ==================== -->
  <PanelSection title="Physics Forces" icon="ph:magnet-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizePhysicsForces" title="Randomize forces">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How stars return to position and settle</p>
    <div class="slider-group">
      <BaseSlider label="Return Force" :min="0.005" :max="0.15" :step="0.005" v-model="physics.returnForce" />
      <BaseSlider label="Damping" :min="0.8" :max="0.99" :step="0.01" v-model="physics.damping" />
    </div>
  </PanelSection>

  <!-- ==================== EXPLOSION ==================== -->
  <PanelSection title="Explosion" icon="ph:bomb-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeExplosion" title="Randomize explosion">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Click explosion force and radius</p>
    <div class="slider-group">
      <BaseSlider label="Force" :min="1" :max="25" :step="0.5" v-model="physics.explosionForce" />
      <BaseSlider label="Radius" :min="0.5" :max="5" :step="0.1" v-model="physics.explosionRadius" />
    </div>
  </PanelSection>

  <!-- ==================== LEADER/FOLLOW ==================== -->
  <PanelSection title="Leader/Follow" icon="ph:users-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeLeaderFollow" title="Randomize leader/follow">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How stars follow the leader</p>
    <div class="slider-group">
      <BaseSlider label="Leader Speed" :min="0.005" :max="0.05" :step="0.002" v-model="physics.leaderSpeed" />
      <BaseSlider label="Follow Delay" :min="0.002" :max="0.05" :step="0.002" v-model="physics.followDelay" />
    </div>
  </PanelSection>

  <!-- ==================== MOUSE INTERACTION ==================== -->
  <PanelSection title="Mouse Interaction" icon="ph:cursor-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeMouseInteraction" title="Randomize mouse">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How stars react to cursor movement</p>
    <div class="slider-group">
      <BaseSlider label="Influence" :min="0" :max="5" :step="0.1" v-model="physics.mouseInfluence" />
      <BaseSlider label="Repulsion" :min="0" :max="2" :step="0.05" v-model="physics.mouseRepulsion" />
    </div>
  </PanelSection>

  <!-- ==================== BREATHING ANIMATION ==================== -->
  <PanelSection title="Breathing" icon="ph:wind-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeBreathing" title="Randomize breathing">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Gentle pulsing animation effect</p>
    <div class="toggle-row">
      <BaseToggle label="Enabled" v-model="animation.breathing.enabled" />
    </div>
    <div v-if="animation.breathing.enabled" class="slider-group">
      <BaseSlider label="Speed" :min="0.1" :max="3" :step="0.1" v-model="animation.breathing.speed" />
      <BaseSlider label="Intensity" :min="0" :max="0.5" :step="0.01" v-model="animation.breathing.intensity" />
    </div>
  </PanelSection>

  <!-- ==================== FLOATING ANIMATION ==================== -->
  <PanelSection title="Floating" icon="ph:cloud-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeFloating" title="Randomize floating">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Drifting motion of stars</p>
    <div class="toggle-row">
      <BaseToggle label="Enabled" v-model="animation.floating.enabled" />
    </div>
    <div v-if="animation.floating.enabled" class="slider-group">
      <BaseSlider label="Speed" :min="0.1" :max="2" :step="0.05" v-model="animation.floating.speed" />
      <BaseSlider label="Amplitude" :min="0" :max="0.5" :step="0.01" v-model="animation.floating.amplitude" />
    </div>
  </PanelSection>

  <!-- ==================== ROTATION ANIMATION ==================== -->
  <PanelSection title="Auto Rotation" icon="ph:arrows-clockwise-duotone" collapsible>
    <template #actions>
      <button 
        class="link-btn" 
        :class="{ active: linkRotation }" 
        @click="linkRotation = !linkRotation"
        title="Link XYZ values"
      >
        <iconify-icon :icon="linkRotation ? 'ph:link-duotone' : 'ph:link-break-duotone'"></iconify-icon>
      </button>
      <button class="dice-btn" @click="randomizeRotation" title="Randomize rotation">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Continuous rotation of the star cloud</p>
    <div class="toggle-row">
      <BaseToggle label="Enabled" v-model="animation.rotation.enabled" />
    </div>
    <div v-if="animation.rotation.enabled" class="slider-group" :class="{ linked: linkRotation }">
      <BaseSlider label="X" :min="-0.3" :max="0.3" :step="0.01" v-model="animation.rotation.speedX" />
      <BaseSlider v-if="!linkRotation" label="Y" :min="-0.3" :max="0.3" :step="0.01" v-model="animation.rotation.speedY" />
      <BaseSlider v-if="!linkRotation" label="Z" :min="-0.3" :max="0.3" :step="0.01" v-model="animation.rotation.speedZ" />
    </div>
  </PanelSection>

  <!-- ==================== WAVE ANIMATION ==================== -->
  <PanelSection title="Wave" icon="ph:waves-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeWave" title="Randomize wave">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Wave-like motion through the cloud</p>
    <div class="toggle-row">
      <BaseToggle label="Enabled" v-model="animation.wave.enabled" />
    </div>
    <div v-if="animation.wave.enabled" class="slider-group">
      <BaseSlider label="Speed" :min="0.1" :max="4" :step="0.1" v-model="animation.wave.speed" />
      <BaseSlider label="Amplitude" :min="0" :max="0.3" :step="0.01" v-model="animation.wave.amplitude" />
    </div>
  </PanelSection>

  <!-- ==================== TURBULENCE ANIMATION ==================== -->
  <PanelSection title="Turbulence" icon="ph:tornado-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeTurbulence" title="Randomize turbulence">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Random chaotic particle movement</p>
    <div class="toggle-row">
      <BaseToggle label="Enabled" v-model="animation.turbulence.enabled" />
    </div>
    <div v-if="animation.turbulence.enabled" class="slider-group">
      <BaseSlider label="Intensity" :min="0" :max="0.1" :step="0.005" v-model="animation.turbulence.intensity" />
      <BaseSlider label="Speed" :min="0.1" :max="3" :step="0.1" v-model="animation.turbulence.speed" />
    </div>
  </PanelSection>

  <!-- ==================== ORIENTATION ==================== -->
  <PanelSection title="Orientation" icon="ph:compass-duotone" collapsible>
    <template #actions>
      <button 
        class="link-btn" 
        :class="{ active: linkOrientation }" 
        @click="linkOrientation = !linkOrientation"
        title="Link XYZ values"
      >
        <iconify-icon :icon="linkOrientation ? 'ph:link-duotone' : 'ph:link-break-duotone'"></iconify-icon>
      </button>
      <button class="dice-btn" @click="randomizeOrientation" title="Randomize orientation">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Starting rotation angle in degrees</p>
    <div class="slider-group" :class="{ linked: linkOrientation }">
      <BaseSlider label="X (°)" :min="0" :max="360" :step="1" v-model="orientation.x" />
      <BaseSlider v-if="!linkOrientation" label="Y (°)" :min="0" :max="360" :step="1" v-model="orientation.y" />
      <BaseSlider v-if="!linkOrientation" label="Z (°)" :min="0" :max="360" :step="1" v-model="orientation.z" />
    </div>
  </PanelSection>

  <!-- ==================== CLICK EVENTS ==================== -->
  <PanelSection title="Click Events" icon="ph:cursor-click-duotone" collapsible>
    <p class="section-desc">Actions triggered by mouse clicks</p>
    
    <div class="interaction-row">
      <div class="interaction-header">
        <iconify-icon icon="ph:hand-tap-duotone"></iconify-icon>
        <span>Single Click</span>
        <BaseToggle v-model="clickEvents.click.enabled" size="sm" />
      </div>
      <div class="interaction-config" v-if="clickEvents.click.enabled">
        <BaseSelect label="Action" v-model="clickEvents.click.action" :options="actionOptions" />
        <button class="test-btn" @click="testAction(clickEvents.click.action)" title="Test Action">
          <iconify-icon icon="ph:play-fill"></iconify-icon>
        </button>
      </div>
    </div>

    <div class="interaction-row">
      <div class="interaction-header">
        <iconify-icon icon="ph:hand-duotone"></iconify-icon>
        <span>Double Click</span>
        <BaseToggle v-model="clickEvents.doubleClick.enabled" size="sm" />
      </div>
      <div class="interaction-config" v-if="clickEvents.doubleClick.enabled">
        <BaseSelect label="Action" v-model="clickEvents.doubleClick.action" :options="actionOptions" />
        <button class="test-btn" @click="testAction(clickEvents.doubleClick.action)" title="Test Action">
          <iconify-icon icon="ph:play-fill"></iconify-icon>
        </button>
      </div>
    </div>

    <div class="interaction-row">
      <div class="interaction-header">
        <iconify-icon icon="ph:mouse-right-click-duotone"></iconify-icon>
        <span>Right Click</span>
        <BaseToggle v-model="clickEvents.rightClick.enabled" size="sm" />
      </div>
      <div class="interaction-config" v-if="clickEvents.rightClick.enabled">
        <BaseSelect label="Action" v-model="clickEvents.rightClick.action" :options="actionOptions" />
        <button class="test-btn" @click="testAction(clickEvents.rightClick.action)" title="Test Action">
          <iconify-icon icon="ph:play-fill"></iconify-icon>
        </button>
      </div>
    </div>

    <div class="interaction-row">
      <div class="interaction-header">
        <iconify-icon icon="ph:mouse-right-click-duotone"></iconify-icon>
        <span>Double Right Click</span>
        <BaseToggle v-model="clickEvents.doubleRightClick.enabled" size="sm" />
      </div>
      <div class="interaction-config" v-if="clickEvents.doubleRightClick.enabled">
        <BaseSelect label="Action" v-model="clickEvents.doubleRightClick.action" :options="actionOptions" />
        <button class="test-btn" @click="testAction(clickEvents.doubleRightClick.action)" title="Test Action">
          <iconify-icon icon="ph:play-fill"></iconify-icon>
        </button>
      </div>
    </div>
  </PanelSection>

  <!-- ==================== HOVER & DRAG ==================== -->
  <PanelSection title="Hover & Drag" icon="ph:hand-duotone" collapsible>
    <p class="section-desc">Cursor behavior when interacting</p>
    
    <div class="toggle-row">
      <BaseToggle label="Enable Hover" v-model="cursorTouch.hover.enabled" />
    </div>
    <div v-if="cursorTouch.hover.enabled" class="hover-config">
      <BaseToggle label="Highlight on Hover" v-model="cursorTouch.hover.highlightOnHover" />
      <BaseSelect label="Cursor Style" v-model="cursorTouch.hover.cursorStyle" :options="cursorOptions" />
    </div>

    <div class="toggle-row" style="margin-top: 12px">
      <BaseToggle label="Enable Drag" v-model="cursorTouch.drag.enabled" />
    </div>
    <div v-if="cursorTouch.drag.enabled" class="slider-group">
      <BaseSlider label="Sensitivity" :min="0.1" :max="3" :step="0.1" v-model="cursorTouch.drag.sensitivity" />
    </div>
  </PanelSection>

  <!-- ==================== AUDIO REACTIVITY ==================== -->
  <PanelSection title="Audio Reactivity" icon="ph:waveform-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeAudio" title="Randomize audio settings">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How stars respond to sound</p>
    
    <div class="toggle-row">
      <BaseToggle label="Enable Audio Effects" v-model="audio.enabled" />
    </div>
    
    <MicrophoneControl />
    <AudioVisualizer />

    <div v-if="audio.enabled" class="slider-group" style="margin-top: 12px">
      <BaseSlider label="Reactivity" :min="0" :max="3" :step="0.1" v-model="audio.reactivity" />
      <BaseSlider label="Smoothing" :min="0.3" :max="0.95" :step="0.01" v-model="audio.smoothing" />
      <BaseSlider label="Movement Intensity" :min="0" :max="2" :step="0.05" v-model="audio.movementIntensity" />
      <div class="toggle-row">
        <BaseToggle label="Scale Pulse with Bass" v-model="audio.scalePulse" />
      </div>
    </div>
  </PanelSection>

  <!-- ==================== FREQUENCY RESPONSE ==================== -->
  <PanelSection title="Frequency Response" icon="ph:equalizer-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeFrequencyInfluence" title="Randomize frequency">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How different frequencies affect stars</p>
    
    <div class="slider-group">
      <BaseSlider label="Bass" :min="0" :max="2" :step="0.05" v-model="audio.frequencyInfluence.bass" />
      <BaseSlider label="Mid" :min="0" :max="2" :step="0.05" v-model="audio.frequencyInfluence.mid" />
      <BaseSlider label="High" :min="0" :max="2" :step="0.05" v-model="audio.frequencyInfluence.high" />
    </div>
  </PanelSection>
</template>

<style scoped>
@import '@/styles/avatar-settings.css';

/* Formation Selector */
.formation-selector {
  display: flex;
  gap: 6px;
  background: var(--surface-1);
  padding: 4px;
  border-radius: 10px;
}

.formation-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  font-size: 10px;
  font-weight: 500;
}

.formation-option input {
  display: none;
}

.formation-option:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.formation-option.active {
  background: var(--surface-3);
  color: var(--text-primary);
  border: 1px solid var(--accent-primary);
}

.formation-icon {
  font-size: 18px;
}

.formation-label {
  text-transform: capitalize;
}
</style>
