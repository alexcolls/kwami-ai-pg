<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import { useBlobXyzStore } from '@/stores/avatar.blob-xyz';
import {
  BLOB_SKIN_FAMILIES,
  randomBlobSkinType,
  randomBlobColors,
  randomBlobSurface,
  randomBlobScale,
  randomBlobVector3Degrees,
  randomBlobSpikes,
  randomBlobAmplitude,
  randomBlobTime,
  randomBlobRotation,
  randomBlobBreathing,
  randomBlobTouch,
  randomBlobAudio,
  randomBlobFrequencyBands,
} from 'kwami';
import { 
  useColorPalettes, 
  type PaletteType 
} from '@/composables/avatar/useColorPalettes';
import { 
  useAvatarInteractions, 
  actionOptions, 
  cursorOptions 
} from '@/composables/avatar/useAvatarInteractions';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import AudioVisualizer from '../audio/AudioVisualizer.vue';
import MicrophoneControl from '../audio/MicrophoneControl.vue';

const { kwami } = useKwami();
const blobStore = useBlobXyzStore();
const { skin, shape, animation, clickEvents, cursorTouch, audio } = storeToRefs(blobStore);

// Link toggles for XYZ controls
const linkSpikes = ref(false);
const linkAmplitude = ref(false);
const linkTime = ref(false);
const linkRotation = ref(false);
const linkPosition = ref(false);

// =====================================================
// COMPOSABLES
// =====================================================

function getBlob() {
  return kwami.value?.avatar.getBlob();
}

const { executeAction, testAction } = useAvatarInteractions({
  getRenderer: getBlob,
});

const { palettes, applyPalette } = useColorPalettes();

// =====================================================
// SECTION-SPECIFIC RANDOMIZERS
// =====================================================

const SKIN_FAMILIES = BLOB_SKIN_FAMILIES;

function randomizeStyle() {
  skin.value.type = randomBlobSkinType();
}

// Colors
function randomizeColors() {
  skin.value.colors = randomBlobColors();
}

// Surface properties
function randomizeSurface() {
  Object.assign(skin.value, randomBlobSurface());
}

// Scale
function randomizeScale() {
  shape.value.scale = randomBlobScale();
}

// Position
function randomizePosition() {
  shape.value.position = randomBlobVector3Degrees(linkPosition.value);
}

// Spikes
function randomizeSpikes() {
  shape.value.spikes = randomBlobSpikes(linkSpikes.value);
}

// Amplitude
function randomizeAmplitude() {
  shape.value.amplitude = randomBlobAmplitude(linkAmplitude.value);
}

// Animation Speed
function randomizeSpeed() {
  animation.value.time = randomBlobTime(linkTime.value);
}

// Rotation
function randomizeRotation() {
  animation.value.rotation = randomBlobRotation(linkRotation.value);
}

// Breathing
function randomizeBreathing() {
  animation.value.breathing = randomBlobBreathing();
}

// Touch
function randomizeTouch() {
  cursorTouch.value.touch = randomBlobTouch();
}

// Audio
function randomizeAudio() {
  Object.assign(audio.value, randomBlobAudio());
}

// Frequency Bands
function randomizeFrequencyBands() {
  audio.value.frequencySpikes = randomBlobFrequencyBands();
}

// =====================================================
// COLOR PALETTE HANDLER
// =====================================================

