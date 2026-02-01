<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseInput from '@/components/ui/BaseInput.vue';

type MediaType = 'none' | 'solid' | 'image' | 'video';
type MediaFit = 'cover' | 'contain' | 'stretch';
type GradientType = 'radial' | 'linear' | 'orbs';
type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';

export interface GradientStop {
  color: string;
  position: number; // 0-100
  opacity: number;  // 0-1
}

export interface GradientOrb {
  id: string;
  x: number; // 0-100 position
  y: number; // 0-100 position
  size: number; // 10-100 radius percentage
  color: string;
  opacity: number; // 0-1
  softness: number; // 0-100 edge softness
}

export interface BackgroundConfig {
  // Media layer (back)
  media: {
    type: MediaType;
    solidColor: string;
    solidOpacity: number;
    image: {
      url: string;
      fit: MediaFit;
      opacity: number;
    };
    video: {
      url: string;
      fit: MediaFit;
      opacity: number;
      loop: boolean;
      muted: boolean;
    };
  };
  // Gradient layer (front overlay)
  gradient: {
    enabled: boolean;
    type: GradientType;
    angle: number; // 0-360 for linear
    radialCenter: { x: number; y: number }; // 0-100
    radialSize: number; // 0-200 (percentage)
    stops: GradientStop[];
    orbs: GradientOrb[]; // For orbs mode
    opacity: number;
    blendMode: BlendMode;
  };
}

// Use defineModel for proper two-way binding (Vue 3.3+)
const background = defineModel<BackgroundConfig>('background', { required: true });

const emit = defineEmits<{
  (e: 'preset', name: string): void;
  (e: 'imageUpload', file: File): void;
  (e: 'videoUpload', file: File): void;
}>();

// Helper functions for randomization
function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function randomDarkHex(): string {
  // Generate darker colors suitable for backgrounds
  const r = Math.floor(Math.random() * 60);
  const g = Math.floor(Math.random() * 60);
  const b = Math.floor(Math.random() * 80);
  return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}

function randomInRange(min: number, max: number, step: number = 1): number {
  const range = (max - min) / step;
  return min + Math.round(Math.random() * range) * step;
}

function generateOrbId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Initialize optional properties with defaults
watch(background, (bg) => {
  if (bg) {
    // Ensure media defaults
    if (!bg.media) {
      bg.media = {
        type: 'none',
        solidColor: '#0a0a1a',
        solidOpacity: 1,
        image: { url: '', fit: 'cover', opacity: 1 },
        video: { url: '', fit: 'cover', opacity: 1, loop: true, muted: true },
      };
    }
    if (!bg.media.image) {
      bg.media.image = { url: '', fit: 'cover', opacity: 1 };
    }
    if (!bg.media.video) {
      bg.media.video = { url: '', fit: 'cover', opacity: 1, loop: true, muted: true };
    }
    // Ensure gradient defaults
    if (!bg.gradient) {
      bg.gradient = {
        enabled: true,
        type: 'radial',
        angle: 180,
        radialCenter: { x: 50, y: 50 },
        radialSize: 100,
        stops: [
          { color: '#0a0a1a', position: 0, opacity: 1 },
          { color: '#1a1a3a', position: 50, opacity: 1 },
          { color: '#0a0a1a', position: 100, opacity: 1 },
        ],
        orbs: [
          { id: generateOrbId(), x: 20, y: 30, size: 40, color: '#1a2a4a', opacity: 0.8, softness: 80 },
          { id: generateOrbId(), x: 80, y: 70, size: 50, color: '#2a1a3a', opacity: 0.7, softness: 70 },
          { id: generateOrbId(), x: 50, y: 50, size: 60, color: '#0a1a2a', opacity: 0.6, softness: 90 },
        ],
        opacity: 1,
        blendMode: 'normal',
      };
    }
    if (!bg.gradient.stops || bg.gradient.stops.length < 2) {
      bg.gradient.stops = [
        { color: '#0a0a1a', position: 0, opacity: 1 },
        { color: '#1a1a3a', position: 50, opacity: 1 },
        { color: '#0a0a1a', position: 100, opacity: 1 },
      ];
    }
    if (!bg.gradient.orbs || bg.gradient.orbs.length === 0) {
      bg.gradient.orbs = [
        { id: generateOrbId(), x: 20, y: 30, size: 40, color: '#1a2a4a', opacity: 0.8, softness: 80 },
        { id: generateOrbId(), x: 80, y: 70, size: 50, color: '#2a1a3a', opacity: 0.7, softness: 70 },
        { id: generateOrbId(), x: 50, y: 50, size: 60, color: '#0a1a2a', opacity: 0.6, softness: 90 },
      ];
    }
  }
}, { immediate: true, deep: true });

