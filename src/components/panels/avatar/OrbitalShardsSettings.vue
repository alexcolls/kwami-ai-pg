<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useKwami } from '@/composables/useKwami';
import { useOrbitalShardsStore, type OrbitalShardsFormation } from '@/stores/avatar.orbital-shards';
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
const orbitalShardsStore = useOrbitalShardsStore();
const { appearance, colors, glow, animation, clickEvents, cursorTouch, audio } = storeToRefs(orbitalShardsStore);

// Link toggle for rotation
const linkRotation = ref(false);

// =====================================================
// COMPOSABLES
// =====================================================

function getOrbitalShards() {
  return (kwami.value?.avatar as any)?.getOrbitalShards();
}

const { executeAction } = useAvatarInteractions({
  getRenderer: getOrbitalShards,
});

function testAction(action: any) {
  executeAction(action);
}

// =====================================================
// HELPERS
// =====================================================
// (Helpers removed as they are now imported or replaced by composables)

// =====================================================
// SECTION-SPECIFIC RANDOMIZERS
// =====================================================

// Formation
function randomizeFormation() {
  const formations: OrbitalShardsFormation[] = ['constellation', 'helix', 'vortex'];
  appearance.value.formation = formations[Math.floor(Math.random() * formations.length)] ?? 'constellation';
  appearance.value.shardCount = Math.floor(randomInRange(8, 60, 1));
}

// Size
function randomizeSize() {
  appearance.value.scale = randomInRange(0.5, 2, 0.05);
}

// Colors
function randomizeColors() {
  colors.value.primary = randomHex();
  colors.value.secondary = randomHex();
  colors.value.accent = randomHex();
}

// Core Colors
function randomizeCoreColors() {
  colors.value.core.inner = randomHex();
  colors.value.core.outer = randomHex();
}

// Glow
function randomizeGlow() {
  glow.value.intensity = randomInRange(0.1, 3, 0.1);
}

// Rotation
function randomizeRotation() {
  if (linkRotation.value) {
    const rot = randomInRange(-0.01, 0.01, 0.001);
    animation.value.rotation = { x: rot, y: rot, z: rot };
  } else {
    animation.value.rotation = {
      x: randomInRange(-0.01, 0.01, 0.001),
      y: randomInRange(-0.01, 0.01, 0.001),
      z: randomInRange(-0.01, 0.01, 0.001),
    };
  }
}

// Audio
function randomizeAudio() {
  audio.value.reactivity = randomInRange(0.5, 3, 0.1);
  audio.value.smoothing = randomInRange(0.02, 0.3, 0.01);
}

// Frequency Boosts
function randomizeFrequencyBoosts() {
  audio.value.frequencyBoosts = {
    bass: randomInRange(0, 1, 0.05),
    mid: randomInRange(0, 1, 0.05),
    high: randomInRange(0, 1.5, 0.05),
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
  const orbitalShards = getOrbitalShards();
  if (!orbitalShards) return;

  orbitalShards.onClick = config.click.enabled && config.click.action !== 'none'
    ? () => executeAction(config.click.action)
    : () => {};

  orbitalShards.onDoubleClick = config.doubleClick.enabled && config.doubleClick.action !== 'none'
    ? () => executeAction(config.doubleClick.action)
    : () => {};

  if (config.rightClick.enabled && config.rightClick.action !== 'none') {
    orbitalShards.setRightClickCallback(() => executeAction(config.rightClick.action));
  } else {
    orbitalShards.setRightClickCallback(() => {});
  }

  if (config.doubleRightClick.enabled && config.doubleRightClick.action !== 'none') {
    orbitalShards.setDoubleRightClickCallback(() => executeAction(config.doubleRightClick.action));
  } else {
    orbitalShards.setDoubleRightClickCallback(() => {});
  }
}, { deep: true, immediate: true });
</script>

