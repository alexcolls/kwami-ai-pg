<script setup lang="ts">
import { reactive, onMounted, watch, ref } from 'vue';
import { useKwami } from '@/composables/useKwami';
import AudioVisualizer from './AudioVisualizer.vue';
import MicrophoneControl from './MicrophoneControl.vue';
import AudioSettings from './AudioSettings.vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';

const { kwami, rendererType } = useKwami();

// Volume State
const volume = ref(1);

// Audio Audio State
const audioState = reactive({
  enabled: true,
  reactivity: 1.9,
  sensitivity: 0.075,
  breathing: 0.035,
  responseSpeed: 0.75,
  transientBoost: 0.5,
  bassSpike: 0.65,
  midSpike: 0.5,
  highSpike: 0.38,
  timeEnabled: false,
  midTime: 0.1,
  highTime: 0.18,
  ultraTime: 0.08,
});

// Helpers
function getBlob() {
  return kwami.value?.avatar.getBlob();
}
function getCrystal() {
  return kwami.value?.avatar.getCrystal();
}
function getAudio() {
  return kwami.value?.avatar.getAudio();
}

function syncFromKwami() {
  // Sync volume
  const v = getAudio()?.getVolume();
  if (v !== undefined) volume.value = v;

  if (rendererType.value === 'blob') {
    const blob = getBlob();
    if (blob) {
      audioState.enabled = blob.audioEffects.enabled;
      audioState.reactivity = blob.audioEffects.reactivity || 0;
      audioState.sensitivity = blob.audioEffects.sensitivity || 0;
      audioState.breathing = blob.audioEffects.breathing || 0;
      audioState.responseSpeed = blob.audioEffects.responseSpeed || 0;
      audioState.transientBoost = blob.audioEffects.transientBoost || 0;
      audioState.bassSpike = blob.audioEffects.bassSpike || 0;
      audioState.midSpike = blob.audioEffects.midSpike || 0;
      audioState.highSpike = blob.audioEffects.highSpike || 0;
      audioState.timeEnabled = blob.audioEffects.timeEnabled;
      audioState.midTime = blob.audioEffects.midTime || 0;
      audioState.highTime = blob.audioEffects.highTime || 0;
      audioState.ultraTime = blob.audioEffects.ultraTime || 0;
    }
  } else {
    const crystal = getCrystal();
    if (crystal) {
      audioState.enabled = crystal.audioEffects.enabled;
      audioState.reactivity = crystal.audioEffects.reactivity;
      audioState.sensitivity = crystal.audioEffects.smoothing;
      audioState.bassSpike = crystal.audioEffects.bassOrbitBoost;
      audioState.midSpike = crystal.audioEffects.midRotationBoost;
      audioState.highSpike = crystal.audioEffects.highGlowBoost;
    }
  }
}

// Watchers
watch(volume, (v) => {
  getAudio()?.setVolume(v);
});

watch(
  audioState,
  (s) => {
    if (rendererType.value === 'blob') {
      const blob = getBlob();
      if (blob) {
        blob.audioEffects.enabled = s.enabled;
        blob.audioEffects.reactivity = s.reactivity;
        blob.audioEffects.sensitivity = s.sensitivity;
        blob.audioEffects.breathing = s.breathing;
        blob.audioEffects.responseSpeed = s.responseSpeed;
        blob.audioEffects.transientBoost = s.transientBoost;
        blob.audioEffects.bassSpike = s.bassSpike;
        blob.audioEffects.midSpike = s.midSpike;
        blob.audioEffects.highSpike = s.highSpike;
        blob.audioEffects.timeEnabled = s.timeEnabled;
        blob.audioEffects.midTime = s.midTime;
        blob.audioEffects.highTime = s.highTime;
        blob.audioEffects.ultraTime = s.ultraTime;
      }
    } else {
      const crystal = getCrystal();
      if (crystal) {
        crystal.audioEffects.enabled = s.enabled;
        crystal.audioEffects.reactivity = s.reactivity;
        crystal.audioEffects.smoothing = s.sensitivity;
        crystal.audioEffects.bassOrbitBoost = s.bassSpike;
        crystal.audioEffects.midRotationBoost = s.midSpike;
        crystal.audioEffects.highGlowBoost = s.highSpike;
      }
    }
  },
  { deep: true },
);

watch(rendererType, () => syncFromKwami());

onMounted(() => {
  if (kwami.value) syncFromKwami();
  else
    watch(
      kwami,
      (k) => {
        if (k) syncFromKwami();
      },
      { once: true },
    );
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:waveform-duotone" class="panel-icon"></iconify-icon>
      <h2>Audio</h2>
    </div>

    <div class="panel-body">
      <!-- Volume -->
      <PanelSection title="Volume">
        <div style="display: flex; align-items: center; gap: 12px">
          <iconify-icon
            icon="ph:speaker-high-duotone"
            style="font-size: 20px; color: var(--text-secondary)"
          ></iconify-icon>
          <div style="flex: 1">
            <BaseSlider :min="0" :max="1" :step="0.01" v-model="volume" />
          </div>
        </div>
      </PanelSection>

      <AudioSettings :state="audioState" :rendererType="rendererType" />
      <MicrophoneControl />
      <AudioVisualizer />
    </div>
  </div>
</template>