const imageFileInput = ref<HTMLInputElement | null>(null);
const videoFileInput = ref<HTMLInputElement | null>(null);

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    if (background.value?.media?.image) {
      background.value.media.image.url = url;
    }
    emit('imageUpload', file);
  }
}

function handleVideoUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    if (background.value?.media?.video) {
      background.value.media.video.url = url;
    }
    emit('videoUpload', file);
  }
}

function triggerImageUpload() {
  imageFileInput.value?.click();
}

function triggerVideoUpload() {
  videoFileInput.value?.click();
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
    color: '#2a2a4a',
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
  const newOrb: GradientOrb = {
    id: generateOrbId(),
    x: randomInRange(10, 90),
    y: randomInRange(10, 90),
    size: randomInRange(30, 60),
    color: randomDarkHex(),
    opacity: randomInRange(50, 90) / 100,
    softness: randomInRange(60, 90),
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
  for (const stop of background.value.gradient.stops) {
    stop.color = randomDarkHex();
  }
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
      orb.x = randomInRange(10, 90);
      orb.y = randomInRange(10, 90);
      orb.size = randomInRange(25, 70);
      orb.softness = randomInRange(50, 95);
    }
  }
}

function randomizeOrbs() {
  if (!background.value?.gradient) return;
  for (const orb of background.value.gradient.orbs) {
    orb.x = randomInRange(10, 90);
    orb.y = randomInRange(10, 90);
    orb.size = randomInRange(25, 70);
    orb.color = randomDarkHex();
    orb.opacity = randomInRange(50, 90) / 100;
    orb.softness = randomInRange(50, 95);
  }
}

function randomizeAll() {
  if (!background.value?.gradient) return;
  randomizeColors();
  randomizePositions();
  if (background.value.gradient.type === 'orbs') {
    randomizeOrbs();
  }
}

// Presets for gradients
const gradientPresets: Record<string, { stops: GradientStop[]; type: GradientType }> = {
  midnight: { 
    type: 'radial',
    stops: [
      { color: '#0a0a1a', position: 0, opacity: 1 },
      { color: '#1a1a3a', position: 50, opacity: 1 },
      { color: '#0a0a1a', position: 100, opacity: 1 },
    ]
  },
  sunset: { 
    type: 'linear',
    stops: [
      { color: '#1a0a1a', position: 0, opacity: 1 },
      { color: '#3a1a2a', position: 50, opacity: 1 },
      { color: '#1a0a1a', position: 100, opacity: 1 },
    ]
  },
  ocean: { 
    type: 'radial',
    stops: [
      { color: '#0a1a2a', position: 0, opacity: 1 },
      { color: '#1a2a3a', position: 50, opacity: 1 },
      { color: '#0a1a2a', position: 100, opacity: 1 },
    ]
  },
  forest: { 
    type: 'radial',
    stops: [
      { color: '#0a1a0a', position: 0, opacity: 1 },
      { color: '#1a2a1a', position: 50, opacity: 1 },
      { color: '#0a1a0a', position: 100, opacity: 1 },
    ]
  },
  cyber: { 
    type: 'linear',
    stops: [
      { color: '#1a0a2a', position: 0, opacity: 1 },
      { color: '#0a1a3a', position: 50, opacity: 1 },
      { color: '#1a0a2a', position: 100, opacity: 1 },
    ]
  },
  warm: { 
    type: 'radial',
    stops: [
      { color: '#2a1a0a', position: 0, opacity: 1 },
      { color: '#3a2a1a', position: 50, opacity: 1 },
      { color: '#2a1a0a', position: 100, opacity: 1 },
    ]
  },
  aurora: { 
    type: 'linear',
    stops: [
      { color: '#0a2a1a', position: 0, opacity: 1 },
      { color: '#1a1a3a', position: 50, opacity: 1 },
      { color: '#2a0a2a', position: 100, opacity: 1 },
    ]
  },
  vignette: { 
    type: 'radial',
    stops: [
      { color: '#000000', position: 0, opacity: 0 },
      { color: '#000000', position: 60, opacity: 0.3 },
      { color: '#000000', position: 100, opacity: 0.9 },
    ]
  },
};

