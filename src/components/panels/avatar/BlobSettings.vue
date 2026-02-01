<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import { useBlobStore, type InteractionAction, type SkinType } from '@/stores/avatar.blob';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import AudioVisualizer from '../audio/AudioVisualizer.vue';
import MicrophoneControl from '../audio/MicrophoneControl.vue';

const { kwami, switchRenderer } = useKwami();
const blobStore = useBlobStore();
const { skin, shape, animation, clickEvents, cursorTouch, audio } = storeToRefs(blobStore);

// Link toggles for XYZ controls
const linkSpikes = ref(false);
const linkAmplitude = ref(false);
const linkTime = ref(false);
const linkRotation = ref(false);
const linkPosition = ref(false);

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
  { label: 'Move to Click', value: 'moveToClick' },
];

const cursorOptions = [
  { label: 'Pointer', value: 'pointer' },
  { label: 'Grab', value: 'grab' },
  { label: 'Crosshair', value: 'crosshair' },
  { label: 'Default', value: 'default' },
];

// =====================================================
// HELPERS
// =====================================================

function getBlob() {
  return kwami.value?.avatar.getBlob();
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
      const renderers = ['blob', 'crystal', 'particles'] as const;
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
      const blob = getBlob();
      if (blob) blob.triggerPulse();
      break;
    }
    case 'moveToClick': {
      const blob = getBlob();
      if (blob) {
        blob.moveToPosition(0.2 + Math.random() * 0.6, 0.2 + Math.random() * 0.6);
      }
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

// Skin Style
function randomizeStyle() {
  const skins: SkinType[] = ['poles', 'donut', 'vintage'];
  skin.value.type = skins[Math.floor(Math.random() * skins.length)] ?? 'poles';
}

// Colors
function randomizeColors() {
  skin.value.colors.x = randomHex();
  skin.value.colors.y = randomHex();
  skin.value.colors.z = randomHex();
}

// Surface properties
function randomizeSurface() {
  skin.value.opacity = randomInRange(0.7, 1, 0.01);
  skin.value.shininess = randomInRange(20, 150, 1);
  skin.value.lightIntensity = randomInRange(0, 2, 0.1);
  skin.value.resolution = randomInRange(64, 256, 8);
  skin.value.wireframe = Math.random() > 0.8;
  skin.value.glassMode = Math.random() > 0.85;
}

// Scale
function randomizeScale() {
  shape.value.scale = randomInRange(1.5, 5, 0.1);
}

// Position
function randomizePosition() {
  if (linkPosition.value) {
    const pos = randomInRange(0, 360, 1);
    shape.value.position = { x: pos, y: pos, z: pos };
  } else {
    shape.value.position = {
      x: randomInRange(0, 360, 1),
      y: randomInRange(0, 360, 1),
      z: randomInRange(0, 360, 1),
    };
  }
}

// Spikes
function randomizeSpikes() {
  if (linkSpikes.value) {
    const spike = randomInRange(0, 3, 0.05);
    shape.value.spikes = { x: spike, y: spike, z: spike };
  } else {
    shape.value.spikes = {
      x: randomInRange(0, 3, 0.05),
      y: randomInRange(0, 3, 0.05),
      z: randomInRange(0, 3, 0.05),
    };
  }
}

// Amplitude
function randomizeAmplitude() {
  if (linkAmplitude.value) {
    const amp = randomInRange(0.3, 1.5, 0.05);
    shape.value.amplitude = { x: amp, y: amp, z: amp };
  } else {
    shape.value.amplitude = {
      x: randomInRange(0.3, 1.5, 0.05),
      y: randomInRange(0.3, 1.5, 0.05),
      z: randomInRange(0.3, 1.5, 0.05),
    };
  }
}

// Animation Speed
function randomizeSpeed() {
  if (linkTime.value) {
    const time = randomInRange(0.5, 5, 0.1);
    animation.value.time = { x: time, y: time, z: time };
  } else {
    animation.value.time = {
      x: randomInRange(0.5, 5, 0.1),
      y: randomInRange(0.5, 5, 0.1),
      z: randomInRange(0.5, 5, 0.1),
    };
  }
}

// Rotation
function randomizeRotation() {
  if (linkRotation.value) {
    const rot = randomInRange(0, 0.01, 0.001);
    animation.value.rotation = { x: rot, y: rot, z: rot };
  } else {
    animation.value.rotation = {
      x: randomInRange(0, 0.01, 0.001),
      y: randomInRange(0, 0.01, 0.001),
      z: randomInRange(0, 0.01, 0.001),
    };
  }
}

// Breathing
function randomizeBreathing() {
  animation.value.breathing = randomInRange(0, 0.15, 0.005);
}

// Touch
function randomizeTouch() {
  cursorTouch.value.touch.strength = randomInRange(0.5, 2.5, 0.1);
  cursorTouch.value.touch.duration = randomInRange(500, 2000, 100);
  cursorTouch.value.touch.maxPoints = Math.floor(randomInRange(3, 12, 1));
}

// Audio
function randomizeAudio() {
  audio.value.reactivity = randomInRange(0.5, 3, 0.1);
  audio.value.sensitivity = randomInRange(0.02, 0.15, 0.005);
  audio.value.responseSpeed = randomInRange(0.3, 0.9, 0.05);
  audio.value.transientBoost = randomInRange(0.2, 0.8, 0.05);
}

// Frequency Bands
function randomizeFrequencyBands() {
  audio.value.frequencySpikes.bass = randomInRange(0.3, 1.5, 0.05);
  audio.value.frequencySpikes.mid = randomInRange(0.2, 1.2, 0.05);
  audio.value.frequencySpikes.high = randomInRange(0.1, 1.0, 0.05);
}

// =====================================================
// COLOR PALETTE SYSTEM
// =====================================================

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

type PaletteType = 'complementary' | 'analogous' | 'triadic' | 'split' | 'monochrome' | 'warm' | 'cool' | 'pastel' | 'vibrant' | 'sunset' | 'ocean' | 'forest';

const palettes: Record<PaletteType, { label: string; icon: string; generate: () => [string, string, string] }> = {
  complementary: {
    label: 'Complementary',
    icon: 'ph:circle-half-duotone',
    generate: () => {
      const h = Math.random() * 360, s = 60 + Math.random() * 30, l = 45 + Math.random() * 20;
      return [hslToHex(h, s, l), hslToHex(h + 180, s, l), hslToHex(h + 180, s * 0.7, l + 15)];
    }
  },
  analogous: {
    label: 'Analogous',
    icon: 'ph:gradient-duotone',
    generate: () => {
      const h = Math.random() * 360, s = 55 + Math.random() * 35, l = 45 + Math.random() * 20;
      return [hslToHex(h, s, l), hslToHex(h + 30, s, l + 5), hslToHex(h - 30, s, l - 5)];
    }
  },
  triadic: {
    label: 'Triadic',
    icon: 'ph:triangle-duotone',
    generate: () => {
      const h = Math.random() * 360, s = 60 + Math.random() * 30, l = 50 + Math.random() * 15;
      return [hslToHex(h, s, l), hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)];
    }
  },
  split: {
    label: 'Split',
    icon: 'ph:arrows-split-duotone',
    generate: () => {
      const h = Math.random() * 360, s = 60 + Math.random() * 30, l = 50 + Math.random() * 15;
      return [hslToHex(h, s, l), hslToHex(h + 150, s, l), hslToHex(h + 210, s, l)];
    }
  },
  monochrome: {
    label: 'Mono',
    icon: 'ph:circle-duotone',
    generate: () => {
      const h = Math.random() * 360, s = 50 + Math.random() * 40;
      return [hslToHex(h, s, 30 + Math.random() * 15), hslToHex(h, s * 0.8, 50 + Math.random() * 10), hslToHex(h, s * 0.6, 70 + Math.random() * 10)];
    }
  },
  warm: {
    label: 'Warm',
    icon: 'ph:sun-duotone',
    generate: () => {
      const h = Math.random() * 60, s = 65 + Math.random() * 30, l = 50 + Math.random() * 15;
      return [hslToHex(h, s, l), hslToHex(h + 20 + Math.random() * 20, s, l + 5), hslToHex(h - 10 + Math.random() * 10, s * 0.9, l - 5)];
    }
  },
  cool: {
    label: 'Cool',
    icon: 'ph:snowflake-duotone',
    generate: () => {
      const h = 180 + Math.random() * 80, s = 55 + Math.random() * 35, l = 45 + Math.random() * 20;
      return [hslToHex(h, s, l), hslToHex(h + 25 + Math.random() * 20, s, l + 5), hslToHex(h - 20 + Math.random() * 15, s * 0.85, l - 5)];
    }
  },
  pastel: {
    label: 'Pastel',
    icon: 'ph:flower-duotone',
    generate: () => {
      const h1 = Math.random() * 360, h2 = (h1 + 60 + Math.random() * 60) % 360, h3 = (h2 + 60 + Math.random() * 60) % 360;
      return [hslToHex(h1, 40 + Math.random() * 20, 80 + Math.random() * 10), hslToHex(h2, 35 + Math.random() * 25, 78 + Math.random() * 12), hslToHex(h3, 38 + Math.random() * 22, 82 + Math.random() * 8)];
    }
  },
  vibrant: {
    label: 'Vibrant',
    icon: 'ph:lightning-duotone',
    generate: () => {
      const h1 = Math.random() * 360, h2 = (h1 + 90 + Math.random() * 60) % 360, h3 = (h2 + 90 + Math.random() * 60) % 360;
      return [hslToHex(h1, 85 + Math.random() * 15, 50 + Math.random() * 10), hslToHex(h2, 80 + Math.random() * 20, 52 + Math.random() * 10), hslToHex(h3, 82 + Math.random() * 18, 48 + Math.random() * 12)];
    }
  },
  sunset: {
    label: 'Sunset',
    icon: 'ph:sun-horizon-duotone',
    generate: () => [hslToHex(15 + Math.random() * 20, 80 + Math.random() * 20, 55 + Math.random() * 15), hslToHex(330 + Math.random() * 30, 70 + Math.random() * 25, 60 + Math.random() * 15), hslToHex(270 + Math.random() * 40, 50 + Math.random() * 30, 45 + Math.random() * 20)]
  },
  ocean: {
    label: 'Ocean',
    icon: 'ph:waves-duotone',
    generate: () => [hslToHex(200 + Math.random() * 20, 70 + Math.random() * 25, 45 + Math.random() * 15), hslToHex(175 + Math.random() * 25, 60 + Math.random() * 30, 50 + Math.random() * 15), hslToHex(210 + Math.random() * 30, 55 + Math.random() * 35, 55 + Math.random() * 20)]
  },
  forest: {
    label: 'Forest',
    icon: 'ph:tree-duotone',
    generate: () => [hslToHex(90 + Math.random() * 40, 40 + Math.random() * 35, 35 + Math.random() * 20), hslToHex(30 + Math.random() * 20, 35 + Math.random() * 30, 30 + Math.random() * 20), hslToHex(70 + Math.random() * 50, 45 + Math.random() * 30, 45 + Math.random() * 20)]
  },
};

