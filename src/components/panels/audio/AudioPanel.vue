<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { randomBlobAudio, randomBlobFrequencyBands } from 'kwami';
import { useAvatarStore } from '@/stores/avatar';
import { useBlobXyzStore } from '@/stores/avatar.blob-xyz';
import BasePanel from '@/components/ui/BasePanel.vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import AudioVisualizer from './AudioVisualizer.vue';
import MicrophoneControl from './MicrophoneControl.vue';
import MusicPlayer from '@/components/controls/MusicPlayer.vue';
import { panelIcons } from '@/constants/panel-icons';

const panelIcon = panelIcons.audio ?? 'ph:waveform-duotone';
const avatarStore = useAvatarStore();
const blobStore = useBlobXyzStore();
const { rendererType } = storeToRefs(avatarStore);
const { audio } = storeToRefs(blobStore);

function randomizeAudio() {
  Object.assign(audio.value, randomBlobAudio());
}

function randomizeFrequencyBands() {
  audio.value.frequencySpikes = randomBlobFrequencyBands();
}
</script>

<template>
  <BasePanel :icon="panelIcon" title="Audio">
    <template v-if="rendererType === 'blob-xyz'">
      <PanelSection title="Blob XYZ Audio" icon="ph:microphone-stage-duotone" collapsible>
        <p class="section-desc">Configure how Blob XYZ reacts to sound input.</p>
      </PanelSection>

      <PanelSection title="Audio Reactivity" icon="ph:microphone-duotone" collapsible>
        <template #actions>
          <button class="dice-btn" @click="randomizeAudio" title="Randomize audio">
            <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
          </button>
        </template>
        <p class="section-desc">How the blob responds to sound</p>
        <div class="toggle-row">
          <BaseToggle label="Enable Audio Effects" v-model="audio.enabled" />
        </div>

        <MicrophoneControl />
        <AudioVisualizer />

        <div v-if="audio.enabled" class="slider-group" style="margin-top: 12px">
          <BaseSlider label="Intensity" description="How far spikes push outward with sound" :min="0.1" :max="4" :step="0.1" v-model="audio.reactivity" />
          <BaseSlider label="Spike Density" description="How many new spikes appear with sound. Higher = more spikes burst out" :min="0" :max="4" :step="0.1" v-model="audio.spikeDensity" />
          <BaseSlider label="Threshold" description="Minimum sound level before the blob starts reacting" :min="0.01" :max="0.2" :step="0.005" v-model="audio.sensitivity" />
        </div>
      </PanelSection>

      <PanelSection v-if="audio.enabled" title="Audio Dynamics" icon="ph:waveform-duotone" collapsible>
        <p class="section-desc">Controls how the blob follows the rhythm</p>
        <div class="slider-group">
          <BaseSlider label="Smoothness" description="Low = punchy, reacts to every syllable. High = fluid, liquid motion" :min="0" :max="1" :step="0.05" v-model="audio.responseSpeed" />
          <BaseSlider label="Punch" description="How sharply the blob reacts to sudden sounds like beats and plosives" :min="0" :max="1" :step="0.05" v-model="audio.transientBoost" />
        </div>
        <div class="toggle-row" style="margin-top: 12px">
          <BaseToggle label="Rotate while playing" v-model="audio.rotateWhilePlaying" />
        </div>
      </PanelSection>

      <PanelSection v-if="audio.enabled" title="Frequency Balance" icon="ph:equalizer-duotone" collapsible>
        <template #actions>
          <button class="dice-btn" @click="randomizeFrequencyBands" title="Randomize frequencies">
            <iconify-icon icon="ph:dice-three-duotone"></iconify-icon>
          </button>
        </template>
        <p class="section-desc">Which frequencies drive the blob's movement</p>
        <div class="slider-group">
          <BaseSlider label="Bass" description="Low rumble, bass drops, drum kicks" :min="0" :max="2" :step="0.05" v-model="audio.frequencySpikes.bass" />
          <BaseSlider label="Mid" description="Voice, melody, main instruments" :min="0" :max="2" :step="0.05" v-model="audio.frequencySpikes.mid" />
          <BaseSlider label="High" description="Sibilance, cymbals, high detail" :min="0" :max="2" :step="0.05" v-model="audio.frequencySpikes.high" />
        </div>
      </PanelSection>
    </template>

    <PanelSection v-else title="Audio" icon="ph:warning-circle-duotone" collapsible>
      <p class="section-desc">Audio controls are currently available only for Blob XYZ.</p>
    </PanelSection>

    <PanelSection title="Audio Player" icon="ph:music-notes-duotone">
      <p class="section-desc">Shared audio player for all avatars. Load and play local tracks to drive animation.</p>
      <div class="music-player-host">
        <MusicPlayer />
      </div>
    </PanelSection>
  </BasePanel>
</template>

<style scoped>
@import '@/styles/avatar-settings.css';

.music-player-host {
  position: relative;
}
</style>
