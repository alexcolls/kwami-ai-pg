<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import { useCrystalBallStore, type InteractionAction, type CrystalBallStyle } from '@/stores/avatar.crystal-ball';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import AudioVisualizer from '../audio/AudioVisualizer.vue';
import MicrophoneControl from '../audio/MicrophoneControl.vue';

const { kwami, switchRenderer } = useKwami();
const crystalBallStore = useCrystalBallStore();
const { style, colors, volume, animation, surface, clickEvents, cursorTouch, audio } = storeToRefs(crystalBallStore);

// Link toggle for rotation
const linkRotation = ref(false);

// =====================================================
// INTERACTION OPTIONS
// =====================================================

const actionOptions = [
  { label: 'None', value: 'none' },
  { label: 'Toggle Listening', value: 'toggleListening' },
  { label: 'Start Listening', value: 'startListening' },
  { label: 'Stop Listening', value: 'stopListening' },
  { label: 'Randomize', value: 'randomize' },
  { label: 'Switch Renderer', value: 'switchRenderer' },
  { label: 'Cycle State', value: 'cycleState' },
  { label: 'Pulse Effect', value: 'pulse' },
];

const cursorOptions = [
  { label: 'Pointer', value: 'pointer' },
  { label: 'Grab', value: 'grab' },
  { label: 'Crosshair', value: 'crosshair' },
  { label: 'Default', value: 'default' },
];

const styleOptions = [
  { label: 'Mystical', value: 'mystical' },
  { label: 'Nebula', value: 'nebula' },
  { label: 'Earth', value: 'earth' },
  { label: 'Fire', value: 'fire' },
  { label: 'Ocean', value: 'ocean' },
];

// =====================================================
// HELPERS
// =====================================================

function getCrystalBall() {
  return kwami.value?.avatar.getCrystalBall();
}

function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function randomInRange(min: number, max: number, step: number = 0.01): number {
  const range = (max - min) / step;
  return min + Math.round(Math.random() * range) * step;
}

// =====================================================
// INTERACTION ACTIONS
// =====================================================

function executeAction(action: InteractionAction) {
  if (!kwami.value) return;

  switch (action) {
    case 'toggleListening': {
      const currentState = kwami.value.getState() || 'idle';
      kwami.value.setState(currentState === 'listening' ? 'idle' : 'listening');
      break;
    }
    case 'startListening':
      kwami.value.setState('listening');
      break;
    case 'stopListening':
      kwami.value.setState('idle');
      break;
    case 'randomize':
      kwami.value.avatar.randomize();
      window.dispatchEvent(new CustomEvent('kwami:randomized'));
      break;
    case 'switchRenderer': {
      const renderer = kwami.value.avatar.getRendererType();
      const renderers = ['blob', 'crystal', 'particles', 'crystal-ball'] as const;
      const currentIdx = renderers.indexOf(renderer as typeof renderers[number]);
      const nextIdx = (currentIdx + 1) % renderers.length;
      switchRenderer(renderers[nextIdx] ?? 'blob');
      break;
    }
    case 'cycleState': {
      const states = ['idle', 'listening', 'thinking'] as const;
      const current = kwami.value.getState() || 'idle';
      const currentIndex = states.indexOf(current as typeof states[number]);
      const nextIndex = (currentIndex + 1) % states.length;
      const nextState = states[nextIndex] || 'idle';
      kwami.value.setState(nextState);
      window.dispatchEvent(new CustomEvent('kwami:stateChanged', { detail: nextState }));
      break;
    }
    case 'pulse': {
      const ball = getCrystalBall();
      if (ball) ball.triggerPulse();
      break;
    }
  }
}

function testAction(action: InteractionAction) {
  executeAction(action);
}

// =====================================================
// SECTION-SPECIFIC RANDOMIZERS
// =====================================================

// Style
function randomizeStyle() {
  const styles: CrystalBallStyle[] = ['mystical', 'nebula', 'earth', 'fire', 'ocean'];
  style.value.preset = styles[Math.floor(Math.random() * styles.length)] ?? 'mystical';
}

// Colors
function randomizeColors() {
  colors.value.primary = randomHex();
  colors.value.secondary = randomHex();
}

// Volume (tutorial: iterations 48, depth 0.6, smoothing 0.2)
function randomizeVolume() {
  volume.value.iterations = Math.floor(randomInRange(32, 64, 4));
  volume.value.noiseScale = randomInRange(1.5, 4, 0.1);
  volume.value.smoothing = randomInRange(0.1, 0.4, 0.02);
  volume.value.depth = randomInRange(0.4, 0.8, 0.05);
}

// Animation (tutorial: speed 0.071, displacement 0.1)
function randomizeAnimation() {
  animation.value.displacementSpeed = randomInRange(0.03, 0.15, 0.005);
  animation.value.displacementStrength = randomInRange(0.05, 0.25, 0.01);
  animation.value.pulseSpeed = randomInRange(0.5, 2, 0.1);
  animation.value.pulseIntensity = randomInRange(0.01, 0.05, 0.005);
}

// Size (default 4)
function randomizeSize() {
  surface.value.scale = randomInRange(3, 6, 0.5);
}