function applyPalette(type: PaletteType) {
  const [x, y, z] = palettes[type].generate();
  skin.value.colors.x = x;
  skin.value.colors.y = y;
  skin.value.colors.z = z;
}

// =====================================================
// LINKED VALUE WATCHERS
// =====================================================

watch(() => shape.value.spikes.x, (val) => {
  if (linkSpikes.value) {
    shape.value.spikes.y = val;
    shape.value.spikes.z = val;
  }
});

watch(() => shape.value.amplitude.x, (val) => {
  if (linkAmplitude.value) {
    shape.value.amplitude.y = val;
    shape.value.amplitude.z = val;
  }
});

watch(() => animation.value.time.x, (val) => {
  if (linkTime.value) {
    animation.value.time.y = val;
    animation.value.time.z = val;
  }
});

watch(() => animation.value.rotation.x, (val) => {
  if (linkRotation.value) {
    animation.value.rotation.y = val;
    animation.value.rotation.z = val;
  }
});

watch(() => shape.value.position.x, (val) => {
  if (linkPosition.value) {
    shape.value.position.y = val;
    shape.value.position.z = val;
  }
});

// =====================================================
// INTERACTION WATCHERS (sync to blob instance)
// =====================================================

watch(clickEvents, (config) => {
  const blob = getBlob();
  if (!blob) return;

  blob.onClick = config.click.enabled && config.click.action !== 'none'
    ? () => executeAction(config.click.action)
    : () => {};

  blob.onDoubleClick = config.doubleClick.enabled && config.doubleClick.action !== 'none'
    ? () => executeAction(config.doubleClick.action)
    : () => {};

  if (config.rightClick.enabled && config.rightClick.action !== 'none') {
    blob.setRightClickCallback(() => executeAction(config.rightClick.action));
  } else {
    blob.setRightClickCallback(() => {});
  }

  if (config.doubleRightClick.enabled && config.doubleRightClick.action !== 'none') {
    blob.setDoubleRightClickCallback(() => executeAction(config.doubleRightClick.action));
  } else {
    blob.setDoubleRightClickCallback(() => {});
  }
}, { deep: true, immediate: true });

