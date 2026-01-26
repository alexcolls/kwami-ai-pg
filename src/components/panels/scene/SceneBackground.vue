<script setup lang="ts">
import { ref } from 'vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseInput from '@/components/ui/BaseInput.vue';

type GradientDirection = 'radial' | 'vertical' | 'horizontal' | 'diagonal';
type BackgroundType = 'gradient' | 'solid' | 'transparent' | 'image' | 'video';
type MediaFit = 'cover' | 'contain' | 'stretch';

const props = defineProps<{
  background: {
    type: BackgroundType;
    gradient: { 
      colors: [string, string, string]; 
      direction: GradientDirection;
      opacity?: number;
      angle?: number;
    };
    solidColor: string;
    solidOpacity?: number;
    image?: {
      url: string;
      fit: MediaFit;
      opacity: number;
    };
    video?: {
      url: string;
      fit: MediaFit;
      opacity: number;
      loop: boolean;
      muted: boolean;
    };
  };
}>();

const emit = defineEmits<{
  (e: 'preset', name: string): void;
  (e: 'imageUpload', file: File): void;
  (e: 'videoUpload', file: File): void;
}>();

// Initialize optional properties with defaults
if (!props.background.gradient.opacity) props.background.gradient.opacity = 1;
if (!props.background.gradient.angle) props.background.gradient.angle = 0;
if (!props.background.solidOpacity) props.background.solidOpacity = 1;
if (!props.background.image) {
  props.background.image = { url: '', fit: 'cover', opacity: 1 };
}
if (!props.background.video) {
  props.background.video = { url: '', fit: 'cover', opacity: 1, loop: true, muted: true };
}

const imageFileInput = ref<HTMLInputElement | null>(null);
const videoFileInput = ref<HTMLInputElement | null>(null);

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    if (props.background.image) {
      props.background.image.url = url;
    }
    emit('imageUpload', file);
  }
}

function handleVideoUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    if (props.background.video) {
      props.background.video.url = url;
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

// Presets management
const presets: Record<string, { colors: [string, string, string] }> = {
  midnight: { colors: ['#0a0a1a', '#1a1a3a', '#0a0a1a'] },
  sunset: { colors: ['#1a0a1a', '#3a1a2a', '#1a0a1a'] },
  ocean: { colors: ['#0a1a2a', '#1a2a3a', '#0a1a2a'] },
  forest: { colors: ['#0a1a0a', '#1a2a1a', '#0a1a0a'] },
  cyber: { colors: ['#1a0a2a', '#0a1a3a', '#1a0a2a'] },
  warm: { colors: ['#2a1a0a', '#3a2a1a', '#2a1a0a'] },
  aurora: { colors: ['#0a2a1a', '#1a1a3a', '#2a0a2a'] },
  dusk: { colors: ['#2a1a2a', '#1a1a2a', '#0a1a2a'] },
};

const fitOptions = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Stretch', value: 'stretch' },
];
</script>

