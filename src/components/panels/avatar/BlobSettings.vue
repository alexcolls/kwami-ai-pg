<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import type { BlobState, SkinSubtype } from '@/stores/avatar';

// Use defineModel for proper two-way binding (Vue 3.3+)
const state = defineModel<BlobState>('state', { required: true });

// Link toggles for XYZ controls
const linkSpikes = ref(false);
const linkAmplitude = ref(false);
const linkTime = ref(false);
const linkRotation = ref(false);

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

function randomizeTransitions() {
  state.value.transitionSpeed = randomInRange(0.02, 0.15, 0.01);
  state.value.thinkingDuration = randomInRange(3000, 15000, 500);
}

function randomizeTouch() {
  state.value.touchStrength = randomInRange(0.5, 2, 0.1);
  state.value.touchDuration = randomInRange(500, 2000, 100);
  state.value.maxTouchPoints = randomInRange(3, 10, 1);
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

// Color palette types with their harmonic formulas
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
      return [
        hslToHex(h, s, l),
        hslToHex(h + 180, s, l),
        hslToHex(h + 180, s * 0.7, l + 15),
      ];
    }
  },
  analogous: {
    label: 'Analogous',
    icon: 'ph:gradient-duotone',
    generate: () => {
      const h = Math.random() * 360;
      const s = 55 + Math.random() * 35;
      const l = 45 + Math.random() * 20;
      return [
        hslToHex(h, s, l),
        hslToHex(h + 30, s, l + 5),
        hslToHex(h - 30, s, l - 5),
      ];
    }
  },
  triadic: {
    label: 'Triadic',
    icon: 'ph:triangle-duotone',
    generate: () => {
      const h = Math.random() * 360;
      const s = 60 + Math.random() * 30;
      const l = 50 + Math.random() * 15;
      return [
        hslToHex(h, s, l),
        hslToHex(h + 120, s, l),
        hslToHex(h + 240, s, l),
      ];
    }
  },
  split: {
    label: 'Split',
    icon: 'ph:arrows-split-duotone',
    generate: () => {
      const h = Math.random() * 360;
      const s = 60 + Math.random() * 30;
      const l = 50 + Math.random() * 15;
      return [
        hslToHex(h, s, l),
        hslToHex(h + 150, s, l),
        hslToHex(h + 210, s, l),
      ];
    }
  },
  monochrome: {
    label: 'Mono',
    icon: 'ph:circle-duotone',
    generate: () => {
      const h = Math.random() * 360;
      const s = 50 + Math.random() * 40;
      return [
        hslToHex(h, s, 30 + Math.random() * 15),
        hslToHex(h, s * 0.8, 50 + Math.random() * 10),
        hslToHex(h, s * 0.6, 70 + Math.random() * 10),
      ];
    }
  },
  warm: {
    label: 'Warm',
    icon: 'ph:sun-duotone',
    generate: () => {
      const baseH = Math.random() * 60; // 0-60 (red to yellow)
      const s = 65 + Math.random() * 30;
      const l = 50 + Math.random() * 15;
      return [
        hslToHex(baseH, s, l),
        hslToHex(baseH + 20 + Math.random() * 20, s, l + 5),
        hslToHex(baseH - 10 + Math.random() * 10, s * 0.9, l - 5),
      ];
    }
  },
  cool: {
    label: 'Cool',
    icon: 'ph:snowflake-duotone',
    generate: () => {
      const baseH = 180 + Math.random() * 80; // 180-260 (cyan to blue-purple)
      const s = 55 + Math.random() * 35;
      const l = 45 + Math.random() * 20;
      return [
        hslToHex(baseH, s, l),
        hslToHex(baseH + 25 + Math.random() * 20, s, l + 5),
        hslToHex(baseH - 20 + Math.random() * 15, s * 0.85, l - 5),
      ];
    }
  },
  pastel: {
    label: 'Pastel',
    icon: 'ph:flower-duotone',
    generate: () => {
      const h1 = Math.random() * 360;
      const h2 = (h1 + 60 + Math.random() * 60) % 360;
      const h3 = (h2 + 60 + Math.random() * 60) % 360;
      return [
        hslToHex(h1, 40 + Math.random() * 20, 80 + Math.random() * 10),
        hslToHex(h2, 35 + Math.random() * 25, 78 + Math.random() * 12),
        hslToHex(h3, 38 + Math.random() * 22, 82 + Math.random() * 8),
      ];
    }
  },
  vibrant: {
    label: 'Vibrant',
    icon: 'ph:lightning-duotone',
    generate: () => {
      const h1 = Math.random() * 360;
      const h2 = (h1 + 90 + Math.random() * 60) % 360;
      const h3 = (h2 + 90 + Math.random() * 60) % 360;
      return [
        hslToHex(h1, 85 + Math.random() * 15, 50 + Math.random() * 10),
        hslToHex(h2, 80 + Math.random() * 20, 52 + Math.random() * 10),
        hslToHex(h3, 82 + Math.random() * 18, 48 + Math.random() * 12),
      ];
    }
  },
  sunset: {
    label: 'Sunset',
    icon: 'ph:sun-horizon-duotone',
    generate: () => {
      // Oranges, pinks, purples
      return [
        hslToHex(15 + Math.random() * 20, 80 + Math.random() * 20, 55 + Math.random() * 15),
        hslToHex(330 + Math.random() * 30, 70 + Math.random() * 25, 60 + Math.random() * 15),
        hslToHex(270 + Math.random() * 40, 50 + Math.random() * 30, 45 + Math.random() * 20),
      ];
    }
  },
  ocean: {
    label: 'Ocean',
    icon: 'ph:waves-duotone',
    generate: () => {
      // Blues, teals, aquas
      return [
        hslToHex(200 + Math.random() * 20, 70 + Math.random() * 25, 45 + Math.random() * 15),
        hslToHex(175 + Math.random() * 25, 60 + Math.random() * 30, 50 + Math.random() * 15),
        hslToHex(210 + Math.random() * 30, 55 + Math.random() * 35, 55 + Math.random() * 20),
      ];
    }
  },
  forest: {
    label: 'Forest',
    icon: 'ph:tree-duotone',
    generate: () => {
      // Greens, browns, earth tones
      return [
        hslToHex(90 + Math.random() * 40, 40 + Math.random() * 35, 35 + Math.random() * 20),
        hslToHex(30 + Math.random() * 20, 35 + Math.random() * 30, 30 + Math.random() * 20),
        hslToHex(70 + Math.random() * 50, 45 + Math.random() * 30, 45 + Math.random() * 20),
      ];
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
  <div>
    <PanelSection title="Skin">
      <template #actions>
        <button class="dice-btn" @click="randomizeSkin" title="Randomize skin">
          <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
        </button>
      </template>
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
    </PanelSection>

    <PanelSection title="Colors">
      <template #actions>
        <button class="dice-btn" @click="randomizeColors" title="Randomize colors">
          <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
        </button>
      </template>
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
    </PanelSection>

    <PanelSection title="Shape">
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

    <PanelSection title="Animation">
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
    </PanelSection>

    <PanelSection title="Appearance">
      <template #actions>
        <button class="dice-btn" @click="randomizeAppearance" title="Randomize appearance">
          <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
        </button>
      </template>
      <div class="slider-group">
        <BaseSlider label="Scale" :min="0.5" :max="10" :step="0.1" v-model="state.scale" />
        <BaseSlider label="Opacity" :min="0" :max="1" :step="0.01" v-model="state.opacity" />
        <BaseSlider label="Shininess" :min="1" :max="200" :step="1" v-model="state.shininess" />
        <BaseSlider label="Light Intensity" :min="0" :max="5" :step="0.1" v-model="state.lightIntensity" />
      </div>
      <div style="margin-top: 12px">
        <BaseToggle label="Wireframe Mode" v-model="state.wireframe" />
      </div>
    </PanelSection>

    <PanelSection title="Quality">
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

    <PanelSection title="Transitions">
      <template #actions>
        <button class="dice-btn" @click="randomizeTransitions" title="Randomize transitions">
          <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
        </button>
      </template>
      <div class="slider-group">
        <BaseSlider 
          label="Transition Speed" 
          :min="0.01" 
          :max="0.2" 
          :step="0.01" 
          v-model="state.transitionSpeed"
        />
        <BaseSlider 
          label="Thinking Duration" 
          :min="1000" 
          :max="30000" 
          :step="500" 
          v-model="state.thinkingDuration"
        />
      </div>
      <p class="hint">Controls how the blob animates between states</p>
    </PanelSection>

    <PanelSection title="Touch Interaction">
      <template #actions>
        <button class="dice-btn" @click="randomizeTouch" title="Randomize touch">
          <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
        </button>
      </template>
      <div class="slider-group">
        <BaseSlider 
          label="Touch Strength" 
          :min="0.1" 
          :max="3" 
          :step="0.1" 
          v-model="state.touchStrength"
        />
        <BaseSlider 
          label="Touch Duration (ms)" 
          :min="100" 
          :max="3000" 
          :step="100" 
          v-model="state.touchDuration"
        />
        <BaseSlider 
          label="Max Touch Points" 
          :min="1" 
          :max="20" 
          :step="1" 
          v-model="state.maxTouchPoints"
        />
      </div>
      <p class="hint">Controls how the blob reacts to clicks/touches</p>
    </PanelSection>
  </div>
</template>

<style scoped>
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
.dice-btn {
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
  font-size: 14px;
}

.dice-btn:hover {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: rotate(15deg) scale(1.1);
}

.dice-btn:active {
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
</style>
