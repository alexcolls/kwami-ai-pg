<script setup lang="ts">
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';

defineProps<{
  state: {
    formation: string;
    colors: { primary: string; secondary: string; accent: string };
    coreColors: { inner: string; outer: string };
    glowIntensity: number;
    shardCount: number;
    scale: number;
    rotation: { x: number; y: number; z: number };
  };
}>();
</script>

<template>
  <div>
    <PanelSection title="Formation">
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
    </PanelSection>

    <PanelSection title="Colors">
      <div class="row-3">
        <BaseColorPicker label="Primary" v-model="state.colors.primary" />
        <BaseColorPicker label="Secondary" v-model="state.colors.secondary" />
        <BaseColorPicker label="Accent" v-model="state.colors.accent" />
      </div>
    </PanelSection>

    <PanelSection title="Core & Shards">
      <div class="row-2" style="margin-bottom: 12px">
        <BaseColorPicker label="Inner Core" v-model="state.coreColors.inner" />
        <BaseColorPicker label="Outer Core" v-model="state.coreColors.outer" />
      </div>
      <div class="slider-group">
        <BaseSlider label="Glow" :min="0.1" :max="3" :step="0.1" v-model="state.glowIntensity" />
        <BaseSlider label="Count" :min="8" :max="60" :step="1" v-model="state.shardCount" />
      </div>
    </PanelSection>

    <PanelSection title="Transform">
      <div class="slider-group">
        <BaseSlider label="Scale" :min="0.5" :max="2" :step="0.05" v-model="state.scale" />
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
    </PanelSection>
  </div>
</template>

<style scoped>
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
</style>