// Surface
function randomizeSurface() {
  surface.value.roughness = randomInRange(0.05, 0.3, 0.01);
  surface.value.metalness = randomInRange(0, 0.3, 0.05);
  surface.value.envMapIntensity = randomInRange(0.5, 1, 0.05);
}

// Rotation
function randomizeRotation() {
  if (linkRotation.value) {
    const rot = randomInRange(-0.005, 0.005, 0.0005);
    animation.value.rotation = { x: rot, y: rot, z: rot };
  } else {
    animation.value.rotation = {
      x: randomInRange(-0.003, 0.003, 0.0005),
      y: randomInRange(0.0005, 0.005, 0.0005),
      z: randomInRange(-0.002, 0.002, 0.0005),
    };
  }
}

// Audio
function randomizeAudio() {
  audio.value.reactivity = randomInRange(0.5, 2, 0.1);
  audio.value.smoothing = randomInRange(0.7, 0.95, 0.01);
}

// Frequency Effects
function randomizeFrequencyEffects() {
  audio.value.frequencyEffects = {
    bassDisplacement: randomInRange(0.2, 0.8, 0.05),
    midColorBoost: randomInRange(0.1, 0.5, 0.05),
    highGlowBoost: randomInRange(0.2, 0.6, 0.05),
  };
}

// =====================================================
// LINKED WATCHERS
// =====================================================

watch(() => animation.value.rotation.x, (val) => {
  if (linkRotation.value) {
    animation.value.rotation.y = val;
    animation.value.rotation.z = val;
  }
});

// =====================================================
// INTERACTION WATCHERS
// =====================================================

watch(clickEvents, (config) => {
  const ball = getCrystalBall();
  if (!ball) return;

  ball.onClick = config.click.enabled && config.click.action !== 'none'
    ? () => executeAction(config.click.action)
    : () => {};

  ball.onDoubleClick = config.doubleClick.enabled && config.doubleClick.action !== 'none'
    ? () => executeAction(config.doubleClick.action)
    : () => {};

  if (config.rightClick.enabled && config.rightClick.action !== 'none') {
    ball.setRightClickCallback(() => executeAction(config.rightClick.action));
  } else {
    ball.setRightClickCallback(() => {});
  }

  if (config.doubleRightClick.enabled && config.doubleRightClick.action !== 'none') {
    ball.setDoubleRightClickCallback(() => executeAction(config.doubleRightClick.action));
  } else {
    ball.setDoubleRightClickCallback(() => {});
  }
}, { deep: true, immediate: true });
</script>

