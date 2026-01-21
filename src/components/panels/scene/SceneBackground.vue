<script setup lang="ts">
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';

type GradientDirection = 'radial' | 'vertical' | 'horizontal' | 'diagonal';
type BackgroundType = 'gradient' | 'solid' | 'transparent';

const props = defineProps<{
  background: {
    type: BackgroundType;
    gradient: { colors: [string, string, string]; direction: GradientDirection };
    solidColor: string;
  };
}>();

const emit = defineEmits<{
  (e: 'preset', name: string): void;
}>();

// Presets management
const presets: Record<string, { colors: [string, string, string] }> = {
  midnight: { colors: ['#0a0a1a', '#1a1a3a', '#0a0a1a'] },
  sunset: { colors: ['#1a0a1a', '#3a1a2a', '#1a0a1a'] },
  ocean: { colors: ['#0a1a2a', '#1a2a3a', '#0a1a2a'] },
  forest: { colors: ['#0a1a0a', '#1a2a1a', '#0a1a0a'] },
  cyber: { colors: ['#1a0a2a', '#0a1a3a', '#1a0a2a'] },
  warm: { colors: ['#2a1a0a', '#3a2a1a', '#2a1a0a'] },
};
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
        <label class="bg-option" :class="{ active: background.type === 'transparent' }">
          <input type="radio" value="transparent" v-model="background.type" />
          <iconify-icon icon="ph:checkerboard-duotone"></iconify-icon>
          <span>None</span>
        </label>
      </div>
    </PanelSection>

    <PanelSection v-if="background.type === 'gradient'" title="Gradient Colors">
      <div class="color-grid">
        <BaseColorPicker label="Start" v-model="background.gradient.colors[0]" />
        <BaseColorPicker label="Mid" v-model="background.gradient.colors[1]" />
        <BaseColorPicker label="End" v-model="background.gradient.colors[2]" />
      </div>
      <div style="margin-top: 12px">
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
      </div>
    </PanelSection>

    <PanelSection v-if="background.type === 'solid'" title="Background Color">
      <BaseColorPicker label="Solid Color" v-model="background.solidColor" />
    </PanelSection>

    <PanelSection title="Presets">
      <div class="preset-grid">
        <button
          v-for="(preset, name) in presets"
          :key="name"
          class="preset-btn"
          :title="name.charAt(0).toUpperCase() + name.slice(1)"
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

/* Preset Grid */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
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