// =====================================================
// COMPUTED
// =====================================================

const skinGradient = computed(() => {
  const { x, y, z } = skin.value.colors;
  return {
    poles: `conic-gradient(${x}, ${y}, ${z}, ${x})`,
    donut: `linear-gradient(180deg, ${x} 0%, ${y} 50%, ${z} 100%)`,
    vintage: `radial-gradient(circle, ${x}, ${y}, ${z})`,
  };
});
</script>

<template>
  <!-- ==================== SKIN STYLE ==================== -->
  <PanelSection title="Skin Style" icon="ph:paint-brush-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeStyle" title="Randomize style">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Choose how colors blend across the surface</p>
    <div class="skin-selector">
      <label
        v-for="skinType in (['poles', 'donut', 'vintage'] as const)"
        :key="skinType"
        class="skin-option"
        :class="{ active: skin.type === skinType }"
      >
        <input type="radio" :value="skinType" v-model="skin.type" />
        <span class="skin-preview" :style="{ background: skinGradient[skinType] }"></span>
        <span class="skin-label">{{ skinType.charAt(0).toUpperCase() + skinType.slice(1) }}</span>
      </label>
    </div>
  </PanelSection>

  <!-- ==================== COLOR PALETTE ==================== -->
  <PanelSection title="Color Palette" icon="ph:palette-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeColors" title="Randomize colors">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Primary colors for each axis gradient</p>
    <div class="row-3">
      <BaseColorPicker label="X" v-model="skin.colors.x" />
      <BaseColorPicker label="Y" v-model="skin.colors.y" />
      <BaseColorPicker label="Z" v-model="skin.colors.z" />
    </div>
    <div class="color-palettes">
      <span class="palette-label">Quick palettes:</span>
      <div class="palette-grid">
        <button 
          v-for="(palette, key) in palettes" 
          :key="key"
          class="palette-btn" 
          @click="applyPalette(key as PaletteType)" 
          :title="palette.label"
        >
          <iconify-icon :icon="palette.icon"></iconify-icon>
        </button>
      </div>
    </div>
  </PanelSection>

  <!-- ==================== MATERIAL ==================== -->
  <PanelSection title="Material" icon="ph:sphere-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeSurface" title="Randomize material">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Surface appearance and rendering quality</p>
    <div class="slider-group">
      <BaseSlider label="Opacity" :min="0" :max="1" :step="0.01" v-model="skin.opacity" />
      <BaseSlider label="Shininess" :min="1" :max="200" :step="1" v-model="skin.shininess" />
      <BaseSlider label="Light Intensity" :min="0" :max="5" :step="0.1" v-model="skin.lightIntensity" />
      <BaseSlider label="Resolution" :min="32" :max="512" :step="8" v-model="skin.resolution" />
    </div>
    <div class="toggle-group" style="margin-top: 12px">
      <BaseToggle label="Wireframe" v-model="skin.wireframe" />
      <BaseToggle label="Glass Effect" v-model="skin.glassMode" />
    </div>
  </PanelSection>

  <!-- ==================== SIZE ==================== -->
  <PanelSection title="Size" icon="ph:arrows-out-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeScale" title="Randomize size">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Overall blob scale in the scene</p>
    <BaseSlider label="Scale" :min="0.5" :max="10" :step="0.1" v-model="shape.scale" />
  </PanelSection>

  <!-- ==================== ORIENTATION ==================== -->
  <PanelSection title="Orientation" icon="ph:compass-duotone" collapsible>
    <template #actions>
      <button 
        class="link-btn" 
        :class="{ active: linkPosition }" 
        @click="linkPosition = !linkPosition"
        title="Link XYZ values"
      >
        <iconify-icon :icon="linkPosition ? 'ph:link-duotone' : 'ph:link-break-duotone'"></iconify-icon>
      </button>
      <button class="dice-btn" @click="randomizePosition" title="Randomize orientation">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Starting rotation angle in degrees</p>
    <div class="slider-group" :class="{ linked: linkPosition }">
      <BaseSlider label="X (°)" :min="0" :max="360" :step="1" v-model="shape.position.x" />
      <BaseSlider v-if="!linkPosition" label="Y (°)" :min="0" :max="360" :step="1" v-model="shape.position.y" />
      <BaseSlider v-if="!linkPosition" label="Z (°)" :min="0" :max="360" :step="1" v-model="shape.position.z" />
    </div>
  </PanelSection>

  <!-- ==================== DEFORMATION ==================== -->
  <PanelSection title="Deformation" icon="ph:asterisk-duotone" collapsible>
    <template #actions>
      <button 
        class="link-btn" 
        :class="{ active: linkSpikes }" 
        @click="linkSpikes = !linkSpikes"
        title="Link XYZ values"
      >
        <iconify-icon :icon="linkSpikes ? 'ph:link-duotone' : 'ph:link-break-duotone'"></iconify-icon>
      </button>
      <button class="dice-btn" @click="randomizeSpikes" title="Randomize deformation">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Spike intensity on each axis</p>
    <div class="slider-group" :class="{ linked: linkSpikes }">
      <BaseSlider label="X" :min="0" :max="8" :step="0.05" v-model="shape.spikes.x" />
      <BaseSlider v-if="!linkSpikes" label="Y" :min="0" :max="8" :step="0.05" v-model="shape.spikes.y" />
      <BaseSlider v-if="!linkSpikes" label="Z" :min="0" :max="8" :step="0.05" v-model="shape.spikes.z" />
    </div>
  </PanelSection>

  <!-- ==================== WAVE AMPLITUDE ==================== -->
  <PanelSection title="Wave Amplitude" icon="ph:wave-sine-duotone" collapsible>
    <template #actions>
      <button 
        class="link-btn" 
        :class="{ active: linkAmplitude }" 
        @click="linkAmplitude = !linkAmplitude"
        title="Link XYZ values"
      >
        <iconify-icon :icon="linkAmplitude ? 'ph:link-duotone' : 'ph:link-break-duotone'"></iconify-icon>
      </button>
      <button class="dice-btn" @click="randomizeAmplitude" title="Randomize amplitude">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Wave movement intensity per axis</p>
    <div class="slider-group" :class="{ linked: linkAmplitude }">
      <BaseSlider label="X" :min="0.1" :max="2" :step="0.05" v-model="shape.amplitude.x" />
      <BaseSlider v-if="!linkAmplitude" label="Y" :min="0.1" :max="2" :step="0.05" v-model="shape.amplitude.y" />
      <BaseSlider v-if="!linkAmplitude" label="Z" :min="0.1" :max="2" :step="0.05" v-model="shape.amplitude.z" />
    </div>
  </PanelSection>

  <!-- ==================== ANIMATION SPEED ==================== -->
  <PanelSection title="Animation Speed" icon="ph:timer-duotone" collapsible>
    <template #actions>
      <button 
        class="link-btn" 
        :class="{ active: linkTime }" 
        @click="linkTime = !linkTime"
        title="Link XYZ values"
      >
        <iconify-icon :icon="linkTime ? 'ph:link-duotone' : 'ph:link-break-duotone'"></iconify-icon>
      </button>
      <button class="dice-btn" @click="randomizeSpeed" title="Randomize speed">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How fast the blob morphs on each axis</p>
    <div class="slider-group" :class="{ linked: linkTime }">
      <BaseSlider label="X" :min="0.1" :max="10" :step="0.1" v-model="animation.time.x" />
      <BaseSlider v-if="!linkTime" label="Y" :min="0.1" :max="10" :step="0.1" v-model="animation.time.y" />
      <BaseSlider v-if="!linkTime" label="Z" :min="0.1" :max="10" :step="0.1" v-model="animation.time.z" />
    </div>
  </PanelSection>

  <!-- ==================== AUTO ROTATION ==================== -->
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
    <p class="section-desc">Continuous spin speed per axis</p>
    <div class="slider-group" :class="{ linked: linkRotation }">
      <BaseSlider label="X" :min="0" :max="0.02" :step="0.001" v-model="animation.rotation.x" />
      <BaseSlider v-if="!linkRotation" label="Y" :min="0" :max="0.02" :step="0.001" v-model="animation.rotation.y" />
      <BaseSlider v-if="!linkRotation" label="Z" :min="0" :max="0.02" :step="0.001" v-model="animation.rotation.z" />
    </div>
  </PanelSection>

  <!-- ==================== IDLE BREATHING ==================== -->
  <PanelSection title="Idle Breathing" icon="ph:wind-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeBreathing" title="Randomize breathing">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Subtle pulsing when idle</p>
    <BaseSlider 
      label="Intensity" 
      :min="0" :max="0.2" :step="0.005" 
      v-model="animation.breathing"
    />
  </PanelSection>

  <!-- ==================== CLICK ACTIONS ==================== -->
  <PanelSection title="Click Actions" icon="ph:hand-tap-duotone" collapsible>
    <p class="section-desc">Trigger actions on mouse clicks</p>
    <div class="interaction-row">
      <div class="interaction-header">
        <iconify-icon icon="ph:hand-tap-duotone"></iconify-icon>
        <span>Single Click</span>
        <BaseToggle v-model="clickEvents.click.enabled" size="sm" />
      </div>
      <div class="interaction-config" v-if="clickEvents.click.enabled">
        <BaseSelect label="Action" v-model="clickEvents.click.action" :options="actionOptions" />
        <button class="test-btn" @click="testAction(clickEvents.click.action)" title="Test">
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
        <button class="test-btn" @click="testAction(clickEvents.doubleClick.action)" title="Test">
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
        <button class="test-btn" @click="testAction(clickEvents.rightClick.action)" title="Test">
          <iconify-icon icon="ph:play-fill"></iconify-icon>
        </button>
      </div>
    </div>

    <div class="interaction-row">
      <div class="interaction-header">
        <iconify-icon icon="ph:mouse-duotone"></iconify-icon>
        <span>Double Right Click</span>
        <BaseToggle v-model="clickEvents.doubleRightClick.enabled" size="sm" />
      </div>
      <div class="interaction-config" v-if="clickEvents.doubleRightClick.enabled">
        <BaseSelect label="Action" v-model="clickEvents.doubleRightClick.action" :options="actionOptions" />
        <button class="test-btn" @click="testAction(clickEvents.doubleRightClick.action)" title="Test">
          <iconify-icon icon="ph:play-fill"></iconify-icon>
        </button>
      </div>
    </div>
  </PanelSection>

  <!-- ==================== HOVER EFFECTS ==================== -->
  <PanelSection title="Hover Effects" icon="ph:cursor-duotone" collapsible>
    <p class="section-desc">Visual feedback on mouse hover</p>
    <div class="interaction-row">
      <div class="interaction-header">
        <iconify-icon icon="ph:cursor-duotone"></iconify-icon>
        <span>Enable Hover</span>
        <BaseToggle v-model="cursorTouch.hover.enabled" size="sm" />
      </div>
      <div class="interaction-config" v-if="cursorTouch.hover.enabled">
        <BaseToggle label="Highlight" v-model="cursorTouch.hover.highlightOnHover" />
        <BaseSelect label="Cursor" v-model="cursorTouch.hover.cursorStyle" :options="cursorOptions" />
      </div>
    </div>
  </PanelSection>

  <!-- ==================== DRAG INTERACTION ==================== -->
  <PanelSection title="Drag Interaction" icon="ph:hand-grabbing-duotone" collapsible>
    <p class="section-desc">Rotate the blob by dragging</p>
    <div class="interaction-row">
      <div class="interaction-header">
        <iconify-icon icon="ph:hand-grabbing-duotone"></iconify-icon>
        <span>Enable Drag</span>
        <BaseToggle v-model="cursorTouch.drag.enabled" size="sm" />
      </div>
      <div class="interaction-config" v-if="cursorTouch.drag.enabled">
        <BaseSlider label="Sensitivity" :min="0.1" :max="3" :step="0.1" v-model="cursorTouch.drag.sensitivity" />
      </div>
    </div>
  </PanelSection>

  <!-- ==================== TOUCH PHYSICS ==================== -->
  <PanelSection title="Touch Physics" icon="ph:hand-pointing-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeTouch" title="Randomize touch">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How the blob reacts to touch/click</p>
    <div class="slider-group">
      <BaseSlider label="Strength" :min="0.1" :max="3" :step="0.1" v-model="cursorTouch.touch.strength" />
      <BaseSlider label="Duration (ms)" :min="100" :max="3000" :step="100" v-model="cursorTouch.touch.duration" />
      <BaseSlider label="Max Points" :min="1" :max="20" :step="1" v-model="cursorTouch.touch.maxPoints" />
    </div>
  </PanelSection>

  <!-- ==================== AUDIO REACTIVITY ==================== -->
  <PanelSection title="Audio Reactivity" icon="ph:microphone-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeAudio" title="Randomize audio">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">React to microphone or audio input</p>
    <div class="toggle-row">
      <BaseToggle label="Enable Audio Effects" v-model="audio.enabled" />
    </div>
    
    <MicrophoneControl />
    <AudioVisualizer />

    <div v-if="audio.enabled" class="slider-group" style="margin-top: 12px">
      <BaseSlider label="Reactivity" :min="0" :max="5" :step="0.1" v-model="audio.reactivity" />
      <BaseSlider label="Sensitivity" :min="0" :max="0.3" :step="0.005" v-model="audio.sensitivity" />
    </div>
  </PanelSection>

  <!-- ==================== AUDIO DYNAMICS ==================== -->
  <PanelSection v-if="audio.enabled" title="Audio Dynamics" icon="ph:chart-line-up-duotone" collapsible>
    <p class="section-desc">Response speed and transient handling</p>
    <div class="slider-group">
      <BaseSlider label="Response Speed" :min="0" :max="1" :step="0.05" v-model="audio.responseSpeed" />
      <BaseSlider label="Transient Boost" :min="0" :max="1" :step="0.05" v-model="audio.transientBoost" />
    </div>
  </PanelSection>

  <!-- ==================== FREQUENCY RESPONSE ==================== -->
  <PanelSection v-if="audio.enabled" title="Frequency Response" icon="ph:equalizer-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeFrequencyBands" title="Randomize frequencies">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How different frequencies affect the blob</p>
    <div class="slider-group">
      <BaseSlider label="Bass (20-250Hz)" :min="0" :max="2" :step="0.05" v-model="audio.frequencySpikes.bass" />
      <BaseSlider label="Mid (250Hz-2kHz)" :min="0" :max="2" :step="0.05" v-model="audio.frequencySpikes.mid" />
      <BaseSlider label="High (2-8kHz)" :min="0" :max="2" :step="0.05" v-model="audio.frequencySpikes.high" />
    </div>
  </PanelSection>

  <!-- ==================== TIME MODULATION ==================== -->
  <PanelSection v-if="audio.enabled" title="Time Modulation" icon="ph:clock-duotone" collapsible>
    <p class="section-desc">Audio-driven animation speed changes</p>
    <BaseToggle label="Enable Time Effects" v-model="audio.timeModulation.enabled" />
    <div v-if="audio.timeModulation.enabled" class="slider-group" style="margin-top: 12px">
      <BaseSlider label="Mid Influence" :min="0" :max="0.5" :step="0.01" v-model="audio.timeModulation.mid" />
      <BaseSlider label="High Influence" :min="0" :max="0.5" :step="0.01" v-model="audio.timeModulation.high" />
      <BaseSlider label="Ultra Influence" :min="0" :max="0.5" :step="0.01" v-model="audio.timeModulation.ultra" />
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

