<script setup lang="ts">
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';

defineProps<{
  lighting: { top: number; bottom: number; ambient: number };
}>();
</script>

<template>
  <PanelSection title="Lighting">
    <div class="slider-group">
      <BaseSlider label="Top" :min="0" :max="2" :step="0.1" v-model="lighting.top" />
      <BaseSlider label="Bottom" :min="0" :max="2" :step="0.1" v-model="lighting.bottom" />
      <BaseSlider label="Ambient" :min="0" :max="2" :step="0.1" v-model="lighting.ambient" />
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
