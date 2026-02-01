<script setup lang="ts">
import { useKwami } from '@/composables/useKwami';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import type { CrystalState, InteractionAction } from '@/stores/avatar';
import AudioVisualizer from '../audio/AudioVisualizer.vue';
import MicrophoneControl from '../audio/MicrophoneControl.vue';
import { watch, onMounted } from 'vue';

// Use defineModel for proper two-way binding (Vue 3.3+)
const state = defineModel<CrystalState>('state', { required: true });
const { kwami, switchRenderer } = useKwami();

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
    case 'switchRenderer':
      const renderer = kwami.value.avatar.getRendererType();
      switchRenderer(renderer === 'blob' ? 'crystal' : 'blob');
      break;
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
      const crystal = kwami.value.avatar.getCrystal();
      if (crystal) crystal.triggerPulse();
      break;
    case 'moveToClick':
      // Not implemented for Crystal
      break;
  }
}

function testAction(action: InteractionAction) {
  executeAction(action);
}

// Watchers for Interaction
watch(() => state.value.interaction, (config) => {
  const crystal = kwami.value?.avatar.getCrystal();
  if (!crystal) return;

  // Apply click handlers
  if (config.click.enabled && config.click.action !== 'none') {
    crystal.onClick = () => executeAction(config.click.action);
  } else {
    crystal.onClick = () => {};
  }

  if (config.doubleClick.enabled && config.doubleClick.action !== 'none') {
    crystal.onDoubleClick = () => executeAction(config.doubleClick.action);
  } else {
    crystal.onDoubleClick = () => {};
  }

  // Right clicks
  if (config.rightClick.enabled && config.rightClick.action !== 'none') {
    crystal.setRightClickCallback(() => executeAction(config.rightClick.action));
  } else {
    crystal.setRightClickCallback(() => {});
  }

  if (config.doubleRightClick.enabled && config.doubleRightClick.action !== 'none') {
    crystal.setDoubleRightClickCallback(() => executeAction(config.doubleRightClick.action));
  } else {
    crystal.setDoubleRightClickCallback(() => {});
  }
}, { deep: true, immediate: true });

// Audio Helpers
function getCrystal() {
  return kwami.value?.avatar.getCrystal();
}

function getScene() {
  return kwami.value?.avatar.getScene();
}

