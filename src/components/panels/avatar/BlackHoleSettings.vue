<script setup lang="ts">
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import {
  useBlackHoleStore,
  type BlackHoleColorScheme,
} from '@/stores/avatar.black-hole';
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
const blackHoleStore = useBlackHoleStore();
const {
  colorScheme,
  core,
  disk,
  colors,
  animation,
  effects,
  clickEvents,
  cursorTouch,
  audio,
  scale,
  cameraZoom,
} = storeToRefs(blackHoleStore);

// =====================================================
// COMPOSABLES
// =====================================================
function getBlackHole() {
  return (kwami.value?.avatar as any)?.getBlackHole?.();
}

const { executeAction } = useAvatarInteractions({
  getRenderer: getBlackHole,
});

function testAction(action: any) {
  executeAction(action);
}

// =====================================================
// OPTIONS
// =====================================================

const schemeOptions = [
  { label: 'Classic', value: 'classic' },
  { label: 'Fire', value: 'fire' },
  { label: 'Ice', value: 'ice' },
  { label: 'Nebula', value: 'nebula' },
  { label: 'Void', value: 'void' },
];

// =====================================================
// HELPERS (Removed or replaced)
// =====================================================
// (Helpers removed as they are now imported or replaced by composables)

// =====================================================
// SECTION-SPECIFIC RANDOMIZERS
// =====================================================

// Color Scheme
function randomizeColorScheme() {
  const schemes: BlackHoleColorScheme[] = ['classic', 'fire', 'ice', 'nebula', 'void'];
  blackHoleStore.setColorSchemePreset(
    schemes[Math.floor(Math.random() * schemes.length)] ?? 'classic',
  );
}

// Colors
function randomizeColors() {
  colors.value.hot = randomHex();
  colors.value.mid1 = randomHex();
  colors.value.mid2 = randomHex();
  colors.value.mid3 = randomHex();
  colors.value.outer = randomHex();
}

// Core
function randomizeCore() {
  const bhRadius = randomInRange(0.8, 2, 0.1);
  core.value.blackHoleRadius = bhRadius;
  core.value.eventHorizonRadius = bhRadius * randomInRange(1.02, 1.15, 0.01);
  core.value.glowIntensity = randomInRange(0.5, 1.5, 0.1);
  core.value.pulseSpeed = randomInRange(1.5, 4, 0.5);
}

// Disk
function randomizeDisk() {
  disk.value.innerRadius = randomInRange(0.1, 0.5, 0.05);
  disk.value.outerRadius = randomInRange(6, 12, 0.5);
  disk.value.flowSpeed = randomInRange(0.1, 0.4, 0.02);
  disk.value.noiseScale = randomInRange(1.5, 4, 0.5);
  disk.value.density = randomInRange(0.8, 1.8, 0.1);
  disk.value.tiltAngle = randomInRange(Math.PI / 6, Math.PI / 2, 0.1);
}

// Effects
function randomizeEffects() {
  effects.value.bloomIntensity = randomInRange(0.4, 1.2, 0.1);
  effects.value.bloomThreshold = randomInRange(0.6, 0.9, 0.05);
  effects.value.bloomRadius = randomInRange(0.5, 1, 0.1);
  effects.value.lensingStrength = randomInRange(0.08, 0.2, 0.02);
  effects.value.chromaticAberration = randomInRange(0.003, 0.015, 0.001);
}

// Animation
function randomizeAnimation() {
  animation.value.diskRotationSpeed = randomInRange(0.002, 0.01, 0.001);
  animation.value.starsRotationSpeed = randomInRange(0.001, 0.005, 0.0005);
}

// Audio
function randomizeAudio() {
  audio.value.reactivity = randomInRange(0.5, 2, 0.1);
  audio.value.smoothing = randomInRange(0.7, 0.95, 0.01);
}

// Frequency Effects
function randomizeFrequencyEffects() {
  audio.value.frequencyEffects = {
    bassDiskGlow: randomInRange(0.2, 0.8, 0.05),
    midDiskSpeed: randomInRange(0.1, 0.5, 0.05),
    highStarTwinkle: randomInRange(0.2, 0.6, 0.05),
  };
}

// =====================================================
// INTERACTION WATCHERS
// =====================================================

watch(
  clickEvents,
  (_config) => {
    const bh = getBlackHole();
    if (!bh) return;

    // Black hole doesn't have click callbacks yet, but we can set them up for future
  },
  { deep: true, immediate: true },
);
</script>

