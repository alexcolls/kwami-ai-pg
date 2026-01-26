<script setup lang="ts">
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';

defineProps<{
  state: {
    colors: { x: string; y: string; z: string };
    spikes: { x: number; y: number; z: number };
    amplitude: { x: number; y: number; z: number };
    time: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
    opacity: number;
    shininess: number;
    lightIntensity: number;
    wireframe: boolean;
    skin: string;
    resolution: number;
    touchStrength: number;
    touchDuration: number;
    maxTouchPoints: number;
    transitionSpeed: number;
    thinkingDuration: number;
  };
}>();
</script>

<template>
  <div>
    <PanelSection title="Skin">
      <div class="skin-selector">
        <label
          v-for="skin in ['poles', 'donut', 'vintage']"
          :key="skin"
          class="skin-option"
          :class="{ active: state.skin === skin }"
        >
          <input type="radio" :value="skin" v-model="state.skin" />
          <span class="skin-preview" :class="skin"></span>
          <span class="skin-label">{{ skin.charAt(0).toUpperCase() + skin.slice(1) }}</span>
        </label>
      </div>
    </PanelSection>

    <PanelSection title="Colors">
      <div class="row-3">
        <BaseColorPicker label="X Axis" v-model="state.colors.x" />
        <BaseColorPicker label="Y Axis" v-model="state.colors.y" />
        <BaseColorPicker label="Z Axis" v-model="state.colors.z" />
      </div>
    </PanelSection>

    <PanelSection title="Spikes">
      <div class="slider-group">
        <BaseSlider label="X" :min="0" :max="8" :step="0.05" v-model="state.spikes.x" />
        <BaseSlider label="Y" :min="0" :max="8" :step="0.05" v-model="state.spikes.y" />
        <BaseSlider label="Z" :min="0" :max="8" :step="0.05" v-model="state.spikes.z" />
      </div>
    </PanelSection>

    <PanelSection title="Amplitude">
      <div class="slider-group">
        <BaseSlider label="X" :min="0.1" :max="2" :step="0.05" v-model="state.amplitude.x" />
        <BaseSlider label="Y" :min="0.1" :max="2" :step="0.05" v-model="state.amplitude.y" />
        <BaseSlider label="Z" :min="0.1" :max="2" :step="0.05" v-model="state.amplitude.z" />
      </div>
    </PanelSection>

    <PanelSection title="Time">
      <div class="slider-group">
        <BaseSlider label="X" :min="0.1" :max="10" :step="0.1" v-model="state.time.x" />
        <BaseSlider label="Y" :min="0.1" :max="10" :step="0.1" v-model="state.time.y" />
        <BaseSlider label="Z" :min="0.1" :max="10" :step="0.1" v-model="state.time.z" />
      </div>
    </PanelSection>

    <PanelSection title="Rotation">
      <div class="slider-group">
        <BaseSlider label="X" :min="0" :max="0.02" :step="0.001" v-model="state.rotation.x" />
        <BaseSlider label="Y" :min="0" :max="0.02" :step="0.001" v-model="state.rotation.y" />
        <BaseSlider label="Z" :min="0" :max="0.02" :step="0.001" v-model="state.rotation.z" />
      </div>
    </PanelSection>

    <PanelSection title="Appearance">
      <div class="slider-group">
        <BaseSlider label="Scale" :min="0.5" :max="10" :step="0.1" v-model="state.scale" />
        <BaseSlider label="Opacity" :min="0" :max="1" :step="0.01" v-model="state.opacity" />
        <BaseSlider label="Shininess" :min="1" :max="200" :step="1" v-model="state.shininess" />
        <BaseSlider label="Light" :min="0" :max="5" :step="0.1" v-model="state.lightIntensity" />
      </div>
      <div style="margin-top: 12px">
        <BaseToggle label="Wireframe" v-model="state.wireframe" />
      </div>
    </PanelSection>

    <PanelSection title="Quality">
      <div class="slider-group">
        <BaseSlider 
          label="Resolution" 
          :min="32" 
          :max="512" 
          :step="8" 
          v-model="state.resolution"
        />
      </div>
      <p class="hint">Higher resolution = more detail but lower performance</p>
    </PanelSection>

    <PanelSection title="Touch Interaction">
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
    </PanelSection>

    <PanelSection title="Transitions">
      <div class="slider-group">
        <BaseSlider 
          label="Transition Speed" 
          :min="0.01" 
          :max="0.2" 
          :step="0.01" 
          v-model="state.transitionSpeed"
        />
        <BaseSlider 
          label="Thinking Duration (ms)" 
          :min="1000" 
          :max="30000" 
          :step="500" 
          v-model="state.thinkingDuration"
        />
      </div>
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

.skin-preview.poles {
  background: conic-gradient(#ff0066, #00ff66, #6600ff, #ff0066);
}

.skin-preview.donut {
  background: linear-gradient(180deg, #ff0066 0%, #00ff66 50%, #6600ff 100%);
}

.skin-preview.vintage {
  background: radial-gradient(circle, #ff0066, #00ff66, #6600ff);
}

.skin-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-secondary);
}

.skin-option.active .skin-label {
  color: var(--text-primary);
}

/* Slider Group */
.slider-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