function applyGradientPreset(name: string) {
  const preset = gradientPresets[name];
  if (preset && background.value?.gradient) {
    background.value.gradient.type = preset.type;
    background.value.gradient.stops = preset.stops.map(s => ({ ...s }));
    background.value.gradient.enabled = true;
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

// Preview gradient CSS for the UI
const gradientPreviewStyle = computed(() => {
  if (!background.value?.gradient) return {};
  const { type, angle, radialCenter, radialSize, stops, orbs } = background.value.gradient;
  
  if (type === 'orbs') {
    // Create blurred orb effect using radial gradients
    // Note: actual blur is done in canvas, this is just a preview approximation
    const orbGradients = orbs.map(orb => {
      const r = parseInt(orb.color.slice(1, 3), 16);
      const g = parseInt(orb.color.slice(3, 5), 16);
      const b = parseInt(orb.color.slice(5, 7), 16);
      const size = orb.size * 0.5;
      // Simulate blur with a soft gradient
      return `radial-gradient(circle ${size}% at ${orb.x}% ${orb.y}%, rgba(${r}, ${g}, ${b}, ${orb.opacity}) 0%, rgba(${r}, ${g}, ${b}, ${orb.opacity * 0.3}) 50%, transparent 100%)`;
    });
    return {
      background: orbGradients.join(', '),
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
  <div>
    <!-- MEDIA LAYER (BACK) -->
    <PanelSection title="Media Background" icon="ph:image-duotone">
      <div class="bg-type-selector">
        <label class="bg-option" :class="{ active: background.media.type === 'none' }">
          <input type="radio" value="none" v-model="background.media.type" />
          <iconify-icon icon="ph:x-circle-duotone"></iconify-icon>
          <span>None</span>
        </label>
        <label class="bg-option" :class="{ active: background.media.type === 'solid' }">
          <input type="radio" value="solid" v-model="background.media.type" />
          <iconify-icon icon="ph:drop-duotone"></iconify-icon>
          <span>Solid</span>
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
      </div>
    </PanelSection>

    <!-- Solid Color Settings -->
    <PanelSection v-if="background.media.type === 'solid'" title="Solid Color">
      <BaseColorPicker label="Color" v-model="background.media.solidColor" />
      <div style="margin-top: 12px">
        <BaseSlider
          label="Opacity"
          v-model="background.media.solidOpacity"
          :min="0"
          :max="1"
          :step="0.05"
        />
      </div>
    </PanelSection>

    <!-- Image Settings -->
    <PanelSection v-if="background.media.type === 'image'" title="Image Settings">
      <div class="media-upload">
        <input
          ref="imageFileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleImageUpload"
        />
        <button class="upload-btn" @click="triggerImageUpload">
          <iconify-icon icon="ph:upload-duotone"></iconify-icon>
          <span>Upload Image</span>
        </button>
        <BaseInput
          label="Or enter URL"
          v-model="background.media.image.url"
          placeholder="https://..."
        />
        <p class="cors-hint">External URLs require CORS headers. Upload local files for best results.</p>
      </div>
      <div v-if="background.media.image?.url" class="media-preview">
        <img :src="background.media.image.url" alt="Background preview" />
      </div>
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
    </PanelSection>

    <!-- Video Settings -->
    <PanelSection v-if="background.media.type === 'video'" title="Video Settings">
      <div class="media-upload">
        <input
          ref="videoFileInput"
          type="file"
          accept="video/*"
          style="display: none"
          @change="handleVideoUpload"
        />
        <button class="upload-btn" @click="triggerVideoUpload">
          <iconify-icon icon="ph:upload-duotone"></iconify-icon>
          <span>Upload Video</span>
        </button>
        <BaseInput
          label="Or enter URL"
          v-model="background.media.video.url"
          placeholder="https://..."
        />
        <p class="cors-hint">External URLs require CORS headers. Upload local files for best results.</p>
      </div>
      <div v-if="background.media.video?.url" class="media-preview video-preview">
        <video :src="background.media.video.url" muted autoplay loop></video>
      </div>
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
    </PanelSection>

    <!-- GRADIENT LAYER (FRONT OVERLAY) -->
    <PanelSection title="Gradient Overlay" icon="ph:gradient-duotone">
      <div class="gradient-header">
        <div class="gradient-toggle">
          <label class="toggle-switch">
            <input type="checkbox" v-model="background.gradient.enabled" />
            <span class="slider"></span>
          </label>
          <span class="toggle-label">{{ background.gradient.enabled ? 'Enabled' : 'Disabled' }}</span>
        </div>
        <div v-if="background.gradient.enabled" class="dice-buttons">
          <button class="dice-btn" @click="randomizeAll" title="Randomize All">
            <iconify-icon icon="ph:dice-five-duotone"></iconify-icon>
          </button>
        </div>
      </div>
      
      <div v-if="background.gradient.enabled" class="gradient-preview-box">
        <div class="gradient-preview" :style="gradientPreviewStyle"></div>
      </div>
    </PanelSection>

    <!-- Gradient Type & Position -->
    <PanelSection v-if="background.gradient.enabled" title="Gradient Type">
      <div class="section-header-row">
        <div class="gradient-type-selector">
          <label class="gradient-type-option" :class="{ active: background.gradient.type === 'radial' }">
            <input type="radio" value="radial" v-model="background.gradient.type" />
            <iconify-icon icon="ph:circle-duotone"></iconify-icon>
            <span>Radial</span>
          </label>
          <label class="gradient-type-option" :class="{ active: background.gradient.type === 'linear' }">
            <input type="radio" value="linear" v-model="background.gradient.type" />
            <iconify-icon icon="ph:arrows-out-line-horizontal-duotone"></iconify-icon>
            <span>Linear</span>
          </label>
          <label class="gradient-type-option" :class="{ active: background.gradient.type === 'orbs' }">
            <input type="radio" value="orbs" v-model="background.gradient.type" />
            <iconify-icon icon="ph:circles-three-duotone"></iconify-icon>
            <span>Orbs</span>
          </label>
        </div>
        <button class="dice-btn" @click="randomizePositions" title="Randomize Positions">
          <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
        </button>
      </div>

      <!-- Linear gradient angle -->
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

      <!-- Radial gradient center & size -->
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
    </PanelSection>

    <!-- Orbs Settings -->
    <PanelSection v-if="background.gradient.enabled && background.gradient.type === 'orbs'" title="Gradient Orbs">
      <template #actions>
        <button class="dice-btn" @click="randomizeOrbs" title="Randomize Orbs">
          <iconify-icon icon="ph:dice-four-duotone"></iconify-icon>
        </button>
      </template>
      <div class="orbs-list">
        <div
          v-for="(orb, index) in background.gradient.orbs"
          :key="orb.id"
          class="orb-row"
        >
          <div class="orb-header">
            <span class="orb-label">Orb {{ index + 1 }}</span>
            <div class="orb-preview" :style="{ background: orb.color, opacity: orb.opacity }"></div>
            <button
              v-if="background.gradient.orbs.length > 1"
              class="remove-orb-btn"
              @click="removeOrb(index)"
              title="Remove orb"
            >
              <iconify-icon icon="ph:x"></iconify-icon>
            </button>
          </div>
          <div class="orb-controls">
            <BaseColorPicker
              label="Color"
              v-model="orb.color"
            />
            <div class="orb-position-grid">
              <BaseSlider
                label="X"
                v-model="orb.x"
                :min="0"
                :max="100"
                :step="1"
                unit="%"
              />
              <BaseSlider
                label="Y"
                v-model="orb.y"
                :min="0"
                :max="100"
                :step="1"
                unit="%"
              />
            </div>
            <div class="orb-size-grid">
              <BaseSlider
                label="Size"
                v-model="orb.size"
                :min="10"
                :max="100"
                :step="5"
                unit="%"
              />
              <BaseSlider
                label="Softness"
                v-model="orb.softness"
                :min="0"
                :max="100"
                :step="5"
                unit="%"
              />
            </div>
            <BaseSlider
              label="Opacity"
              v-model="orb.opacity"
              :min="0"
              :max="1"
              :step="0.05"
            />
          </div>
        </div>
      </div>
      <button class="add-orb-btn" @click="addOrb">
        <iconify-icon icon="ph:plus"></iconify-icon>
        <span>Add Orb</span>
      </button>
    </PanelSection>

    <!-- Gradient Colors / Stops (not for orbs) -->
    <PanelSection v-if="background.gradient.enabled && background.gradient.type !== 'orbs'" title="Color Stops">
      <template #actions>
        <button class="dice-btn" @click="randomizeColors" title="Randomize Colors">
          <iconify-icon icon="ph:dice-four-duotone"></iconify-icon>
        </button>
      </template>
      <div class="color-stops-list">
        <div
          v-for="(stop, index) in background.gradient.stops"
          :key="index"
          class="color-stop-row"
        >
          <BaseColorPicker
            :label="`Stop ${index + 1}`"
            v-model="stop.color"
          />
          <BaseSlider
            label="Pos"
            v-model="stop.position"
            :min="0"
            :max="100"
            :step="1"
            unit="%"
          />
          <BaseSlider
            label="Alpha"
            v-model="stop.opacity"
            :min="0"
            :max="1"
            :step="0.05"
          />
          <button
            v-if="background.gradient.stops.length > 2"
            class="remove-stop-btn"
            @click="removeGradientStop(index)"
            title="Remove stop"
          >
            <iconify-icon icon="ph:x"></iconify-icon>
          </button>
        </div>
      </div>
      <button class="add-stop-btn" @click="addGradientStop">
        <iconify-icon icon="ph:plus"></iconify-icon>
        <span>Add Color Stop</span>
      </button>
    </PanelSection>

    <!-- Gradient Global Settings -->
    <PanelSection v-if="background.gradient.enabled" title="Gradient Settings">
      <BaseSlider
        label="Overall Opacity"
        v-model="background.gradient.opacity"
        :min="0"
        :max="1"
        :step="0.05"
      />
      <div style="margin-top: 12px">
        <BaseSelect
          label="Blend Mode"
          v-model="background.gradient.blendMode"
          :options="blendModeOptions"
        />
      </div>
    </PanelSection>

    <!-- Gradient Presets (not for orbs) -->
    <PanelSection v-if="background.gradient.type !== 'orbs'" title="Gradient Presets">
      <div class="preset-grid">
        <button
          v-for="(preset, name) in gradientPresets"
          :key="name"
          class="preset-btn"
          :title="(name as string).charAt(0).toUpperCase() + (name as string).slice(1)"
          @click="applyGradientPreset(name as string)"
        >
          <span
            class="preset-preview"
            :style="{ 
              background: preset.type === 'radial' 
                ? `radial-gradient(${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                : `linear-gradient(180deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
            }"
          ></span>
        </button>
      </div>
    </PanelSection>
  </div>
</template>

<style scoped>
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

/* Section Headers */
.gradient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header-row .gradient-type-selector {
  flex: 1;
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

/* Gradient Type Selector */
.gradient-type-selector {
  display: flex;
  gap: 8px;
}

.gradient-type-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
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
  font-size: 18px;
  color: var(--text-secondary);
}

.gradient-type-option.active iconify-icon {
  color: var(--accent-primary);
}

.gradient-type-option span {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
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
