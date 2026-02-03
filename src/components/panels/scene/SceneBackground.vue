<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import { sceneImagePresets, type SceneImagePreset } from '@/presets/scene/image-presets';
import { sceneVideoPresets, type SceneVideoPreset } from '@/presets/scene/video-presets';
import { sceneHdriPresets, type SceneHdriPreset } from '@/presets/scene/hdri-presets';
import { useSceneStore, type GradientStop, type GradientOrb } from '@/stores/scene';

// Use store for state persistence
const sceneStore = useSceneStore();
const { background } = storeToRefs(sceneStore);

// Re-export types for backwards compatibility
export type { GradientStop, GradientOrb };
export type { BackgroundConfig } from '@/stores/scene';

// Helper functions for randomization
// function randomHex(): string {
//   return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
// }

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

const imageFileInput = ref<HTMLInputElement | null>(null);
const videoFileInput = ref<HTMLInputElement | null>(null);
const showCustomSettings = ref(false);

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
  const { type, angle, radialCenter, /* radialSize, */ stops, orbs } = background.value.gradient;
  
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
        <span class="gallery-label">{{ showCustomSettings ? 'Upload custom image' : 'Select an image' }}</span>
        <button 
          class="toggle-view-btn"
          @click="showCustomSettings = !showCustomSettings"
          :title="showCustomSettings ? 'Back to gallery' : 'Upload custom'"
        >
          <iconify-icon :icon="showCustomSettings ? 'ph:images-duotone' : 'ph:upload-duotone'"></iconify-icon>
          <span>{{ showCustomSettings ? 'Gallery' : 'Upload' }}</span>
        </button>
      </div>

      <!-- Upload Settings (hides gallery) -->
      <div v-if="showCustomSettings" class="upload-settings">
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
        <span class="gallery-label">{{ showCustomSettings ? 'Upload custom video' : 'Select a video' }}</span>
        <button 
          class="toggle-view-btn"
          @click="showCustomSettings = !showCustomSettings"
          :title="showCustomSettings ? 'Back to gallery' : 'Upload custom'"
        >
          <iconify-icon :icon="showCustomSettings ? 'ph:video-duotone' : 'ph:upload-duotone'"></iconify-icon>
          <span>{{ showCustomSettings ? 'Gallery' : 'Upload' }}</span>
        </button>
      </div>

      <!-- Upload Settings (hides gallery) -->
      <div v-if="showCustomSettings" class="upload-settings">
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
        <span class="gallery-label">{{ showCustomSettings ? 'Enter HDRI URL' : 'Select a 3D environment' }}</span>
        <button 
          class="toggle-view-btn"
          @click="showCustomSettings = !showCustomSettings"
          :title="showCustomSettings ? 'Back to gallery' : 'Custom URL'"
        >
          <iconify-icon :icon="showCustomSettings ? 'ph:globe-duotone' : 'ph:link-duotone'"></iconify-icon>
          <span>{{ showCustomSettings ? 'Gallery' : 'Custom' }}</span>
        </button>
      </div>

      <!-- Custom URL Settings (hides gallery) -->
      <div v-if="showCustomSettings" class="upload-settings">
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

    <!-- GRADIENT LAYER (FRONT OVERLAY) -->
    <PanelSection title="Gradient Overlay" icon="ph:gradient-duotone" collapsible>
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
    <PanelSection v-if="background.gradient.enabled" title="Gradient Type" collapsible>
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
    <PanelSection v-if="background.gradient.enabled && background.gradient.type === 'orbs'" title="Gradient Orbs" collapsible>
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
    <PanelSection v-if="background.gradient.enabled && background.gradient.type !== 'orbs'" title="Color Stops" collapsible>
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
    <PanelSection v-if="background.gradient.enabled" title="Gradient Settings" collapsible>
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
