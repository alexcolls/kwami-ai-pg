<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import SceneEffects from './SceneEffects.vue';
import { sceneImagePresets, type SceneImagePreset } from '@/presets/scene/image-presets';
import { sceneVideoPresets, type SceneVideoPreset } from '@/presets/scene/video-presets';
import { sceneHdriPresets, type SceneHdriPreset } from '@/presets/scene/hdri-presets';
import { hslToHex, hexToRgb } from '@/utils/color';
import { useColorPalettes, type PaletteType } from '@/composables/avatar/useColorPalettes';
import {
  useSceneStore,
  type GradientStop,
  type GradientOrb,
  type PaletteBrightness,
} from '@/stores/scene';

// Use store for state persistence
const sceneStore = useSceneStore();
const { background } = storeToRefs(sceneStore);

// Re-export types for backwards compatibility
export type { GradientStop, GradientOrb };
export type { BackgroundConfig } from '@/stores/scene';

function randomInRange(min: number, max: number, step: number = 1): number {
  const range = (max - min) / step;
  return min + Math.round(Math.random() * range) * step;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateOrbId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const { palettes, generatePalette } = useColorPalettes();

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d > 1e-6) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/** Map generator colors to dark / light overlay ranges while keeping hue */
function remappedForBrightness(hex: string, brightness: PaletteBrightness): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  if (brightness === 'dark') {
    const s = Math.min(100, hsl.s * 0.9 + 12);
    const l = randomFloat(9, 26);
    return hslToHex(hsl.h, s, l);
  }
  const s = Math.min(100, hsl.s * 0.95 + 5);
  const l = randomFloat(72, 90);
  return hslToHex(hsl.h, s, l);
}

/**
 * Same generators as blob XYZ. Each generatePalette() call yields 3 related colors;
 * for N stops/orbs we run more batches so every slot gets a fresh roll (not only 3 repeated).
 */
function colorsFromNamedPalette(
  type: PaletteType,
  count: number,
  brightness: PaletteBrightness,
): string[] {
  if (count <= 0) return [];
  const out: string[] = [];
  while (out.length < count) {
    const [a, b, c] = generatePalette(type);
    for (const raw of [a, b, c]) {
      if (out.length >= count) break;
      out.push(remappedForBrightness(raw, brightness));
    }
  }
  return out;
}

function generatePaletteColors(count: number): string[] {
  const g = background.value?.gradient;
  if (!g || count <= 0) return [];
  const brightness: PaletteBrightness = g.paletteBrightness === 'light' ? 'light' : 'dark';
  return colorsFromNamedPalette(g.paletteType, count, brightness);
}

function nextPaletteColor(existingHexes: string[]): string {
  const g = background.value?.gradient;
  if (!g) return '#0a0a15';
  const n = existingHexes.length + 1;
  const colors = colorsFromNamedPalette(
    g.paletteType,
    n,
    g.paletteBrightness === 'light' ? 'light' : 'dark',
  );
  return colors[n - 1] ?? colors[0] ?? '#0a0a15';
}

function applyQuickPalette(type: PaletteType) {
  if (!background.value?.gradient) return;
  background.value.gradient.paletteType = type;
  applyPaletteToOverlay(type);
}

function applyPaletteToOverlay(type: PaletteType) {
  const gr = background.value?.gradient;
  if (!gr) return;
  const brightness: PaletteBrightness = gr.paletteBrightness === 'light' ? 'light' : 'dark';
  if (gr.type === 'solid') {
    const arr = colorsFromNamedPalette(type, 1, brightness);
    if (arr[0]) gr.solidColor = arr[0];
    return;
  }
  if (gr.type === 'orbs') {
    const colors = colorsFromNamedPalette(type, gr.orbs.length, brightness);
    gr.orbs.forEach((orb, i) => {
      const c = colors[i];
      if (c) orb.color = c;
    });
    return;
  }
  const colors = colorsFromNamedPalette(type, gr.stops.length, brightness);
  gr.stops.forEach((stop, i) => {
    const c = colors[i];
    if (c) stop.color = c;
  });
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const imageFileInput = ref<HTMLInputElement | null>(null);
const videoFileInput = ref<HTMLInputElement | null>(null);
const customMediaPanels = reactive({
  image: false,
  video: false,
  hdri: false,
});

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    sceneStore.setImageUrl(url);
  }
}

function handleVideoUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    sceneStore.setVideoUrl(url);
  }
}

function triggerImageUpload() {
  imageFileInput.value?.click();
}

function triggerVideoUpload() {
  videoFileInput.value?.click();
}

// Preset selection
function selectImagePreset(preset: SceneImagePreset) {
  sceneStore.setImageUrl(preset.url);
}

function selectVideoPreset(preset: SceneVideoPreset) {
  sceneStore.setVideoUrl(preset.url);
}

function selectHdriPreset(preset: SceneHdriPreset) {
  sceneStore.setHdriUrl(preset.url);
}

// Check if a preset is selected
function isImagePresetSelected(preset: SceneImagePreset): boolean {
  return background.value?.media?.image?.url === preset.url;
}

function isVideoPresetSelected(preset: SceneVideoPreset): boolean {
  return background.value?.media?.video?.url === preset.url;
}

function isHdriPresetSelected(preset: SceneHdriPreset): boolean {
  return background.value?.media?.hdri?.url === preset.url;
}

// Gradient stop management
function addGradientStop() {
  if (!background.value?.gradient) return;
  const stops = background.value.gradient.stops;
  // Find the middle point between existing stops
  const lastPos = stops[stops.length - 1]?.position ?? 100;
  const secondLastPos = stops[stops.length - 2]?.position ?? 0;
  const newPos = Math.min(100, Math.round((lastPos + secondLastPos) / 2));
  
  // Insert at appropriate position
  const newStop: GradientStop = {
    color: nextPaletteColor(stops.map((s) => s.color)),
    position: newPos,
    opacity: 1,
  };
  stops.push(newStop);
  // Sort by position
  stops.sort((a, b) => a.position - b.position);
}

function removeGradientStop(index: number) {
  if (!background.value?.gradient) return;
  if (background.value.gradient.stops.length > 2) {
    background.value.gradient.stops.splice(index, 1);
  }
}

// Orb management
function addOrb() {
  if (!background.value?.gradient) return;
  const orbs = background.value.gradient.orbs;
  const newOrb: GradientOrb = {
    id: generateOrbId(),
    x: randomInRange(10, 90),
    y: randomInRange(10, 90),
    size: randomInRange(28, 62),
    color: nextPaletteColor(orbs.map((o) => o.color)),
    opacity: randomInRange(45, 80) / 100,
    softness: randomInRange(70, 95),
  };
  background.value.gradient.orbs.push(newOrb);
}

function removeOrb(index: number) {
  if (!background.value?.gradient) return;
  if (background.value.gradient.orbs.length > 1) {
    background.value.gradient.orbs.splice(index, 1);
  }
}

// Randomize functions
function randomizeColors() {
  if (!background.value?.gradient) return;
  const gr = background.value.gradient;
  if (gr.type === 'solid') {
    gr.solidColor = generatePaletteColors(1)[0] ?? gr.solidColor;
    return;
  }
  const colors = generatePaletteColors(gr.stops.length);
  gr.stops.forEach((stop, i) => {
    const c = colors[i];
    if (c) stop.color = c;
  });
}

function randomizePositions() {
  if (!background.value?.gradient) return;
  const { type } = background.value.gradient;
  
  if (type === 'linear') {
    background.value.gradient.angle = randomInRange(0, 360, 15);
  } else if (type === 'radial') {
    background.value.gradient.radialCenter.x = randomInRange(20, 80);
    background.value.gradient.radialCenter.y = randomInRange(20, 80);
    background.value.gradient.radialSize = randomInRange(60, 150, 10);
  } else if (type === 'orbs') {
    for (const orb of background.value.gradient.orbs) {
      orb.x = randomInRange(12, 88);
      orb.y = randomInRange(12, 88);
      orb.size = randomInRange(30, 68);
      orb.softness = randomInRange(72, 98);
    }
  }
}

function randomizeOrbs() {
  if (!background.value?.gradient) return;
  const orbs = background.value.gradient.orbs;
  const colors = generatePaletteColors(orbs.length);
  orbs.forEach((orb, i) => {
    orb.x = randomInRange(12, 88);
    orb.y = randomInRange(12, 88);
    orb.size = randomInRange(30, 68);
    const c = colors[i];
    if (c) orb.color = c;
    orb.opacity = randomInRange(40, 82) / 100;
    orb.softness = randomInRange(72, 98);
  });
}

