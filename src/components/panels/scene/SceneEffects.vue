<script setup lang="ts">
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';

export interface StarFieldConfig {
  enabled: boolean;
  count: number;
  fieldRadius: number;
  twinkleSpeed: number;
  rotationSpeed: number;
}

export interface SceneEffectsConfig {
  starField: StarFieldConfig;
}

const effects = defineModel<SceneEffectsConfig>('effects', { required: true });
</script>

<template>
  <!-- 3D STAR FIELD -->
  <PanelSection title="3D Star Field" icon="ph:star-duotone" collapsible>
    <div class="effect-header">
      <BaseToggle
        label="Enable Stars"
        :modelValue="effects.starField.enabled"
        @update:modelValue="effects.starField.enabled = $event"
      />
    </div>

    <template v-if="effects.starField.enabled">
      <div class="settings-group">
        <BaseSlider
          label="Star Count"
          :modelValue="effects.starField.count"
          @update:modelValue="effects.starField.count = $event"
          :min="1000"
          :max="20000"
          :step="1000"
        />
        <BaseSlider
          label="Field Radius"
          :modelValue="effects.starField.fieldRadius"
          @update:modelValue="effects.starField.fieldRadius = $event"
          :min="200"
          :max="1000"
          :step="50"
        />
        <BaseSlider
          label="Twinkle Speed"
          :modelValue="effects.starField.twinkleSpeed"
          @update:modelValue="effects.starField.twinkleSpeed = $event"
          :min="0"
          :max="5"
          :step="0.1"
        />
        <BaseSlider
          label="Rotation Speed"
          :modelValue="effects.starField.rotationSpeed * 10000"
          @update:modelValue="effects.starField.rotationSpeed = $event / 10000"
          :min="0"
          :max="50"
          :step="1"
        />
      </div>
    </template>

    <p class="effect-hint">
      <iconify-icon icon="ph:info-duotone"></iconify-icon>
      3D stars render in the scene space, creating depth and parallax
    </p>
  </PanelSection>
</template>

<style scoped>
.effect-header {
  margin-bottom: 12px;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.effect-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 10px;
  background: var(--surface-1);
  border-radius: var(--radius-md);
  font-size: 11px;
  color: var(--text-muted);
}

.effect-hint iconify-icon {
  font-size: 14px;
  color: var(--accent-primary);
}
</style>