// Watchers for Audio Effects
watch(() => state.value.audioEffects, (s) => {
  const crystal = getCrystal();
  if (crystal) {
    crystal.audioEffects.enabled = s.enabled;
    crystal.audioEffects.reactivity = s.reactivity;
    crystal.audioEffects.smoothing = s.smoothing;
    crystal.audioEffects.bassOrbitBoost = s.bassOrbitBoost;
    crystal.audioEffects.midRotationBoost = s.midRotationBoost;
    crystal.audioEffects.highGlowBoost = s.highGlowBoost;
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
  const crystal = getCrystal();
  if (!crystal) return;
  
  const { top, bottom } = state.value.scene.lighting;
  
  if (typeof crystal.setLightPosition === 'function') {
    const topWeight = top;
    const bottomWeight = bottom;
    const totalWeight = topWeight + bottomWeight + 0.01;
    
    const y = ((topWeight * 500) - (bottomWeight * 500)) / totalWeight;
    const z = ((topWeight * 2000) + (bottomWeight * 400)) / totalWeight;
    
    crystal.setLightPosition(0, y, z);
  }
}

function updateAvatarGlow() {
  const crystal = getCrystal();
  if (!crystal) return;
  
  if (typeof crystal.setLightIntensity === 'function') {
    const ambient = state.value.scene.lighting.ambient;
    // Map ambient (0-2) directly to glow intensity (0-2.5) for crystal
    const glowIntensity = ambient * 1.25;
    crystal.setLightIntensity(glowIntensity);
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
    updateAvatarLighting();
    updateAvatarGlow();
  }
});
</script>

<template>
  <div class="crystal-settings">
    
    <!-- Appearance Section -->
    <PanelSection title="Appearance" collapsible>
      <!-- Formation -->
      <div class="subsection">
        <div class="subsection-header">
          <span class="subsection-title">Formation</span>
        </div>
        <div class="formation-selector">
          <label
            v-for="form in ['constellation', 'helix', 'vortex']"
            :key="form"
            class="formation-option"
            :class="{ active: state.formation === form }"
          >
            <input type="radio" :value="form" v-model="state.formation" />
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
      </div>

      <!-- Colors -->
      <div class="subsection">
        <div class="subsection-header">
          <span class="subsection-title">Colors</span>
        </div>
        <div class="row-3">
          <BaseColorPicker label="Primary" v-model="state.colors.primary" />
          <BaseColorPicker label="Secondary" v-model="state.colors.secondary" />
          <BaseColorPicker label="Accent" v-model="state.colors.accent" />
        </div>
      </div>

      <!-- Core & Shards -->
      <div class="subsection">
        <div class="subsection-header">
          <span class="subsection-title">Core & Shards</span>
        </div>
        <div class="row-2" style="margin-bottom: 12px">
          <BaseColorPicker label="Inner Core" v-model="state.coreColors.inner" />
          <BaseColorPicker label="Outer Core" v-model="state.coreColors.outer" />
        </div>
        <div class="slider-group">
          <BaseSlider label="Glow" :min="0.1" :max="3" :step="0.1" v-model="state.glowIntensity" />
          <BaseSlider label="Count" :min="8" :max="60" :step="1" v-model="state.shardCount" />
        </div>
      </div>

      <!-- Properties -->
      <div class="subsection">
        <div class="subsection-header">
          <span class="subsection-title">Properties</span>
        </div>
        <div class="slider-group">
          <BaseSlider label="Scale" :min="0.5" :max="2" :step="0.05" v-model="state.scale" />
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

    <!-- Animation Section -->
    <PanelSection title="Animation" collapsible>
      <div class="subsection">
        <span class="subsection-title">Rotation Speed</span>
        <div class="slider-group">
          <BaseSlider
            label="Rot X"
            :min="-0.01"
            :max="0.01"
            :step="0.001"
            v-model="state.rotation.x"
          />
          <BaseSlider
            label="Rot Y"
            :min="-0.01"
            :max="0.01"
            :step="0.001"
            v-model="state.rotation.y"
          />
          <BaseSlider
            label="Rot Z"
            :min="-0.01"
            :max="0.01"
            :step="0.001"
            v-model="state.rotation.z"
          />
        </div>
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
          />
          <BaseSlider 
            label="Thinking Duration" 
            :min="1000" 
            :max="30000" 
            :step="500" 
            v-model="state.thinkingDuration"
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
          :min="0" 
          :max="3" 
          :step="0.1" 
          v-model="state.audioEffects.reactivity"
        />
        <BaseSlider
          label="Smoothing"
          :min="0"
          :max="0.3"
          :step="0.005"
          v-model="state.audioEffects.smoothing"
        />
        
        <div class="subsection-title">Frequency Response</div>
        <BaseSlider 
          label="Bass Orbit Boost" 
          :min="0" 
          :max="1" 
          :step="0.05" 
          v-model="state.audioEffects.bassOrbitBoost"
        />
        <BaseSlider 
          label="Mid Rotation Boost" 
          :min="0" 
          :max="1" 
          :step="0.05" 
          v-model="state.audioEffects.midRotationBoost"
        />
        <BaseSlider 
          label="High Glow Boost" 
          :min="0" 
          :max="1" 
          :step="0.05" 
          v-model="state.audioEffects.highGlowBoost"
        />
      </div>
      <p v-if="!state.audioEffects.enabled" class="hint">
        Enable to make crystals react to audio input
      </p>
    </PanelSection>

  </div>
</template>

<style scoped>
.crystal-settings {
  display: flex;
  flex-direction: column;
}

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
.slider-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
</style>