<template>
  <!-- ==================== STYLE PRESET ==================== -->
  <PanelSection title="Style Preset" icon="ph:magic-wand-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeStyle" title="Randomize style">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Visual style preset for the crystal ball</p>
    <div class="style-selector">
      <label
        v-for="s in (['mystical', 'nebula', 'earth', 'fire', 'ocean'] as const)"
        :key="s"
        class="style-option"
        :class="{ active: style.preset === s }"
      >
        <input type="radio" :value="s" v-model="style.preset" />
        <iconify-icon
          :icon="
            s === 'mystical' ? 'ph:sparkle-duotone' :
            s === 'nebula' ? 'ph:planet-duotone' :
            s === 'earth' ? 'ph:globe-duotone' :
            s === 'fire' ? 'ph:fire-duotone' :
            'ph:wave-duotone'
          "
          class="style-icon"
        ></iconify-icon>
        <span class="style-label">{{ s.charAt(0).toUpperCase() + s.slice(1) }}</span>
      </label>
    </div>
  </PanelSection>

  <!-- ==================== COLORS ==================== -->
  <PanelSection title="Colors" icon="ph:palette-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeColors" title="Randomize colors">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Gradient colors for the internal volume</p>
    <div class="row-2">
      <BaseColorPicker label="Primary" v-model="colors.primary" />
      <BaseColorPicker label="Secondary" v-model="colors.secondary" />
    </div>
  </PanelSection>

  <!-- ==================== SIZE ==================== -->
  <PanelSection title="Size" icon="ph:arrows-out-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeSize" title="Randomize size">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Overall crystal ball scale</p>
    <BaseSlider label="Scale" :min="1" :max="8" :step="0.5" v-model="surface.scale" />
  </PanelSection>

  <!-- ==================== VOLUME ==================== -->
  <PanelSection title="Volume" icon="ph:cube-transparent-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeVolume" title="Randomize volume">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Internal volumetric effect parameters</p>
    <div class="slider-group">
      <BaseSlider label="Iterations" :min="16" :max="64" :step="4" v-model="volume.iterations" />
      <BaseSlider label="Depth" :min="0.3" :max="1" :step="0.05" v-model="volume.depth" />
      <BaseSlider label="Smoothing" :min="0.05" :max="0.5" :step="0.01" v-model="volume.smoothing" />
      <BaseSlider label="Noise Scale" :min="1" :max="5" :step="0.1" v-model="volume.noiseScale" />
    </div>
  </PanelSection>

  <!-- ==================== ANIMATION ==================== -->
  <PanelSection title="Animation" icon="ph:wave-sine-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeAnimation" title="Randomize animation">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Internal animation and displacement effects</p>
    <div class="slider-group">
      <BaseSlider label="Speed" :min="0" :max="0.2" :step="0.001" v-model="animation.displacementSpeed" />
      <BaseSlider label="Displacement" :min="0" :max="0.5" :step="0.01" v-model="animation.displacementStrength" />
      <BaseSlider label="Pulse Speed" :min="0" :max="3" :step="0.1" v-model="animation.pulseSpeed" />
      <BaseSlider label="Pulse Intensity" :min="0" :max="0.1" :step="0.005" v-model="animation.pulseIntensity" />
    </div>
  </PanelSection>

  <!-- ==================== ROTATION ==================== -->
  <PanelSection title="Rotation" icon="ph:arrows-clockwise-duotone" collapsible>
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
    <p class="section-desc">Auto rotation speed on each axis</p>
    <div class="slider-group" :class="{ linked: linkRotation }">
      <BaseSlider label="X" :min="-0.005" :max="0.005" :step="0.0005" v-model="animation.rotation.x" />
      <BaseSlider v-if="!linkRotation" label="Y" :min="-0.005" :max="0.005" :step="0.0005" v-model="animation.rotation.y" />
      <BaseSlider v-if="!linkRotation" label="Z" :min="-0.005" :max="0.005" :step="0.0005" v-model="animation.rotation.z" />
    </div>
  </PanelSection>

  <!-- ==================== SURFACE ==================== -->
  <PanelSection title="Surface" icon="ph:sphere-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeSurface" title="Randomize surface">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Glass material properties</p>
    <div class="slider-group">
      <BaseSlider label="Roughness" :min="0" :max="0.5" :step="0.01" v-model="surface.roughness" />
      <BaseSlider label="Metalness" :min="0" :max="0.5" :step="0.05" v-model="surface.metalness" />
      <BaseSlider label="Env Map Intensity" :min="0" :max="1.5" :step="0.05" v-model="surface.envMapIntensity" />
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
        <BaseSelect
          label="Action"
          v-model="clickEvents.click.action"
          :options="actionOptions"
        />
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
        <BaseSelect
          label="Action"
          v-model="clickEvents.rightClick.action"
          :options="actionOptions"
        />
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
        <BaseSelect
          label="Action"
          v-model="clickEvents.doubleRightClick.action"
          :options="actionOptions"
        />
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
    <p class="section-desc">How the crystal ball responds to sound</p>
    
    <div class="toggle-row">
      <BaseToggle label="Enable Audio Effects" v-model="audio.enabled" />
    </div>
    
    <MicrophoneControl />
    <AudioVisualizer />

    <div v-if="audio.enabled" class="slider-group" style="margin-top: 12px">
      <BaseSlider 
        label="Reactivity" 
        :min="0" 
        :max="2" 
        :step="0.1" 
        v-model="audio.reactivity"
      />
      <BaseSlider
        label="Smoothing"
        :min="0.5"
        :max="0.99"
        :step="0.01"
        v-model="audio.smoothing"
      />
    </div>
  </PanelSection>

  <!-- ==================== FREQUENCY RESPONSE ==================== -->
  <PanelSection title="Frequency Response" icon="ph:equalizer-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeFrequencyEffects" title="Randomize frequency">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How different frequencies affect the crystal ball</p>
    
    <div class="slider-group">
      <BaseSlider 
        label="Bass (Displacement)" 
        :min="0" 
        :max="1" 
        :step="0.05" 
        v-model="audio.frequencyEffects.bassDisplacement"
      />
      <BaseSlider 
        label="Mid (Color)" 
        :min="0" 
        :max="1" 
        :step="0.05" 
        v-model="audio.frequencyEffects.midColorBoost"
      />
      <BaseSlider 
        label="High (Glow)" 
        :min="0" 
        :max="1" 
        :step="0.05" 
        v-model="audio.frequencyEffects.highGlowBoost"
      />
    </div>
  </PanelSection>
</template>

<style scoped>
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
  min-width: 70px;
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

/* Layout helpers */
.slider-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slider-group.linked {
  opacity: 0.9;
}

.row-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.row-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.toggle-row {
  margin-bottom: 12px;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Dice and Link buttons */
.dice-btn,
.link-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.dice-btn:hover,
.link-btn:hover {
  background: var(--surface-3);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.link-btn.active {
  background: var(--accent-glow);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.dice-btn iconify-icon,
.link-btn iconify-icon {
  font-size: 16px;
}

/* Interaction Styles */
.interaction-row {
  background: var(--surface-1);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 10px;
}

.interaction-row:last-child {
  margin-bottom: 0;
}

.interaction-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.interaction-header iconify-icon {
  font-size: 18px;
  color: var(--accent-primary);
}

.interaction-header span {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.interaction-config {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid var(--glass-border);
}

.interaction-config > :first-child {
  flex: 1;
}

.test-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--accent-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.test-btn:hover {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  transform: scale(1.05);
}

/* Hover config */
.hover-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}
</style>
