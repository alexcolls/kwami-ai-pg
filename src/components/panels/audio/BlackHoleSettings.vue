<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useBlackHoleStore } from '@/stores/avatar.black-hole';
import { randomInRange } from '@/utils/color';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import AudioVisualizer from './AudioVisualizer.vue';
import MicrophoneControl from './MicrophoneControl.vue';

const blackHoleStore = useBlackHoleStore();
const { audio } = storeToRefs(blackHoleStore);

function randomizeAudio() {
  audio.value.reactivity = randomInRange(0.5, 2, 0.1);
  audio.value.smoothing = randomInRange(0.7, 0.95, 0.01);
}

function randomizeFrequencyEffects() {
  audio.value.frequencyEffects = {
    bassDiskGlow: randomInRange(0.2, 0.8, 0.05),
    midDiskSpeed: randomInRange(0.1, 0.5, 0.05),
    highStarTwinkle: randomInRange(0.2, 0.6, 0.05),
  };
}
</script>

<template>
  <PanelSection title="Black Hole Audio" icon="ph:waveform-duotone" collapsible>
    <p class="section-desc">Configure how the black hole reacts to sound input.</p>
  </PanelSection>

  <PanelSection title="Audio Reactivity" icon="ph:microphone-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeAudio" title="Randomize audio settings">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How the black hole responds to sound</p>

    <div class="toggle-row">
      <BaseToggle label="Enable Audio Effects" v-model="audio.enabled" />
    </div>

    <MicrophoneControl />
    <AudioVisualizer />

    <div v-if="audio.enabled" class="slider-group" style="margin-top: 12px">
      <BaseSlider label="Reactivity" :min="0" :max="2" :step="0.1" v-model="audio.reactivity" />
      <BaseSlider label="Smoothing" :min="0.5" :max="0.99" :step="0.01" v-model="audio.smoothing" />
    </div>
  </PanelSection>

  <PanelSection v-if="audio.enabled" title="Frequency Response" icon="ph:equalizer-duotone" collapsible>
    <template #actions>
      <button class="dice-btn" @click="randomizeFrequencyEffects" title="Randomize frequency response">
        <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
      </button>
    </template>
    <p class="section-desc">How different frequencies affect the visualization</p>

    <div class="slider-group">
      <BaseSlider label="Bass (Disk Glow)" :min="0" :max="1" :step="0.05" v-model="audio.frequencyEffects.bassDiskGlow" />
      <BaseSlider label="Mid (Disk Speed)" :min="0" :max="1" :step="0.05" v-model="audio.frequencyEffects.midDiskSpeed" />
      <BaseSlider label="High (Star Twinkle)" :min="0" :max="1" :step="0.05" v-model="audio.frequencyEffects.highStarTwinkle" />
    </div>
  </PanelSection>
</template>

<style scoped>
@import '@/styles/avatar-settings.css';
</style>
