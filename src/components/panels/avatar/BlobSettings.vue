<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useKwami } from '@/composables/useKwami';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import type { BlobState, SkinSubtype, InteractionAction } from '@/stores/avatar';
import AudioVisualizer from '../audio/AudioVisualizer.vue';
import MicrophoneControl from '../audio/MicrophoneControl.vue';

// Use defineModel for proper two-way binding (Vue 3.3+)
const state = defineModel<BlobState>('state', { required: true });
const { kwami, switchRenderer } = useKwami();

// Link toggles for XYZ controls
const linkSpikes = ref(false);
const linkAmplitude = ref(false);
const linkTime = ref(false);
const linkRotation = ref(false);

// Interaction Logic
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

function executeAction(action: InteractionAction) {
  if (!kwami.value) return;

  switch (action) {
    case 'toggleListening':
      const currentState = kwami.value.getState() || 'idle';
      if (currentState === 'listening') {
        kwami.value.setState('idle');
      } else {
        kwami.value.setState('listening');
      }
      break;
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
      switchRenderer(renderers[nextIdx]);
      break;
    }
    case 'cycleState':
      const states = ['idle', 'listening', 'thinking'] as const;
      const current = kwami.value.getState() || 'idle';
      const currentIndex = states.indexOf(current as typeof states[number]);
      const nextIndex = (currentIndex + 1) % states.length;
      const nextState = states[nextIndex] || 'idle';
      kwami.value.setState(nextState);
      window.dispatchEvent(new CustomEvent('kwami:stateChanged', { detail: nextState }));
      break;
    case 'pulse':
      const blob = kwami.value.avatar.getBlob();
      if (blob) blob.triggerPulse();
      break;
    case 'moveToClick': {
      const blob = kwami.value.avatar.getBlob();
      if (blob) {
        const randomX = 0.2 + Math.random() * 0.6;
        const randomY = 0.2 + Math.random() * 0.6;
        blob.moveToPosition(randomX, randomY);
      }
      break;
    }
  }
}

function testAction(action: InteractionAction) {
  executeAction(action);
}