function handleApplyPalette(type: PaletteType) {
  const colors = applyPalette(type);
  skin.value.colors.x = colors.x;
  skin.value.colors.y = colors.y;
  skin.value.colors.z = colors.z;
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
    marble: `radial-gradient(ellipse at 30% 40%, ${x}, ${y} 50%, ${z})`,
    fresnel: `radial-gradient(circle, transparent 20%, ${x} 50%, ${y} 75%, ${z})`,
    iridescent: `linear-gradient(135deg, ${x}, ${y}, ${z}, ${x})`,
    spiral: `conic-gradient(from 45deg, ${x}, ${y}, ${z}, ${x}, ${y}, ${z})`,
    plasma: `radial-gradient(circle at 30% 70%, ${x}, transparent), radial-gradient(circle at 70% 30%, ${y}, transparent), radial-gradient(circle at 50% 50%, ${z}, transparent)`,
    gradient: `linear-gradient(180deg, ${x} 0%, ${y} 50%, ${z} 100%)`,
    matte: `linear-gradient(135deg, ${x}, ${x}dd)`,
    glossy: `radial-gradient(circle at 35% 35%, white 0%, ${x} 40%, ${x}88 100%)`,
    metallic: `linear-gradient(160deg, ${x}44, ${x}, white, ${x}, ${x}44)`,
    subsurface: `radial-gradient(circle, ${x}88, ${x}, ${x}cc)`,
    chrome: `linear-gradient(160deg, #333, #eee, #999, #fff, #666)`,
    clay: `linear-gradient(135deg, #c4956a, #d4a574, #e8c9a8)`,
    jade: `radial-gradient(circle, #6ee7a0, #2ecc71, #1a9c52)`,
    'toon-matcap': `linear-gradient(180deg, ${x}, ${x}88, ${x}44)`,
    hologram: `linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff)`,
    flat: `linear-gradient(180deg, ${x} 50%, ${x}66 50%)`,
    stepped: `linear-gradient(180deg, ${x} 25%, ${y} 25%, ${y} 50%, ${x}88 50%, ${x}88 75%, ${x}44 75%)`,
    halftone: `radial-gradient(circle, ${x} 30%, ${y} 30%)`,
    outlined: `linear-gradient(135deg, ${x}22, ${x}, ${x}22)`,
  } as Record<string, string>;
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

    <div v-for="(subtypes, family) in SKIN_FAMILIES" :key="family" class="skin-family">
      <span class="skin-family-label">{{ family.charAt(0).toUpperCase() + family.slice(1) }}</span>
      <div class="skin-selector">
        <label
          v-for="skinType in subtypes"
          :key="skinType"
          class="skin-option"
          :class="{ active: skin.type === skinType }"
        >
          <input type="radio" :value="skinType" v-model="skin.type" />
          <span class="skin-preview" :style="{ background: skinGradient[skinType] }"></span>
          <span class="skin-label">{{ skinType.charAt(0).toUpperCase() + skinType.slice(1) }}</span>
        </label>
      </div>
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
          @click="handleApplyPalette(key as PaletteType)" 
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
    <p class="section-desc">How the blob responds to sound</p>
    <div class="toggle-row">
      <BaseToggle label="Enable Audio Effects" v-model="audio.enabled" />
    </div>

    <MicrophoneControl />
    <AudioVisualizer />

    <div v-if="audio.enabled" class="slider-group" style="margin-top: 12px">
      <BaseSlider label="Intensity" description="How far spikes push outward with sound" :min="0.1" :max="4" :step="0.1" v-model="audio.reactivity" />
      <BaseSlider label="Spike Density" description="How many new spikes appear with sound. Higher = more spikes burst out" :min="0" :max="4" :step="0.1" v-model="audio.spikeDensity" />
      <BaseSlider label="Threshold" description="Minimum sound level before the blob starts reacting" :min="0.01" :max="0.2" :step="0.005" v-model="audio.sensitivity" />
    </div>
  </PanelSection>

  <!-- ==================== AUDIO DYNAMICS ==================== -->
  <PanelSection v-if="audio.enabled" title="Audio Dynamics" icon="ph:waveform-duotone" collapsible>
    <p class="section-desc">Controls how the blob follows the rhythm</p>
    <div class="slider-group">
      <BaseSlider label="Smoothness" description="Low = punchy, reacts to every syllable. High = fluid, liquid motion" :min="0" :max="1" :step="0.05" v-model="audio.responseSpeed" />
      <BaseSlider label="Punch" description="How sharply the blob reacts to sudden sounds like beats and plosives" :min="0" :max="1" :step="0.05" v-model="audio.transientBoost" />
    </div>
    <div class="toggle-row" style="margin-top: 12px">
      <BaseToggle label="Rotate while playing" v-model="audio.rotateWhilePlaying" />
    </div>
  </PanelSection>

  <!-- ==================== FREQUENCY BALANCE ==================== -->
  <PanelSection v-if="audio.enabled" title="Frequency Balance" icon="ph:equalizer-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeFrequencyBands" title="Randomize frequencies">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Which frequencies drive the blob's movement</p>
    <div class="slider-group">
      <BaseSlider label="Bass" description="Low rumble, bass drops, drum kicks" :min="0" :max="2" :step="0.05" v-model="audio.frequencySpikes.bass" />
      <BaseSlider label="Mid" description="Voice, melody, main instruments" :min="0" :max="2" :step="0.05" v-model="audio.frequencySpikes.mid" />
      <BaseSlider label="High" description="Sibilance, cymbals, high detail" :min="0" :max="2" :step="0.05" v-model="audio.frequencySpikes.high" />
    </div>
  </PanelSection>
</template>

<style scoped>
@import '@/styles/avatar-settings.css';
</style>