/* Skin Selector */
.skin-selector {
  display: flex;
  gap: 8px;
}

.skin-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 8px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skin-option:hover {
  background: var(--surface-2);
  transform: translateY(-2px);
}

.skin-option.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  box-shadow: 0 4px 20px var(--accent-glow);
}

.skin-option input {
  display: none;
}

.skin-preview {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.skin-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-secondary);
}

.skin-option.active .skin-label {
  color: var(--text-primary);
}

/* Dice Buttons */
.dice-btn, .dice-btn-sm {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dice-btn {
  width: 24px;
  height: 24px;
  font-size: 14px;
}

.dice-btn-sm {
  width: 20px;
  height: 20px;
  font-size: 12px;
  background: transparent;
  border-color: transparent;
}

.dice-btn:hover, .dice-btn-sm:hover {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: rotate(15deg) scale(1.1);
}

/* Color Palettes */
.color-palettes {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

.palette-label {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.palette-btn {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.palette-btn:hover {
  background: var(--surface-2);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: scale(1.1);
}

/* Link Button (for XYZ linking) */

.link-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.link-btn:hover {
  background: var(--surface-2);
  color: var(--text-secondary);
}

.link-btn.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Slider Group */
.slider-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slider-group.linked {
  padding: 8px;
  background: var(--accent-glow);
  border-radius: 8px;
  border: 1px solid rgba(0, 217, 255, 0.2);
}

/* Row layouts */
.row-3 {
  display: flex;
  gap: 12px;
}

.row-3 > * {
  flex: 1;
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
  padding-top: 8px;
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
  transition: all 0.15s ease;
}

.test-btn:hover {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  transform: scale(1.05);
}

.toggle-row {
  margin-bottom: 12px;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
