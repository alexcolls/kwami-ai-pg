<script setup lang="ts">
// import { ref } from 'vue'
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';

const props = defineProps<{
  state: any;
  rendererType: 'blob' | 'crystal';
}>();

// Sections collapse state (simplified local state)
// const showReactivity = ref(true)
// const showResponse = ref(false)
// const showFrequency = ref(false)
// const showTime = ref(false)
</script>

<template>
  <div>
    <PanelSection title="Global Effects">
      <BaseToggle
        :label="rendererType === 'crystal' ? 'Enable Audio Effects' : 'Enable Audio Reactivity'"
        v-model="state.enabled"
      />
    </PanelSection>

    <PanelSection title="Reactivity" collapsible>
      <div class="slider-group">
        <BaseSlider label="Intensity" :min="0" :max="5" :step="0.1" v-model="state.reactivity" />
        <BaseSlider
          :label="rendererType === 'crystal' ? 'Smoothing' : 'Sensitivity'"
          :min="0"
          :max="0.3"
          :step="0.005"
          v-model="state.sensitivity"
        />
        <BaseSlider
          v-if="rendererType === 'blob'"
          label="Breathing"
          :min="0"
          :max="0.2"
          :step="0.005"
          v-model="state.breathing"
        />
      </div>
    </PanelSection>

    <PanelSection v-if="rendererType === 'blob'" title="Response Dynamics" collapsible>
      <div class="slider-group">
        <BaseSlider label="Speed" :min="0" :max="1" :step="0.05" v-model="state.responseSpeed" />
        <BaseSlider
          label="Transient"
          :min="0"
          :max="1"
          :step="0.05"
          v-model="state.transientBoost"
        />
      </div>
    </PanelSection>

    <PanelSection title="Frequency Spikes" collapsible>
      <div class="slider-group">
        <BaseSlider label="Bass" :min="0" :max="2" :step="0.05" v-model="state.bassSpike" />
        <BaseSlider label="Mid" :min="0" :max="2" :step="0.05" v-model="state.midSpike" />
        <BaseSlider label="High" :min="0" :max="2" :step="0.05" v-model="state.highSpike" />
      </div>
    </PanelSection>

    <PanelSection v-if="rendererType === 'blob'" title="Time Modulation" collapsible defaultCollapsed>
      <div style="margin-bottom: 8px">
        <BaseToggle label="Enable Time Effects" v-model="state.timeEnabled" />
      </div>
      <div class="slider-group" v-if="state.timeEnabled">
        <BaseSlider label="Mid Time" :min="0" :max="0.5" :step="0.01" v-model="state.midTime" />
        <BaseSlider label="High Time" :min="0" :max="0.5" :step="0.01" v-model="state.highTime" />
        <BaseSlider label="Ultra Time" :min="0" :max="0.5" :step="0.01" v-model="state.ultraTime" />
      </div>
    </PanelSection>
  </div>
</template>

<style scoped>
.slider-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