<template>
  <!-- ==================== FORMATION ==================== -->
  <PanelSection title="Formation" icon="ph:polygon-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeFormation" title="Randomize formation">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Orbital shards structure and shard arrangement</p>
    <div class="formation-selector">
      <label
        v-for="form in (['constellation', 'helix', 'vortex'] as const)"
        :key="form"
        class="formation-option"
        :class="{ active: appearance.formation === form }"
      >
        <input type="radio" :value="form" v-model="appearance.formation" />
        <iconify-icon
          :icon="
            form === 'constellation'
              ? 'ph:shooting-star-duotone'
              : form === 'helix'
                ? 'ph:dna-duotone'
                : 'ph:spiral-duotone'
          "
          class="formation-icon"
        ></iconify-icon>
        <span class="formation-label">{{ form.charAt(0).toUpperCase() + form.slice(1) }}</span>
      </label>
    </div>
    <div class="slider-group" style="margin-top: 12px">
      <BaseSlider label="Shard Count" :min="8" :max="60" :step="1" v-model="appearance.shardCount" />
    </div>
  </PanelSection>

  <!-- ==================== SIZE ==================== -->
  <PanelSection title="Size" icon="ph:arrows-out-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeSize" title="Randomize size">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Overall crystal scale in the scene</p>
    <BaseSlider label="Scale" :min="0.5" :max="2" :step="0.05" v-model="appearance.scale" />
  </PanelSection>

  <!-- ==================== ORBITAL SHARDS COLORS ==================== -->
  <PanelSection title="Orbital Shards Colors" icon="ph:palette-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeColors" title="Randomize colors">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Main color scheme for the orbital shards</p>
    <div class="row-3">
      <BaseColorPicker label="Primary" v-model="colors.primary" />
      <BaseColorPicker label="Secondary" v-model="colors.secondary" />
      <BaseColorPicker label="Accent" v-model="colors.accent" />
    </div>
  </PanelSection>

  <!-- ==================== CORE COLORS ==================== -->
  <PanelSection title="Core Colors" icon="ph:circle-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeCoreColors" title="Randomize core colors">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Inner and outer core glow colors</p>
    <div class="row-2">
      <BaseColorPicker label="Inner Core" v-model="colors.core.inner" />
      <BaseColorPicker label="Outer Core" v-model="colors.core.outer" />
    </div>
  </PanelSection>

  <!-- ==================== GLOW ==================== -->
  <PanelSection title="Glow" icon="ph:sun-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeGlow" title="Randomize glow">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">Light emission intensity around crystals</p>
    <BaseSlider label="Intensity" :min="0.1" :max="3" :step="0.1" v-model="glow.intensity" />
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
      <BaseSlider label="X" :min="-0.01" :max="0.01" :step="0.001" v-model="animation.rotation.x" />
      <BaseSlider v-if="!linkRotation" label="Y" :min="-0.01" :max="0.01" :step="0.001" v-model="animation.rotation.y" />
      <BaseSlider v-if="!linkRotation" label="Z" :min="-0.01" :max="0.01" :step="0.001" v-model="animation.rotation.z" />
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
    <p class="section-desc">How the orbital shards responds to sound</p>
    
    <div class="toggle-row">
      <BaseToggle label="Enable Audio Effects" v-model="audio.enabled" />
    </div>
    
    <MicrophoneControl />
    <AudioVisualizer />

    <div v-if="audio.enabled" class="slider-group" style="margin-top: 12px">
      <BaseSlider 
        label="Reactivity" 
        :min="0" 
        :max="3" 
        :step="0.1" 
        v-model="audio.reactivity"
      />
      <BaseSlider
        label="Smoothing"
        :min="0"
        :max="0.3"
        :step="0.005"
        v-model="audio.smoothing"
      />
    </div>
  </PanelSection>

  <!-- ==================== FREQUENCY RESPONSE ==================== -->
  <PanelSection title="Frequency Response" icon="ph:equalizer-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeFrequencyBoosts" title="Randomize frequency">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How different frequencies affect the orbital shards</p>
    
    <div class="slider-group">
      <BaseSlider 
        label="Bass (Orbit)" 
        :min="0" 
        :max="1" 
        :step="0.05" 
        v-model="audio.frequencyBoosts.bass"
      />
      <BaseSlider 
        label="Mid (Rotation)" 
        :min="0" 
        :max="1" 
        :step="0.05" 
        v-model="audio.frequencyBoosts.mid"
      />
      <BaseSlider 
        label="High (Glow)" 
        :min="0" 
        :max="1.5" 
        :step="0.05" 
        v-model="audio.frequencyBoosts.high"
      />
    </div>
  </PanelSection>
</template>

<style scoped>
@import '@/styles/avatar-settings.css';

/* Formation Selector */
.formation-selector {
  display: flex;
  gap: 8px;
  background: var(--surface-1);
  padding: 4px;
  border-radius: 10px;
}

.formation-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  font-size: 12px;
  font-weight: 500;
}

.formation-option input {
  display: none;
}

.formation-option:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.formation-option.active {
  background: var(--surface-3);
  color: var(--text-primary);
  border: 1px solid var(--accent-primary);
}

.formation-icon {
  font-size: 18px;
}
</style>
