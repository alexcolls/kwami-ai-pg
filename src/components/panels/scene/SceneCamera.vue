<script setup lang="ts">
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';

defineProps<{
  camera: { fov: number; distance: number };
}>();

const emit = defineEmits(['update:camera']);
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