<template>
  <div>
    <PanelSection title="Background Type">
      <div class="bg-type-selector">
        <label class="bg-option" :class="{ active: background.type === 'gradient' }">
          <input type="radio" value="gradient" v-model="background.type" />
          <iconify-icon icon="ph:gradient-duotone"></iconify-icon>
          <span>Gradient</span>
        </label>
        <label class="bg-option" :class="{ active: background.type === 'solid' }">
          <input type="radio" value="solid" v-model="background.type" />
          <iconify-icon icon="ph:drop-duotone"></iconify-icon>
          <span>Solid</span>
        </label>
        <label class="bg-option" :class="{ active: background.type === 'image' }">
          <input type="radio" value="image" v-model="background.type" />
          <iconify-icon icon="ph:image-duotone"></iconify-icon>
          <span>Image</span>
        </label>
        <label class="bg-option" :class="{ active: background.type === 'video' }">
          <input type="radio" value="video" v-model="background.type" />
          <iconify-icon icon="ph:video-duotone"></iconify-icon>
          <span>Video</span>
        </label>
        <label class="bg-option" :class="{ active: background.type === 'transparent' }">
          <input type="radio" value="transparent" v-model="background.type" />
          <iconify-icon icon="ph:checkerboard-duotone"></iconify-icon>
          <span>None</span>
        </label>
      </div>
    </PanelSection>

    <!-- Gradient Settings -->
    <PanelSection v-if="background.type === 'gradient'" title="Gradient Colors">
      <div class="color-grid">
        <BaseColorPicker label="Start" v-model="background.gradient.colors[0]" />
        <BaseColorPicker label="Mid" v-model="background.gradient.colors[1]" />
        <BaseColorPicker label="End" v-model="background.gradient.colors[2]" />
      </div>
      <div class="gradient-options">
        <BaseSelect
          label="Direction"
          v-model="background.gradient.direction"
          :options="[
            { label: 'Radial', value: 'radial' },
            { label: 'Vertical', value: 'vertical' },
            { label: 'Horizontal', value: 'horizontal' },
            { label: 'Diagonal', value: 'diagonal' },
          ]"
        />
        <BaseSlider
          v-if="background.gradient.direction === 'diagonal'"
          label="Angle"
          v-model="background.gradient.angle!"
          :min="0"
          :max="360"
          :step="5"
        />
        <BaseSlider
          label="Opacity"
          v-model="background.gradient.opacity!"
          :min="0"
          :max="1"
          :step="0.05"
        />
      </div>
    </PanelSection>

    <!-- Solid Color Settings -->
    <PanelSection v-if="background.type === 'solid'" title="Background Color">
      <BaseColorPicker label="Solid Color" v-model="background.solidColor" />
      <div style="margin-top: 12px">
        <BaseSlider
          label="Opacity"
          v-model="background.solidOpacity!"
          :min="0"
          :max="1"
          :step="0.05"
        />
      </div>
    </PanelSection>

    <!-- Image Settings -->
    <PanelSection v-if="background.type === 'image'" title="Background Image">
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
          v-model="background.image!.url"
          placeholder="https://..."
        />
        <p class="cors-hint">External URLs require CORS headers. Upload local files for best results.</p>
      </div>
      <div v-if="background.image?.url" class="media-preview">
        <img :src="background.image.url" alt="Background preview" />
      </div>
      <div class="media-options">
        <BaseSelect
          label="Fit"
          v-model="background.image!.fit"
          :options="fitOptions"
        />
        <BaseSlider
          label="Opacity"
          v-model="background.image!.opacity"
          :min="0"
          :max="1"
          :step="0.05"
        />
      </div>
    </PanelSection>

    <!-- Video Settings -->
    <PanelSection v-if="background.type === 'video'" title="Background Video">
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
          v-model="background.video!.url"
          placeholder="https://..."
        />
        <p class="cors-hint">External URLs require CORS headers. Upload local files for best results.</p>
      </div>
      <div v-if="background.video?.url" class="media-preview video-preview">
        <video :src="background.video.url" muted autoplay loop></video>
      </div>
      <div class="media-options">
        <BaseSelect
          label="Fit"
          v-model="background.video!.fit"
          :options="fitOptions"
        />
        <BaseSlider
          label="Opacity"
          v-model="background.video!.opacity"
          :min="0"
          :max="1"
          :step="0.05"
        />
        <div class="video-toggles">
          <label class="toggle-option">
            <input type="checkbox" v-model="background.video!.loop" />
            <span>Loop</span>
          </label>
          <label class="toggle-option">
            <input type="checkbox" v-model="background.video!.muted" />
            <span>Muted</span>
          </label>
        </div>
      </div>
    </PanelSection>

    <!-- Presets -->
    <PanelSection title="Presets">
      <div class="preset-grid">
        <button
          v-for="(preset, name) in presets"
          :key="name"
          class="preset-btn"
          :title="(name as string).charAt(0).toUpperCase() + (name as string).slice(1)"
          @click="emit('preset', name as string)"
        >
          <span
            class="preset-preview"
            :style="{ background: `radial-gradient(${preset.colors[0]}, ${preset.colors[1]})` }"
          ></span>
        </button>
      </div>
    </PanelSection>
  </div>
</template>

<style scoped>
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

/* Color Grid */
.color-grid {
  display: flex;
  gap: 12px;
}

.color-grid > * {
  flex: 1;
}

/* Gradient Options */
.gradient-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
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