<template>
  <!-- ==================== COLOR SCHEME ==================== -->
  <PanelSection title="Color Scheme" icon="ph:palette-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeColorScheme" title="Randomize scheme">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Visual color preset for the black hole</p>
    <div class="style-selector">
      <label
        v-for="option in schemeOptions"
        :key="option.value"
        class="style-option"
        :class="{ active: colorScheme.preset === option.value }"
      >
        <input
          type="radio"
          :value="option.value"
          v-model="colorScheme.preset"
          @change="blackHoleStore.setColorSchemePreset(colorScheme.preset)"
        />
        <iconify-icon
          :icon="
            option.value === 'classic'
              ? 'ph:circle-duotone'
              : option.value === 'fire'
                ? 'ph:fire-duotone'
                : option.value === 'ice'
                  ? 'ph:snowflake-duotone'
                  : option.value === 'nebula'
                    ? 'ph:planet-duotone'
                    : 'ph:moon-duotone'
          "
          class="style-icon"
        ></iconify-icon>
        <span class="style-label">{{ option.label }}</span>
      </label>
    </div>
  </PanelSection>

  <!-- ==================== DISK COLORS ==================== -->
  <PanelSection title="Disk Colors" icon="ph:paint-brush-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeColors" title="Randomize colors">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Accretion disk gradient colors (inner to outer)</p>
    <div class="color-grid">
      <BaseColorPicker label="Hot (Inner)" v-model="colors.hot" />
      <BaseColorPicker label="Mid 1" v-model="colors.mid1" />
      <BaseColorPicker label="Mid 2" v-model="colors.mid2" />
      <BaseColorPicker label="Mid 3" v-model="colors.mid3" />
      <BaseColorPicker label="Outer" v-model="colors.outer" />
    </div>
  </PanelSection>

  <!-- ==================== SCALE & ZOOM ==================== -->
  <PanelSection title="Scale & Zoom" icon="ph:arrows-out-duotone" collapsible>
    <p class="section-desc">Control visualization size and camera zoom</p>
    <div class="slider-group">
      <BaseSlider label="Scale" :min="0.5" :max="2" :step="0.1" v-model="scale.value" />
      <BaseSlider label="Camera Zoom" :min="0.5" :max="3" :step="0.1" v-model="cameraZoom.value" />
    </div>
  </PanelSection>

  <!-- ==================== BLACK HOLE CENTER ==================== -->
  <PanelSection title="Black Hole Center" icon="ph:circle-fill" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeCore" title="Randomize core">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Size and appearance of the dark center sphere</p>
    <div class="slider-group">
      <BaseSlider
        label="Black Hole Radius"
        :min="0.5"
        :max="3"
        :step="0.1"
        v-model="core.blackHoleRadius"
      />
    </div>
  </PanelSection>

  <!-- ==================== EVENT HORIZON ==================== -->
  <PanelSection title="Event Horizon" icon="ph:circle-duotone" collapsible>
    <p class="section-desc">The glowing shell around the black hole</p>
    <div class="slider-group">
      <BaseSlider
        label="Event Horizon Radius"
        :min="0.5"
        :max="4"
        :step="0.1"
        v-model="core.eventHorizonRadius"
      />
      <BaseSlider
        label="Glow Intensity"
        :min="0.2"
        :max="2"
        :step="0.1"
        v-model="core.glowIntensity"
      />
      <BaseSlider label="Pulse Speed" :min="0.5" :max="5" :step="0.5" v-model="core.pulseSpeed" />
    </div>
  </PanelSection>

  <!-- ==================== ACCRETION DISK ==================== -->
  <PanelSection title="Accretion Disk" icon="ph:spiral-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeDisk" title="Randomize disk">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Swirling matter disk configuration</p>
    <div class="slider-group">
      <BaseSlider label="Inner Gap" :min="0" :max="1" :step="0.05" v-model="disk.innerRadius" />
      <BaseSlider label="Outer Radius" :min="4" :max="15" :step="0.5" v-model="disk.outerRadius" />
      <BaseSlider label="Flow Speed" :min="0.05" :max="0.5" :step="0.01" v-model="disk.flowSpeed" />
      <BaseSlider label="Noise Scale" :min="1" :max="5" :step="0.5" v-model="disk.noiseScale" />
      <BaseSlider label="Density" :min="0.5" :max="2" :step="0.1" v-model="disk.density" />
      <BaseSlider label="Tilt Angle" :min="0.5" :max="1.57" :step="0.1" v-model="disk.tiltAngle" />
    </div>
  </PanelSection>

  <!-- ==================== POST-PROCESSING EFFECTS ==================== -->
  <PanelSection title="Effects" icon="ph:sparkle-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeEffects" title="Randomize effects">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Bloom and gravitational lensing</p>
    <div class="slider-group">
      <BaseSlider
        label="Bloom Intensity"
        :min="0"
        :max="2"
        :step="0.1"
        v-model="effects.bloomIntensity"
      />
      <BaseSlider
        label="Bloom Threshold"
        :min="0.5"
        :max="1"
        :step="0.05"
        v-model="effects.bloomThreshold"
      />
      <BaseSlider
        label="Bloom Radius"
        :min="0"
        :max="1.5"
        :step="0.1"
        v-model="effects.bloomRadius"
      />
      <BaseSlider
        label="Lensing Strength"
        :min="0"
        :max="0.3"
        :step="0.01"
        v-model="effects.lensingStrength"
      />
      <BaseSlider
        label="Lensing Radius"
        :min="0.1"
        :max="0.5"
        :step="0.02"
        v-model="effects.lensingRadius"
      />
      <BaseSlider
        label="Chromatic Aberration"
        :min="0"
        :max="0.02"
        :step="0.001"
        v-model="effects.chromaticAberration"
      />
    </div>
  </PanelSection>

  <!-- ==================== ANIMATION ==================== -->
  <PanelSection title="Animation" icon="ph:arrows-clockwise-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeAnimation" title="Randomize animation">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Rotation speeds for disk and star field</p>
    <div class="toggle-row">
      <BaseToggle label="Auto Rotate Camera" v-model="animation.autoRotate" />
    </div>
    <div class="slider-group" style="margin-top: 12px">
      <BaseSlider
        v-if="animation.autoRotate"
        label="Camera Rotation Speed"
        :min="0.01"
        :max="0.3"
        :step="0.01"
        v-model="animation.autoRotateSpeed"
      />
      <BaseSlider
        label="Disk Rotation Speed"
        :min="0"
        :max="0.02"
        :step="0.001"
        v-model="animation.diskRotationSpeed"
      />
      <BaseSlider
        label="Stars Rotation Speed"
        :min="0"
        :max="0.01"
        :step="0.0005"
        v-model="animation.starsRotationSpeed"
      />
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
        <BaseSelect
          label="Action"
          v-model="clickEvents.doubleClick.action"
          :options="actionOptions"
        />
        <button
          class="test-btn"
          @click="testAction(clickEvents.doubleClick.action)"
          title="Test Action"
        >
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
        <BaseSelect
          label="Action"
          v-model="clickEvents.rightClick.action"
          :options="actionOptions"
        />
        <button
          class="test-btn"
          @click="testAction(clickEvents.rightClick.action)"
          title="Test Action"
        >
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
        <BaseSelect
          label="Action"
          v-model="clickEvents.doubleRightClick.action"
          :options="actionOptions"
        />
        <button
          class="test-btn"
          @click="testAction(clickEvents.doubleRightClick.action)"
          title="Test Action"
        >
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
      <BaseSelect
        label="Cursor Style"
        v-model="cursorTouch.hover.cursorStyle"
        :options="cursorOptions"
      />
    </div>

    <div class="toggle-row" style="margin-top: 12px">
      <BaseToggle label="Enable Drag" v-model="cursorTouch.drag.enabled" />
    </div>
    <div v-if="cursorTouch.drag.enabled" class="slider-group">
      <BaseSlider
        label="Sensitivity"
        :min="0.1"
        :max="3"
        :step="0.1"
        v-model="cursorTouch.drag.sensitivity"
      />
    </div>
  </PanelSection>

  <!-- ==================== AUDIO REACTIVITY ==================== -->
  <PanelSection title="Audio Reactivity" icon="ph:waveform-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeAudio" title="Randomize audio settings">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How the black hole responds to sound</p>

    <div class="toggle-row">
      <BaseToggle label="Enable Audio Effects" v-model="audio.enabled" />
    </div>

    <MicrophoneControl />
    <AudioVisualizer />

    <div v-if="audio.enabled" class="slider-group" style="margin-top: 12px">
      <BaseSlider label="Reactivity" :min="0" :max="2" :step="0.1" v-model="audio.reactivity" />
      <BaseSlider label="Smoothing" :min="0.5" :max="0.99" :step="0.01" v-model="audio.smoothing" />
    </div>
  </PanelSection>

  <!-- ==================== FREQUENCY RESPONSE ==================== -->
  <PanelSection title="Frequency Response" icon="ph:equalizer-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeFrequencyEffects" title="Randomize frequency">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How different frequencies affect the visualization</p>

    <div class="slider-group">
      <BaseSlider
        label="Bass (Disk Glow)"
        :min="0"
        :max="1"
        :step="0.05"
        v-model="audio.frequencyEffects.bassDiskGlow"
      />
      <BaseSlider
        label="Mid (Disk Speed)"
        :min="0"
        :max="1"
        :step="0.05"
        v-model="audio.frequencyEffects.midDiskSpeed"
      />
      <BaseSlider
        label="High (Star Twinkle)"
        :min="0"
        :max="1"
        :step="0.05"
        v-model="audio.frequencyEffects.highStarTwinkle"
      />
    </div>
  </PanelSection>
</template>

<style scoped>
@import '@/styles/avatar-settings.css';
/* Section Description */
.section-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

/* Style Selector */
.style-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: var(--surface-1);
  padding: 4px;
  border-radius: 10px;
}

.style-option {
  flex: 1;
  min-width: 60px;
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

.style-option input {
  display: none;
}

.style-option:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.style-option.active {
  background: var(--surface-3);
  color: var(--text-primary);
  border: 1px solid var(--accent-primary);
}

.style-icon {
  font-size: 20px;
}

/* Color Grid */
.color-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.color-grid > :nth-child(4),
.color-grid > :nth-child(5) {
  grid-column: span 1;
}

</style>
