<script setup lang="ts">
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';

// Use defineModel for proper two-way binding (Vue 3.3+)
const camera = defineModel<{ fov: number; distance: number }>('camera', { required: true });
</script>

<template>
  <PanelSection title="Camera">
    <div class="slider-group">
      <BaseSlider label="FOV" :min="30" :max="150" :step="1" v-model="camera.fov" />
      <BaseSlider label="Distance" :min="2" :max="20" :step="0.5" v-model="camera.distance" />
    </div>
  </PanelSection>
</template>

<style scoped>
.slider-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