// Watchers for Interaction
watch(() => state.value.interaction, (config) => {
  const blob = kwami.value?.avatar.getBlob();
  if (!blob) return;

  // Apply click handlers
  if (config.click.enabled && config.click.action !== 'none') {
    blob.onClick = () => executeAction(config.click.action);
  } else {
    blob.onClick = () => {};
  }

  if (config.doubleClick.enabled && config.doubleClick.action !== 'none') {
    blob.onDoubleClick = () => executeAction(config.doubleClick.action);
  } else {
    blob.onDoubleClick = () => {};
  }

  // Right clicks
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

// Audio Helpers
function getBlob() {
  return kwami.value?.avatar.getBlob();
}

function getScene() {
  return kwami.value?.avatar.getScene();
}

// Watchers for Audio Effects
watch(() => state.value.audioEffects, (s) => {
  const blob = getBlob();
  if (blob) {
    blob.audioEffects.enabled = s.enabled;
    blob.audioEffects.reactivity = s.reactivity;
    blob.audioEffects.sensitivity = s.sensitivity;
    blob.audioEffects.breathing = s.breathing;
    blob.audioEffects.responseSpeed = s.responseSpeed;
    blob.audioEffects.transientBoost = s.transientBoost;
    blob.audioEffects.bassSpike = s.bassSpike;
    blob.audioEffects.midSpike = s.midSpike;
    blob.audioEffects.highSpike = s.highSpike;
    blob.audioEffects.timeEnabled = s.timeEnabled;
    blob.audioEffects.midTime = s.midTime;
    blob.audioEffects.highTime = s.highTime;
    blob.audioEffects.ultraTime = s.ultraTime;
  }
}, { deep: true, immediate: true });

// Watchers for Scene (Camera & Lighting)
watch(
  () => state.value.scene.camera.fov,
  (v) => {
    const s = getScene();
    if (s) {
      s.camera.fov = v;
      s.camera.updateProjectionMatrix();
    }
  }
);

watch(
  () => state.value.scene.camera.distance,
  (v) => {
    const s = getScene();
    if (s) {
      s.camera.position.z = v;
      s.camera.lookAt(0, 0, 0);
    }
  }
);

function updateAvatarLighting() {
  const blob = getBlob();
  if (!blob) return;
  
  const { top, bottom } = state.value.scene.lighting;
  
  if (typeof blob.setLightPosition === 'function') {
    const topWeight = top;
    const bottomWeight = bottom;
    const totalWeight = topWeight + bottomWeight + 0.01;
    
    const y = ((topWeight * 500) - (bottomWeight * 500)) / totalWeight;
    const z = ((topWeight * 2000) + (bottomWeight * 400)) / totalWeight;
    
    blob.setLightPosition(0, y, z);
  }
}

function updateAvatarGlow() {
  const blob = getBlob();
  if (!blob) return;
  
  if (typeof blob.setLightIntensity === 'function') {
    const ambient = state.value.scene.lighting.ambient;
    const glowIntensity = ambient * 1.25;
    blob.setLightIntensity(glowIntensity);
  }
}

watch(
  () => state.value.scene.lighting.top,
  (v) => {
    const s = getScene();
    if (s) s.lights.top.intensity = v;
    updateAvatarLighting();
  }
);

watch(
  () => state.value.scene.lighting.bottom,
  (v) => {
    const s = getScene();
    if (s) s.lights.bottom.intensity = v;
    updateAvatarLighting();
  }
);

watch(
  () => state.value.scene.lighting.ambient,
  (v) => {
    const s = getScene();
    if (s) s.lights.ambient.intensity = v;
    updateAvatarGlow();
  }
);

// Initial sync on mount
onMounted(() => {
  const s = getScene();
  if (s) {
    // Sync initial values if needed, or just let defaults apply
    // For now we assume store defaults are good or synced from ScenePanel previously
    updateAvatarLighting();
    updateAvatarGlow();
  }
});

// Color helpers
function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function randomInRange(min: number, max: number, step: number = 0.01): number {
  const range = (max - min) / step;
  return min + Math.round(Math.random() * range) * step;
}

// Randomizers for each section
function randomizeSkin() {
  const skins: SkinSubtype[] = ['poles', 'donut', 'vintage'];
  state.value.skin = skins[Math.floor(Math.random() * skins.length)] as SkinSubtype;
}

function randomizeColors() {
  state.value.colors.x = randomHex();
  state.value.colors.y = randomHex();
  state.value.colors.z = randomHex();
}

function randomizeShape() {
  const spike = randomInRange(0, 2, 0.05);
  const amp = randomInRange(0.3, 1.5, 0.05);
  if (linkSpikes.value) {
    state.value.spikes = { x: spike, y: spike, z: spike };
  } else {
    state.value.spikes = {
      x: randomInRange(0, 2, 0.05),
      y: randomInRange(0, 2, 0.05),
      z: randomInRange(0, 2, 0.05),
    };
  }
  if (linkAmplitude.value) {
    state.value.amplitude = { x: amp, y: amp, z: amp };
  } else {
    state.value.amplitude = {
      x: randomInRange(0.3, 1.5, 0.05),
      y: randomInRange(0.3, 1.5, 0.05),
      z: randomInRange(0.3, 1.5, 0.05),
    };
  }
}

function randomizeAnimation() {
  const time = randomInRange(0.5, 5, 0.1);
  const rot = randomInRange(0, 0.01, 0.001);
  if (linkTime.value) {
    state.value.time = { x: time, y: time, z: time };
  } else {
    state.value.time = {
      x: randomInRange(0.5, 5, 0.1),
      y: randomInRange(0.5, 5, 0.1),
      z: randomInRange(0.5, 5, 0.1),
    };
  }
  if (linkRotation.value) {
    state.value.rotation = { x: rot, y: rot, z: rot };
  } else {
    state.value.rotation = {
      x: randomInRange(0, 0.01, 0.001),
      y: randomInRange(0, 0.01, 0.001),
      z: randomInRange(0, 0.01, 0.001),
    };
  }
}

function randomizeAppearance() {
  state.value.scale = randomInRange(1.5, 5, 0.1);
  state.value.opacity = randomInRange(0.7, 1, 0.01);
  state.value.shininess = randomInRange(20, 150, 1);
  state.value.lightIntensity = randomInRange(0, 2, 0.1);
}

function randomizeQuality() {
  state.value.resolution = randomInRange(64, 256, 8);
}

// Color harmony helpers
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360; // Normalize hue
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

// Color palette types
type PaletteType = 'complementary' | 'analogous' | 'triadic' | 'split' | 'monochrome' | 'warm' | 'cool' | 'pastel' | 'vibrant' | 'sunset' | 'ocean' | 'forest';

const palettes: Record<PaletteType, { 
  label: string; 
  icon: string; 
  generate: () => [string, string, string];
}> = {
  complementary: {
    label: 'Complementary',
    icon: 'ph:circle-half-duotone',
    generate: () => {
      const h = Math.random() * 360;
      const s = 60 + Math.random() * 30;
      const l = 45 + Math.random() * 20;
      return [hslToHex(h, s, l), hslToHex(h + 180, s, l), hslToHex(h + 180, s * 0.7, l + 15)];
    }
  },
  analogous: {
    label: 'Analogous',
    icon: 'ph:gradient-duotone',
    generate: () => {
      const h = Math.random() * 360;
      const s = 55 + Math.random() * 35;
      const l = 45 + Math.random() * 20;
      return [hslToHex(h, s, l), hslToHex(h + 30, s, l + 5), hslToHex(h - 30, s, l - 5)];
    }
  },
  triadic: {
    label: 'Triadic',
    icon: 'ph:triangle-duotone',
    generate: () => {
      const h = Math.random() * 360;
      const s = 60 + Math.random() * 30;
      const l = 50 + Math.random() * 15;
      return [hslToHex(h, s, l), hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)];
    }
  },
  split: {
    label: 'Split',
    icon: 'ph:arrows-split-duotone',
    generate: () => {
      const h = Math.random() * 360;
      const s = 60 + Math.random() * 30;
      const l = 50 + Math.random() * 15;
      return [hslToHex(h, s, l), hslToHex(h + 150, s, l), hslToHex(h + 210, s, l)];
    }
  },
  monochrome: {
    label: 'Mono',
    icon: 'ph:circle-duotone',
    generate: () => {
      const h = Math.random() * 360;
      const s = 50 + Math.random() * 40;
      return [hslToHex(h, s, 30 + Math.random() * 15), hslToHex(h, s * 0.8, 50 + Math.random() * 10), hslToHex(h, s * 0.6, 70 + Math.random() * 10)];
    }
  },
  warm: {
    label: 'Warm',
    icon: 'ph:sun-duotone',
    generate: () => {
      const baseH = Math.random() * 60;
      const s = 65 + Math.random() * 30;
      const l = 50 + Math.random() * 15;
      return [hslToHex(baseH, s, l), hslToHex(baseH + 20 + Math.random() * 20, s, l + 5), hslToHex(baseH - 10 + Math.random() * 10, s * 0.9, l - 5)];
    }
  },
  cool: {
    label: 'Cool',
    icon: 'ph:snowflake-duotone',
    generate: () => {
      const baseH = 180 + Math.random() * 80;
      const s = 55 + Math.random() * 35;
      const l = 45 + Math.random() * 20;
      return [hslToHex(baseH, s, l), hslToHex(baseH + 25 + Math.random() * 20, s, l + 5), hslToHex(baseH - 20 + Math.random() * 15, s * 0.85, l - 5)];
    }
  },
  pastel: {
    label: 'Pastel',
    icon: 'ph:flower-duotone',
    generate: () => {
      const h1 = Math.random() * 360;
      const h2 = (h1 + 60 + Math.random() * 60) % 360;
      const h3 = (h2 + 60 + Math.random() * 60) % 360;
      return [hslToHex(h1, 40 + Math.random() * 20, 80 + Math.random() * 10), hslToHex(h2, 35 + Math.random() * 25, 78 + Math.random() * 12), hslToHex(h3, 38 + Math.random() * 22, 82 + Math.random() * 8)];
    }
  },
  vibrant: {
    label: 'Vibrant',
    icon: 'ph:lightning-duotone',
    generate: () => {
      const h1 = Math.random() * 360;
      const h2 = (h1 + 90 + Math.random() * 60) % 360;
      const h3 = (h2 + 90 + Math.random() * 60) % 360;
      return [hslToHex(h1, 85 + Math.random() * 15, 50 + Math.random() * 10), hslToHex(h2, 80 + Math.random() * 20, 52 + Math.random() * 10), hslToHex(h3, 82 + Math.random() * 18, 48 + Math.random() * 12)];
    }
  },
  sunset: {
    label: 'Sunset',
    icon: 'ph:sun-horizon-duotone',
    generate: () => {
      return [hslToHex(15 + Math.random() * 20, 80 + Math.random() * 20, 55 + Math.random() * 15), hslToHex(330 + Math.random() * 30, 70 + Math.random() * 25, 60 + Math.random() * 15), hslToHex(270 + Math.random() * 40, 50 + Math.random() * 30, 45 + Math.random() * 20)];
    }
  },
  ocean: {
    label: 'Ocean',
    icon: 'ph:waves-duotone',
    generate: () => {
      return [hslToHex(200 + Math.random() * 20, 70 + Math.random() * 25, 45 + Math.random() * 15), hslToHex(175 + Math.random() * 25, 60 + Math.random() * 30, 50 + Math.random() * 15), hslToHex(210 + Math.random() * 30, 55 + Math.random() * 35, 55 + Math.random() * 20)];
    }
  },
  forest: {
    label: 'Forest',
    icon: 'ph:tree-duotone',
    generate: () => {
      return [hslToHex(90 + Math.random() * 40, 40 + Math.random() * 35, 35 + Math.random() * 20), hslToHex(30 + Math.random() * 20, 35 + Math.random() * 30, 30 + Math.random() * 20), hslToHex(70 + Math.random() * 50, 45 + Math.random() * 30, 45 + Math.random() * 20)];
    }
  },
};

function applyPalette(type: PaletteType) {
  const [x, y, z] = palettes[type].generate();
  state.value.colors.x = x;
  state.value.colors.y = y;
  state.value.colors.z = z;
}

// Linked value watchers
watch(() => state.value.spikes.x, (val) => {
  if (linkSpikes.value) {
    state.value.spikes.y = val;
    state.value.spikes.z = val;
  }
});

watch(() => state.value.amplitude.x, (val) => {
  if (linkAmplitude.value) {
    state.value.amplitude.y = val;
    state.value.amplitude.z = val;
  }
});

watch(() => state.value.time.x, (val) => {
  if (linkTime.value) {
    state.value.time.y = val;
    state.value.time.z = val;
  }
});

watch(() => state.value.rotation.x, (val) => {
  if (linkRotation.value) {
    state.value.rotation.y = val;
    state.value.rotation.z = val;
  }
});

// Skin preview gradient
const skinGradient = computed(() => {
  const { x, y, z } = state.value.colors;
  return {
    poles: `conic-gradient(${x}, ${y}, ${z}, ${x})`,
    donut: `linear-gradient(180deg, ${x} 0%, ${y} 50%, ${z} 100%)`,
    vintage: `radial-gradient(circle, ${x}, ${y}, ${z})`,
  };
});
</script>

<template>
    <!-- Appearance Section -->
    <PanelSection title="Appearance" collapsible>
      <template #actions>
        <div class="action-row">
          <button class="dice-btn" @click="randomizeAppearance" title="Randomize appearance">
            <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
          </button>
        </div>
      </template>
      
      <!-- Skin -->
      <div class="subsection">
        <div class="subsection-header">
          <span class="subsection-title">Skin Style</span>
          <button class="dice-btn-sm" @click="randomizeSkin" title="Randomize skin">
            <iconify-icon icon="ph:dice-one-duotone"></iconify-icon>
          </button>
        </div>
        <div class="skin-selector">
          <label
            v-for="skin in ['poles', 'donut', 'vintage']"
            :key="skin"
            class="skin-option"
            :class="{ active: state.skin === skin }"
          >
            <input type="radio" :value="skin" v-model="state.skin" />
            <span class="skin-preview" :style="{ background: skinGradient[skin as keyof typeof skinGradient] }"></span>
            <span class="skin-label">{{ skin.charAt(0).toUpperCase() + skin.slice(1) }}</span>
          </label>
        </div>
      </div>

      <!-- Colors -->
      <div class="subsection">
        <div class="subsection-header">
          <span class="subsection-title">Colors</span>
          <button class="dice-btn-sm" @click="randomizeColors" title="Randomize colors">
            <iconify-icon icon="ph:dice-one-duotone"></iconify-icon>
          </button>
        </div>
        <div class="row-3">
          <BaseColorPicker label="X Axis" v-model="state.colors.x" />
          <BaseColorPicker label="Y Axis" v-model="state.colors.y" />
          <BaseColorPicker label="Z Axis" v-model="state.colors.z" />
        </div>
        <div class="color-palettes">
          <span class="palette-label">Palettes:</span>
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
      </div>

      <!-- Properties -->
      <div class="subsection">
        <span class="subsection-title">Properties</span>
        <div class="slider-group">
          <BaseSlider label="Scale" :min="0.5" :max="10" :step="0.1" v-model="state.scale" />
          <BaseSlider label="Opacity" :min="0" :max="1" :step="0.01" v-model="state.opacity" />
          <BaseSlider label="Shininess" :min="1" :max="200" :step="1" v-model="state.shininess" />
          <BaseSlider label="Light Intensity" :min="0" :max="5" :step="0.1" v-model="state.lightIntensity" />
        </div>
        <div class="toggle-group" style="margin-top: 12px">
          <BaseToggle label="Wireframe Mode" v-model="state.wireframe" />
          <BaseToggle label="Glass Effect" v-model="state.glassMode" />
        </div>
      </div>
    </PanelSection>

    <!-- Camera & Lighting Section -->
    <PanelSection title="Scene" collapsible>
      <div class="subsection">
        <span class="subsection-title">Camera</span>
        <div class="slider-group">
          <BaseSlider label="FOV" :min="30" :max="150" :step="1" v-model="state.scene.camera.fov" />
          <BaseSlider label="Distance" :min="2" :max="20" :step="0.5" v-model="state.scene.camera.distance" />
        </div>
      </div>
      
      <div class="subsection">
        <span class="subsection-title">Lighting</span>
        <div class="slider-group">
          <BaseSlider label="Top" :min="0" :max="2" :step="0.1" v-model="state.scene.lighting.top" />
          <BaseSlider label="Bottom" :min="0" :max="2" :step="0.1" v-model="state.scene.lighting.bottom" />
          <BaseSlider label="Ambient" :min="0" :max="2" :step="0.1" v-model="state.scene.lighting.ambient" />
        </div>
      </div>
    </PanelSection>

    <!-- Shape Section -->
    <PanelSection title="Shape" collapsible>
      <template #actions>
        <button class="dice-btn" @click="randomizeShape" title="Randomize shape">
          <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
        </button>
      </template>
      
      <div class="linked-sliders">
        <div class="link-header">
          <span class="link-title">Spikes</span>
          <button 
            class="link-btn" 
            :class="{ active: linkSpikes }" 
            @click="linkSpikes = !linkSpikes"
            title="Link XYZ values"
          >
            <iconify-icon :icon="linkSpikes ? 'ph:link-duotone' : 'ph:link-break-duotone'"></iconify-icon>
          </button>
        </div>
        <div class="slider-group" :class="{ linked: linkSpikes }">
          <BaseSlider label="X" :min="0" :max="8" :step="0.05" v-model="state.spikes.x" />
          <BaseSlider v-if="!linkSpikes" label="Y" :min="0" :max="8" :step="0.05" v-model="state.spikes.y" />
          <BaseSlider v-if="!linkSpikes" label="Z" :min="0" :max="8" :step="0.05" v-model="state.spikes.z" />
        </div>
      </div>

      <div class="linked-sliders">
        <div class="link-header">
          <span class="link-title">Amplitude</span>
          <button 
            class="link-btn" 
            :class="{ active: linkAmplitude }" 
            @click="linkAmplitude = !linkAmplitude"
            title="Link XYZ values"
          >
            <iconify-icon :icon="linkAmplitude ? 'ph:link-duotone' : 'ph:link-break-duotone'"></iconify-icon>
          </button>
        </div>
        <div class="slider-group" :class="{ linked: linkAmplitude }">
          <BaseSlider label="X" :min="0.1" :max="2" :step="0.05" v-model="state.amplitude.x" />
          <BaseSlider v-if="!linkAmplitude" label="Y" :min="0.1" :max="2" :step="0.05" v-model="state.amplitude.y" />
          <BaseSlider v-if="!linkAmplitude" label="Z" :min="0.1" :max="2" :step="0.05" v-model="state.amplitude.z" />
        </div>
      </div>
    </PanelSection>

    <!-- Animation Section -->
    <PanelSection title="Animation" collapsible>
      <template #actions>
        <button class="dice-btn" @click="randomizeAnimation" title="Randomize animation">
          <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
        </button>
      </template>
      
      <div class="linked-sliders">
        <div class="link-header">
          <span class="link-title">Time Scale</span>
          <button 
            class="link-btn" 
            :class="{ active: linkTime }" 
            @click="linkTime = !linkTime"
            title="Link XYZ values"
          >
            <iconify-icon :icon="linkTime ? 'ph:link-duotone' : 'ph:link-break-duotone'"></iconify-icon>
          </button>
        </div>
        <div class="slider-group" :class="{ linked: linkTime }">
          <BaseSlider label="X" :min="0.1" :max="10" :step="0.1" v-model="state.time.x" />
          <BaseSlider v-if="!linkTime" label="Y" :min="0.1" :max="10" :step="0.1" v-model="state.time.y" />
          <BaseSlider v-if="!linkTime" label="Z" :min="0.1" :max="10" :step="0.1" v-model="state.time.z" />
        </div>
      </div>

      <div class="linked-sliders">
        <div class="link-header">
          <span class="link-title">Rotation Speed</span>
          <button 
            class="link-btn" 
            :class="{ active: linkRotation }" 
            @click="linkRotation = !linkRotation"
            title="Link XYZ values"
          >
            <iconify-icon :icon="linkRotation ? 'ph:link-duotone' : 'ph:link-break-duotone'"></iconify-icon>
          </button>
        </div>
        <div class="slider-group" :class="{ linked: linkRotation }">
          <BaseSlider label="X" :min="0" :max="0.02" :step="0.001" v-model="state.rotation.x" />
          <BaseSlider v-if="!linkRotation" label="Y" :min="0" :max="0.02" :step="0.001" v-model="state.rotation.y" />
          <BaseSlider v-if="!linkRotation" label="Z" :min="0" :max="0.02" :step="0.001" v-model="state.rotation.z" />
        </div>
      </div>

      <div class="linked-sliders">
        <div class="link-header">
          <span class="link-title">Start Position (°)</span>
        </div>
        <div class="slider-group">
          <BaseSlider label="X" :min="0" :max="360" :step="1" v-model="state.startRotation.x" />
          <BaseSlider label="Y" :min="0" :max="360" :step="1" v-model="state.startRotation.y" />
          <BaseSlider label="Z" :min="0" :max="360" :step="1" v-model="state.startRotation.z" />
        </div>
        <p class="hint">Initial rotation angle in degrees</p>
      </div>

      <div class="subsection">
        <span class="subsection-title">Transitions</span>
        <div class="slider-group">
          <BaseSlider 
            label="Speed" 
            :min="0.01" 
            :max="0.2" 
            :step="0.01" 
            v-model="state.transitionSpeed"
            hint="How fast state transitions animate"
          />
          <BaseSlider 
            label="Thinking Duration" 
            :min="1000" 
            :max="30000" 
            :step="500" 
            v-model="state.thinkingDuration"
            hint="Auto-stop thinking after this duration (ms)"
          />
        </div>
      </div>
    </PanelSection>

    <!-- Interaction Section -->
    <PanelSection title="Interaction" collapsible>
      <!-- Click Actions -->
      <div class="interaction-row">
        <div class="interaction-header">
          <iconify-icon icon="ph:hand-tap-duotone"></iconify-icon>
          <span>Single Click</span>
          <BaseToggle v-model="state.interaction.click.enabled" size="sm" />
        </div>
        <div class="interaction-config" v-if="state.interaction.click.enabled">
          <BaseSelect
            label="Action"
            v-model="state.interaction.click.action"
            :options="actionOptions"
          />
          <button class="test-btn" @click="testAction(state.interaction.click.action)" title="Test Action">
            <iconify-icon icon="ph:play-fill"></iconify-icon>
          </button>
        </div>
      </div>

      <div class="interaction-row">
        <div class="interaction-header">
          <iconify-icon icon="ph:hand-duotone"></iconify-icon>
          <span>Double Click</span>
          <BaseToggle v-model="state.interaction.doubleClick.enabled" size="sm" />
        </div>
        <div class="interaction-config" v-if="state.interaction.doubleClick.enabled">
          <BaseSelect
            label="Action"
            v-model="state.interaction.doubleClick.action"
            :options="actionOptions"
          />
          <button class="test-btn" @click="testAction(state.interaction.doubleClick.action)" title="Test Action">
            <iconify-icon icon="ph:play-fill"></iconify-icon>
          </button>
        </div>
      </div>

      <div class="interaction-row">
        <div class="interaction-header">
          <iconify-icon icon="ph:mouse-right-click-duotone"></iconify-icon>
          <span>Right Click</span>
          <BaseToggle v-model="state.interaction.rightClick.enabled" size="sm" />
        </div>
        <div class="interaction-config" v-if="state.interaction.rightClick.enabled">
          <BaseSelect
            label="Action"
            v-model="state.interaction.rightClick.action"
            :options="actionOptions"
          />
          <button class="test-btn" @click="testAction(state.interaction.rightClick.action)" title="Test Action">
            <iconify-icon icon="ph:play-fill"></iconify-icon>
          </button>
        </div>
      </div>

      <div class="interaction-row">
        <div class="interaction-header">
          <iconify-icon icon="ph:mouse-duotone"></iconify-icon>
          <span>Double Right Click</span>
          <BaseToggle v-model="state.interaction.doubleRightClick.enabled" size="sm" />
        </div>
        <div class="interaction-config" v-if="state.interaction.doubleRightClick.enabled">
          <BaseSelect
            label="Action"
            v-model="state.interaction.doubleRightClick.action"
            :options="actionOptions"
          />
          <button class="test-btn" @click="testAction(state.interaction.doubleRightClick.action)" title="Test Action">
            <iconify-icon icon="ph:play-fill"></iconify-icon>
          </button>
        </div>
      </div>

      <!-- Hover Settings -->
      <div class="hover-settings">
        <div class="interaction-header">
            <iconify-icon icon="ph:cursor-duotone"></iconify-icon>
            <span>Hover Effects</span>
            <BaseToggle v-model="state.interaction.hover.enabled" size="sm" />
        </div>
        <div class="interaction-config" v-if="state.interaction.hover.enabled">
            <BaseToggle label="Highlight" v-model="state.interaction.hover.highlightOnHover" />
            <BaseSelect
                label="Cursor"
                v-model="state.interaction.hover.cursorStyle"
                :options="cursorOptions"
            />
        </div>
      </div>

      <!-- Drag Settings -->
      <div class="drag-settings">
        <div class="interaction-header">
          <iconify-icon icon="ph:hand-grabbing-duotone"></iconify-icon>
          <span>Drag to Rotate</span>
          <BaseToggle v-model="state.interaction.drag.enabled" size="sm" />
        </div>
        <div class="interaction-config" v-if="state.interaction.drag.enabled">
          <BaseSlider
            label="Sensitivity"
            :min="0.1"
            :max="3"
            :step="0.1"
            v-model="state.interaction.drag.sensitivity"
          />
        </div>
      </div>

      <!-- Touch Settings -->
      <div class="subsection">
        <span class="subsection-title">Touch Physics</span>
        <div class="slider-group">
          <BaseSlider 
            label="Strength" 
            :min="0.1" 
            :max="3" 
            :step="0.1" 
            v-model="state.touchStrength"
            hint="How much the blob deforms on touch"
          />
          <BaseSlider 
            label="Duration" 
            :min="100" 
            :max="3000" 
            :step="100" 
            v-model="state.touchDuration"
            hint="How long the touch effect lasts (ms)"
          />
          <BaseSlider 
            label="Max Points" 
            :min="1" 
            :max="20" 
            :step="1" 
            v-model="state.maxTouchPoints"
            hint="Maximum simultaneous touch points"
          />
        </div>
      </div>
    </PanelSection>

    <!-- Audio Reactivity Section -->
    <PanelSection title="Audio Reactivity" collapsible>
      <div class="toggle-row">
        <BaseToggle label="Enable Audio Effects" v-model="state.audioEffects.enabled" />
      </div>
      
      <MicrophoneControl />
      <AudioVisualizer />

      <div v-if="state.audioEffects.enabled" class="slider-group" style="margin-top: 12px">
        <BaseSlider 
          label="Reactivity" 
          :min="0" :max="5" :step="0.1" 
          v-model="state.audioEffects.reactivity"
          hint="Overall audio response intensity"
        />
        <BaseSlider 
          label="Sensitivity" 
          :min="0" :max="0.3" :step="0.005" 
          v-model="state.audioEffects.sensitivity"
          hint="Minimum audio level to trigger response"
        />
        <BaseSlider 
          label="Breathing" 
          :min="0" :max="0.2" :step="0.005" 
          v-model="state.audioEffects.breathing"
          hint="Subtle idle animation amplitude"
        />
        
        <div class="subsection-title">Response Dynamics</div>
        <BaseSlider 
          label="Speed" 
          :min="0" :max="1" :step="0.05" 
          v-model="state.audioEffects.responseSpeed"
          hint="How quickly the blob responds to audio"
        />
        <BaseSlider 
          label="Transient" 
          :min="0" :max="1" :step="0.05" 
          v-model="state.audioEffects.transientBoost"
          hint="Boost for sudden audio peaks"
        />
        
        <div class="subsection-title">Frequency Spikes</div>
        <p class="hint" style="margin-bottom: 8px">How much each frequency band affects spike intensity</p>
        <BaseSlider 
          label="Bass (20-250Hz)" 
          :min="0" :max="2" :step="0.05" 
          v-model="state.audioEffects.bassSpike"
        />
        <BaseSlider 
          label="Mid (250-2000Hz)" 
          :min="0" :max="2" :step="0.05" 
          v-model="state.audioEffects.midSpike"
        />
        <BaseSlider 
          label="High (2000-8000Hz)" 
          :min="0" :max="2" :step="0.05" 
          v-model="state.audioEffects.highSpike"
        />
        
        <div class="subsection-title">Time Modulation</div>
        <BaseToggle label="Enable Time Effects" v-model="state.audioEffects.timeEnabled" />
        <p v-if="state.audioEffects.timeEnabled" class="hint" style="margin: 8px 0">Audio-driven animation speed variation</p>
        <div v-if="state.audioEffects.timeEnabled" class="slider-group">
          <BaseSlider 
            label="Mid Time" 
            :min="0" :max="0.5" :step="0.01" 
            v-model="state.audioEffects.midTime"
            hint="Mid frequencies affect animation speed"
          />
          <BaseSlider 
            label="High Time" 
            :min="0" :max="0.5" :step="0.01" 
            v-model="state.audioEffects.highTime"
            hint="High frequencies affect animation speed"
          />
          <BaseSlider 
            label="Ultra Time" 
            :min="0" :max="0.5" :step="0.01" 
            v-model="state.audioEffects.ultraTime"
            hint="Ultra-high frequencies (>8kHz) effect"
          />
        </div>
      </div>
    </PanelSection>

    <!-- Quality Section -->
    <PanelSection title="Quality" collapsible>
      <template #actions>
        <button class="dice-btn" @click="randomizeQuality" title="Randomize quality">
          <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
        </button>
      </template>
      <div class="slider-group">
        <BaseSlider 
          label="Resolution" 
          :min="32" 
          :max="512" 
          :step="8" 
          v-model="state.resolution"
        />
      </div>
      <p class="hint">Higher = more detail, lower performance</p>
    </PanelSection>
</template>

<style scoped>
/* Subsection styling */
.subsection {
  margin-bottom: 16px;
}

.subsection:last-child {
  margin-bottom: 0;
}

.subsection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.subsection-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

/* Dice Button */
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

.dice-btn:active, .dice-btn-sm:active {
  transform: rotate(180deg) scale(0.95);
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

.palette-btn:active {
  transform: scale(0.95);
}

/* Linked Sliders */
.linked-sliders {
  margin-bottom: 16px;
}

.linked-sliders:last-child {
  margin-bottom: 0;
}

.link-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.link-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
}

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

/* Color Grid */
.row-3 {
  display: flex;
  gap: 12px;
}

.row-3 > * {
  flex: 1;
}

/* Hint text */
.hint {
  margin-top: 8px;
  font-size: 10px;
  color: var(--text-muted);
  font-style: italic;
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
  margin-bottom: 8px;
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

.hover-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

.toggle-row {
  margin-bottom: 12px;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drag-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}
</style>