function randomizeAll() {
  if (!background.value?.gradient) return;
  randomizeColors();
  randomizePositions();
  if (background.value.gradient.type === 'orbs') {
    randomizeOrbs();
  }
}

const fitOptions = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Stretch', value: 'stretch' },
];

const blendModeOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Multiply', value: 'multiply' },
  { label: 'Screen', value: 'screen' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Soft Light', value: 'soft-light' },
];

function orbCssGradient(orb: GradientOrb): string {
  const a = orb.opacity;
  const soft = orb.softness / 100;
  const c = orb.color;
  return `radial-gradient(circle at ${orb.x}% ${orb.y}%, ${hexToRgba(c, a)} 0%, ${hexToRgba(c, a * 0.92)} ${orb.size * 0.1}%, ${hexToRgba(c, a * (0.7 + soft * 0.15))} ${orb.size * 0.25}%, ${hexToRgba(c, a * (0.35 + soft * 0.1))} ${orb.size * 0.45}%, ${hexToRgba(c, a * (0.12 + soft * 0.05))} ${orb.size * 0.65}%, ${hexToRgba(c, a * 0.03)} ${orb.size * 0.85}%, transparent ${orb.size}%)`;
}

function getOrbPreviewStyle(orb: GradientOrb) {
  const preview = { ...orb, x: 50, y: 50, size: Math.max(60, orb.size * 1.2) };
  return {
    backgroundColor: '#030308',
    backgroundImage: orbCssGradient(preview),
  };
}

const gradientPreviewStyle = computed(() => {
  if (!background.value?.gradient) return {};
  const { type, solidColor, angle, radialCenter, stops, orbs } = background.value.gradient;

  if (type === 'solid') {
    return { background: solidColor };
  }

  if (type === 'orbs') {
    return {
      backgroundColor: '#030308',
      backgroundImage: orbs.map(orbCssGradient).join(', '),
      backgroundBlendMode: orbs.map(() => 'screen').join(', '),
    };
  }
  
  const colorStops = stops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(s => {
      const r = parseInt(s.color.slice(1, 3), 16);
      const g = parseInt(s.color.slice(3, 5), 16);
      const b = parseInt(s.color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${s.opacity}) ${s.position}%`;
    })
    .join(', ');

  if (type === 'radial') {
    return {
      background: `radial-gradient(circle at ${radialCenter.x}% ${radialCenter.y}%, ${colorStops})`,
    };
  } else {
    return {
      background: `linear-gradient(${angle}deg, ${colorStops})`,
    };
  }
});
</script>

<template>
  <!-- MEDIA LAYER (BACK) -->
  <PanelSection title="Media Background" icon="ph:image-duotone" collapsible>
    <div class="bg-type-selector">
      <label class="bg-option" :class="{ active: background.media.type === 'none' }">
        <input type="radio" value="none" v-model="background.media.type" />
        <iconify-icon icon="ph:x-circle-duotone"></iconify-icon>
        <span>None</span>
      </label>
      <label class="bg-option" :class="{ active: background.media.type === 'image' }">
        <input type="radio" value="image" v-model="background.media.type" />
        <iconify-icon icon="ph:image-duotone"></iconify-icon>
        <span>Image</span>
      </label>
      <label class="bg-option" :class="{ active: background.media.type === 'video' }">
        <input type="radio" value="video" v-model="background.media.type" />
        <iconify-icon icon="ph:video-duotone"></iconify-icon>
        <span>Video</span>
      </label>
      <label class="bg-option" :class="{ active: background.media.type === 'hdri' }">
        <input type="radio" value="hdri" v-model="background.media.type" />
        <iconify-icon icon="ph:globe-duotone"></iconify-icon>
        <span>HDRI</span>
      </label>
    </div>

    <!-- Image Gallery & Settings -->
    <template v-if="background.media.type === 'image'">
      <input
        ref="imageFileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleImageUpload"
      />

      <div class="media-gallery-header">
        <span class="gallery-label">{{ customMediaPanels.image ? 'Upload custom image' : 'Select an image' }}</span>
        <button 
          class="toggle-view-btn"
          @click="customMediaPanels.image = !customMediaPanels.image"
          :title="customMediaPanels.image ? 'Back to gallery' : 'Upload custom'"
        >
          <iconify-icon :icon="customMediaPanels.image ? 'ph:images-duotone' : 'ph:upload-duotone'"></iconify-icon>
          <span>{{ customMediaPanels.image ? 'Gallery' : 'Upload' }}</span>
        </button>
      </div>

      <!-- Upload Settings (hides gallery) -->
      <div v-if="customMediaPanels.image" class="upload-settings">
        <button class="upload-btn" @click="triggerImageUpload">
          <iconify-icon icon="ph:upload-duotone"></iconify-icon>
          <span>Choose File</span>
        </button>
        <BaseInput
          label="Or paste URL"
          v-model="background.media.image.url"
          placeholder="https://..."
        />
        <p class="cors-hint">External URLs require CORS headers.</p>
      </div>

      <!-- Image Gallery -->
      <div v-else class="preset-gallery">
        <div
          v-for="preset in sceneImagePresets"
          :key="preset.id"
          class="preset-item"
          :class="{ selected: isImagePresetSelected(preset) }"
          @click="selectImagePreset(preset)"
          :title="preset.name"
        >
          <img :src="preset.url" :alt="preset.name" loading="lazy" />
          <span class="preset-name">{{ preset.name }}</span>
        </div>
      </div>

      <!-- Image Options (always visible) -->
      <div class="media-options">
        <BaseSelect
          label="Fit"
          v-model="background.media.image.fit"
          :options="fitOptions"
        />
        <BaseSlider
          label="Opacity"
          v-model="background.media.image.opacity"
          :min="0"
          :max="1"
          :step="0.05"
        />
      </div>
    </template>

    <!-- Video Gallery & Settings -->
    <template v-if="background.media.type === 'video'">
      <input
        ref="videoFileInput"
        type="file"
        accept="video/*"
        style="display: none"
        @change="handleVideoUpload"
      />

      <div class="media-gallery-header">
        <span class="gallery-label">{{ customMediaPanels.video ? 'Upload custom video' : 'Select a video' }}</span>
        <button 
          class="toggle-view-btn"
          @click="customMediaPanels.video = !customMediaPanels.video"
          :title="customMediaPanels.video ? 'Back to gallery' : 'Upload custom'"
        >
          <iconify-icon :icon="customMediaPanels.video ? 'ph:video-duotone' : 'ph:upload-duotone'"></iconify-icon>
          <span>{{ customMediaPanels.video ? 'Gallery' : 'Upload' }}</span>
        </button>
      </div>

      <!-- Upload Settings (hides gallery) -->
      <div v-if="customMediaPanels.video" class="upload-settings">
        <button class="upload-btn" @click="triggerVideoUpload">
          <iconify-icon icon="ph:upload-duotone"></iconify-icon>
          <span>Choose File</span>
        </button>
        <BaseInput
          label="Or paste URL"
          v-model="background.media.video.url"
          placeholder="https://..."
        />
        <p class="cors-hint">External URLs require CORS headers.</p>
      </div>

      <!-- Video Gallery -->
      <div v-else class="preset-gallery">
        <div
          v-for="preset in sceneVideoPresets"
          :key="preset.id"
          class="preset-item"
          :class="{ selected: isVideoPresetSelected(preset) }"
          @click="selectVideoPreset(preset)"
          :title="preset.name"
        >
          <video :src="preset.url" muted loop preload="metadata" @mouseenter="($event.target as HTMLVideoElement).play()" @mouseleave="($event.target as HTMLVideoElement).pause()"></video>
          <span class="preset-name">{{ preset.name }}</span>
        </div>
      </div>

      <!-- Video Options (always visible) -->
      <div class="media-options">
        <BaseSelect
          label="Fit"
          v-model="background.media.video.fit"
          :options="fitOptions"
        />
        <BaseSlider
          label="Opacity"
          v-model="background.media.video.opacity"
          :min="0"
          :max="1"
          :step="0.05"
        />
        <div class="video-toggles">
          <label class="toggle-option">
            <input type="checkbox" v-model="background.media.video.loop" />
            <span>Loop</span>
          </label>
          <label class="toggle-option">
            <input type="checkbox" v-model="background.media.video.muted" />
            <span>Muted</span>
          </label>
        </div>
      </div>
    </template>

    <!-- HDRI Gallery & Settings -->
    <template v-if="background.media.type === 'hdri'">
      <div class="media-gallery-header">
        <span class="gallery-label">{{ customMediaPanels.hdri ? 'Enter HDRI URL' : 'Select a 3D environment' }}</span>
        <button 
          class="toggle-view-btn"
          @click="customMediaPanels.hdri = !customMediaPanels.hdri"
          :title="customMediaPanels.hdri ? 'Back to gallery' : 'Custom URL'"
        >
          <iconify-icon :icon="customMediaPanels.hdri ? 'ph:globe-duotone' : 'ph:link-duotone'"></iconify-icon>
          <span>{{ customMediaPanels.hdri ? 'Gallery' : 'Custom' }}</span>
        </button>
      </div>

      <!-- Custom URL Settings (hides gallery) -->
      <div v-if="customMediaPanels.hdri" class="upload-settings">
        <BaseInput
          label="HDRI URL (.hdr file)"
          v-model="background.media.hdri.url"
          placeholder="https://.../.hdr"
        />
        <p class="cors-hint">Use Poly Haven or similar CORS-enabled sources.</p>
      </div>

      <!-- HDRI Gallery -->
      <div v-else class="preset-gallery hdri-gallery">
        <div
          v-for="preset in sceneHdriPresets"
          :key="preset.id"
          class="preset-item"
          :class="{ selected: isHdriPresetSelected(preset) }"
          @click="selectHdriPreset(preset)"
          :title="preset.name"
        >
          <img :src="preset.thumbnail" :alt="preset.name" loading="lazy" />
          <span class="preset-name">{{ preset.name }}</span>
          <span class="preset-badge">360°</span>
        </div>
      </div>

      <!-- HDRI Options (always visible) -->
      <div class="media-options">
        <BaseSlider
          label="Intensity"
          v-model="background.media.hdri.intensity"
          :min="0"
          :max="2"
          :step="0.1"
        />
        <BaseSlider
          label="Blur"
          v-model="background.media.hdri.blur"
          :min="0"
          :max="1"
          :step="0.1"
        />
      </div>
    </template>
  </PanelSection>

    <!-- OVERLAY BACKGROUND (single section: type, preview, stops, orbs, blend) -->
    <PanelSection title="Overlay Background" icon="ph:gradient-duotone" collapsible>
      <div class="overlay-header-bar">
        <div class="gradient-toggle">
          <label class="toggle-switch">
            <input type="checkbox" v-model="background.gradient.enabled" />
            <span class="slider"></span>
          </label>
          <span class="toggle-label">{{ background.gradient.enabled ? 'Enabled' : 'Disabled' }}</span>
        </div>
        <div v-if="background.gradient.enabled" class="overlay-dice-group">
          <button type="button" class="dice-btn" @click="randomizeAll" title="Randomize all">
            <iconify-icon icon="ph:dice-five-duotone"></iconify-icon>
          </button>
        </div>
      </div>

      <template v-if="background.gradient.enabled">
        <div class="gradient-preview-box">
          <div class="gradient-preview" :style="gradientPreviewStyle"></div>
        </div>

        <div class="randomize-toolbar">
          <p class="palette-toolbar-label">Brightness</p>
          <div class="overlay-palette-grid" role="radiogroup" aria-label="Palette brightness">
            <label
              class="gradient-type-option"
              :class="{ active: background.gradient.paletteBrightness === 'dark' }"
            >
              <input type="radio" value="dark" v-model="background.gradient.paletteBrightness" />
              <iconify-icon icon="ph:moon-stars-duotone"></iconify-icon>
              <span>Dark</span>
            </label>
            <label
              class="gradient-type-option"
              :class="{ active: background.gradient.paletteBrightness === 'light' }"
            >
              <input type="radio" value="light" v-model="background.gradient.paletteBrightness" />
              <iconify-icon icon="ph:sun-duotone"></iconify-icon>
              <span>Light</span>
            </label>
          </div>
          <div class="scene-color-palettes">
            <span class="scene-palette-label">Quick palettes (same as blob XYZ)</span>
            <div class="scene-palette-grid">
              <button
                v-for="(palette, key) in palettes"
                :key="key"
                type="button"
                class="scene-palette-btn"
                :class="{ active: background.gradient.paletteType === key }"
                :title="palette.label"
                @click="applyQuickPalette(key as PaletteType)"
              >
                <iconify-icon :icon="palette.icon"></iconify-icon>
              </button>
            </div>
          </div>
          <p class="randomize-hint">
            Tap a palette to apply it, or use dice to roll a new set with the selected palette.
            Brightness remaps colors for dark or light overlays. Scene settings save locally and with
            the kwami Save button.
          </p>
        </div>

        <p class="overlay-sublabel">Type</p>
        <div class="overlay-type-grid" role="tablist" aria-label="Overlay type">
          <label class="gradient-type-option" :class="{ active: background.gradient.type === 'solid' }">
            <input type="radio" value="solid" v-model="background.gradient.type" />
            <iconify-icon icon="ph:square-duotone"></iconify-icon>
            <span>Solid</span>
          </label>
          <label class="gradient-type-option" :class="{ active: background.gradient.type === 'linear' }">
            <input type="radio" value="linear" v-model="background.gradient.type" />
            <iconify-icon icon="ph:arrows-out-line-horizontal-duotone"></iconify-icon>
            <span>Linear</span>
          </label>
          <label class="gradient-type-option" :class="{ active: background.gradient.type === 'radial' }">
            <input type="radio" value="radial" v-model="background.gradient.type" />
            <iconify-icon icon="ph:circle-duotone"></iconify-icon>
            <span>Radial</span>
          </label>
          <label class="gradient-type-option" :class="{ active: background.gradient.type === 'orbs' }">
            <input type="radio" value="orbs" v-model="background.gradient.type" />
            <iconify-icon icon="ph:circles-three-duotone"></iconify-icon>
            <span>Orbs</span>
          </label>
        </div>

        <div v-if="background.gradient.type !== 'solid'" class="overlay-secondary-actions">
          <button
            v-if="background.gradient.type === 'orbs'"
            type="button"
            class="overlay-action-btn"
            @click="randomizeOrbs"
          >
            <iconify-icon icon="ph:dice-four-duotone"></iconify-icon>
            <span>Randomize orbs</span>
          </button>
          <button
            v-else
            type="button"
            class="overlay-action-btn"
            @click="randomizePositions"
          >
            <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
            <span>Randomize positions</span>
          </button>
        </div>

        <div v-if="background.gradient.type === 'solid'" class="gradient-position-controls">
          <BaseColorPicker label="Color" v-model="background.gradient.solidColor" />
        </div>

        <div v-if="background.gradient.type === 'linear'" class="gradient-position-controls">
          <BaseSlider
            label="Angle"
            v-model="background.gradient.angle"
            :min="0"
            :max="360"
            :step="5"
            unit="°"
          />
        </div>

        <div v-if="background.gradient.type === 'radial'" class="gradient-position-controls">
          <div class="position-grid">
            <BaseSlider
              label="Center X"
              v-model="background.gradient.radialCenter.x"
              :min="0"
              :max="100"
              :step="1"
              unit="%"
            />
            <BaseSlider
              label="Center Y"
              v-model="background.gradient.radialCenter.y"
              :min="0"
              :max="100"
              :step="1"
              unit="%"
            />
          </div>
          <BaseSlider
            label="Size"
            v-model="background.gradient.radialSize"
            :min="10"
            :max="200"
            :step="5"
            unit="%"
          />
        </div>

        <template v-if="background.gradient.type === 'orbs'">
          <p class="overlay-sublabel">Orbs</p>
          <div class="orbs-list">
            <div
              v-for="(orb, index) in background.gradient.orbs"
              :key="orb.id"
              class="orb-row"
            >
              <div class="orb-header">
                <span class="orb-label">Orb {{ index + 1 }}</span>
                <div class="orb-preview" :style="getOrbPreviewStyle(orb)"></div>
                <button
                  v-if="background.gradient.orbs.length > 1"
                  type="button"
                  class="remove-orb-btn"
                  @click="removeOrb(index)"
                  title="Remove orb"
                >
                  <iconify-icon icon="ph:x"></iconify-icon>
                </button>
              </div>
              <div class="orb-controls">
                <BaseColorPicker label="Color" v-model="orb.color" />
                <div class="orb-position-grid">
                  <BaseSlider label="X" v-model="orb.x" :min="0" :max="100" :step="1" unit="%" />
                  <BaseSlider label="Y" v-model="orb.y" :min="0" :max="100" :step="1" unit="%" />
                </div>
                <div class="orb-size-grid">
                  <BaseSlider label="Size" v-model="orb.size" :min="10" :max="100" :step="5" unit="%" />
                  <BaseSlider label="Softness" v-model="orb.softness" :min="0" :max="100" :step="5" unit="%" />
                </div>
                <BaseSlider label="Opacity" v-model="orb.opacity" :min="0" :max="1" :step="0.05" />
              </div>
            </div>
          </div>
          <button type="button" class="add-orb-btn" @click="addOrb">
            <iconify-icon icon="ph:plus"></iconify-icon>
            <span>Add orb</span>
          </button>
        </template>

        <template v-if="background.gradient.type === 'radial' || background.gradient.type === 'linear'">
          <div class="overlay-stops-header">
            <p class="overlay-sublabel">Color stops</p>
            <button type="button" class="dice-btn" @click="randomizeColors" title="Randomize colors">
              <iconify-icon icon="ph:dice-four-duotone"></iconify-icon>
            </button>
          </div>
          <div class="color-stops-list">
            <div
              v-for="(stop, index) in background.gradient.stops"
              :key="index"
              class="color-stop-row"
            >
              <BaseColorPicker :label="`Stop ${index + 1}`" v-model="stop.color" />
              <BaseSlider label="Pos" v-model="stop.position" :min="0" :max="100" :step="1" unit="%" />
              <BaseSlider label="Alpha" v-model="stop.opacity" :min="0" :max="1" :step="0.05" />
              <button
                v-if="background.gradient.stops.length > 2"
                type="button"
                class="remove-stop-btn"
                @click="removeGradientStop(index)"
                title="Remove stop"
              >
                <iconify-icon icon="ph:x"></iconify-icon>
              </button>
            </div>
          </div>
          <button type="button" class="add-stop-btn" @click="addGradientStop">
            <iconify-icon icon="ph:plus"></iconify-icon>
            <span>Add color stop</span>
          </button>
        </template>

        <p class="overlay-sublabel">Blend</p>
        <div class="overlay-blend-block">
          <BaseSlider
            label="Overall opacity"
            v-model="background.gradient.opacity"
            :min="0"
            :max="1"
            :step="0.05"
          />
          <BaseSelect
            label="Blend mode"
            v-model="background.gradient.blendMode"
            :options="blendModeOptions"
          />
        </div>
      </template>
    </PanelSection>

    <SceneEffects v-model:effects="background.effects" />

</template>

<style scoped>
/* Media Gallery Header */
.media-gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--glass-border);
}

.gallery-label {
  font-size: 12px;
  color: var(--text-muted);
}

.toggle-view-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-view-btn:hover {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.toggle-view-btn iconify-icon {
  font-size: 14px;
}

/* Upload Settings */
.upload-settings {
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-settings .cors-hint {
  font-size: 10px;
  color: var(--text-muted);
  margin: 0;
}

/* Media Options (below gallery) */
.media-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

/* Preset Gallery */
.preset-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--surface-3) transparent;
}

.preset-gallery::-webkit-scrollbar {
  width: 6px;
}

.preset-gallery::-webkit-scrollbar-track {
  background: transparent;
}

.preset-gallery::-webkit-scrollbar-thumb {
  background: var(--surface-3);
  border-radius: 3px;
}

.preset-item {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  background: var(--surface-1);
}

.preset-item:hover {
  border-color: var(--accent-primary);
  transform: scale(1.02);
}

.preset-item.selected {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-glow);
}

.preset-item img,
.preset-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preset-item .preset-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 6px;
  font-size: 10px;
  font-weight: 500;
  color: white;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

/* HDRI Badge */
.preset-item .preset-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  font-size: 9px;
  font-weight: 600;
  color: white;
  background: var(--accent-primary);
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hdri-gallery .preset-item {
  aspect-ratio: 2 / 1;
}

/* Dice Buttons */
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
  flex-shrink: 0;
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

.dice-buttons {
  display: flex;
  gap: 6px;
}

/* Overlay header: toggle + dice; wraps on narrow panels */
.overlay-header-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.overlay-dice-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.overlay-sublabel {
  margin: 14px 0 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.overlay-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
}

.overlay-secondary-actions {
  margin-top: 10px;
  width: 100%;
}

.overlay-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.overlay-action-btn:hover {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.overlay-stops-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
}

.overlay-stops-header .overlay-sublabel {
  margin: 0;
}

.overlay-blend-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

/* Background Type Selector */
.bg-type-selector {
  display: flex;
  gap: 6px;
}

.bg-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bg-option:hover {
  background: var(--surface-2);
}

.bg-option.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
}

.bg-option input {
  display: none;
}

.bg-option iconify-icon {
  font-size: 20px;
  color: var(--text-secondary);
}

.bg-option.active iconify-icon {
  color: var(--accent-primary);
}

.bg-option span {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-secondary);
}

.bg-option.active span {
  color: var(--text-primary);
}

/* Gradient Toggle */
.gradient-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--surface-2);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-switch .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-secondary);
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .slider {
  background-color: var(--accent-primary);
}

.toggle-switch input:checked + .slider:before {
  transform: translateX(20px);
  background-color: white;
}

.toggle-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Gradient Preview Box */
.gradient-preview-box {
  margin-top: 12px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.gradient-preview {
  width: 100%;
  height: 60px;
}

.randomize-toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.palette-toolbar-label {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.overlay-palette-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
}

.scene-color-palettes {
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

.scene-palette-label {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.scene-palette-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.scene-palette-btn {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.scene-palette-btn:hover {
  background: var(--surface-2);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: scale(1.06);
}

.scene-palette-btn.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.randomize-hint {
  margin: 0;
  font-size: 11px;
  color: var(--text-muted);
}

/* Overlay type chips (grid cells) */
.gradient-type-option {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 6px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gradient-type-option:hover {
  background: var(--surface-2);
}

.gradient-type-option.active {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
}

.gradient-type-option input {
  display: none;
}

.gradient-type-option iconify-icon {
  font-size: 16px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.gradient-type-option.active iconify-icon {
  color: var(--accent-primary);
}

.gradient-type-option span {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.2;
  word-break: break-word;
}

.gradient-type-option.active span {
  color: var(--text-primary);
}

/* Gradient Position Controls */
.gradient-position-controls {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.position-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Color Stops */
.color-stops-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-stop-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 8px;
  align-items: end;
  padding: 12px;
  background: var(--surface-1);
  border-radius: var(--radius-md);
}

.remove-stop-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-stop-btn:hover {
  background: rgba(255, 100, 100, 0.1);
  border-color: rgba(255, 100, 100, 0.5);
  color: #ff6464;
}

.add-stop-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  margin-top: 8px;
  background: var(--surface-1);
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;
}

.add-stop-btn:hover {
  background: var(--surface-2);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.add-stop-btn iconify-icon {
  font-size: 16px;
}

/* Orbs UI */
.orbs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.orb-row {
  padding: 12px;
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.orb-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.orb-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  flex: 1;
}

.orb-preview {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background-color: rgba(4, 6, 12, 0.9);
  box-shadow: inset 0 0 18px rgba(255, 255, 255, 0.04);
}

.remove-orb-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-orb-btn:hover {
  background: rgba(255, 100, 100, 0.1);
  border-color: rgba(255, 100, 100, 0.5);
  color: #ff6464;
}

.orb-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.orb-position-grid,
.orb-size-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.add-orb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  margin-top: 8px;
  background: var(--surface-1);
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;
}

.add-orb-btn:hover {
  background: var(--surface-2);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.add-orb-btn iconify-icon {
  font-size: 16px;
}

/* Media Upload */
.media-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cors-hint {
  font-size: 10px;
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: var(--surface-1);
  border: 2px dashed var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.upload-btn:hover {
  background: var(--surface-2);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.upload-btn iconify-icon {
  font-size: 20px;
}

.upload-btn span {
  font-size: 12px;
  font-weight: 500;
}

/* Media Preview */
.media-preview {
  margin-top: 12px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface-1);
}

.media-preview img,
.media-preview video {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

/* Media Options */
.media-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

/* Video Toggles */
.video-toggles {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.toggle-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.toggle-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-primary);
}

.toggle-option span {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Preset Grid */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.preset-btn {
  aspect-ratio: 1;
  padding: 4px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  border-color: var(--accent-primary);
  transform: scale(1.1);
}

.preset-preview {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 4px;
}
</style>
