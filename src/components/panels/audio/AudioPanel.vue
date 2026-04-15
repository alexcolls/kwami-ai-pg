<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAvatarStore } from '@/stores/avatar';
import BasePanel from '@/components/ui/BasePanel.vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import MusicPlayer from '@/components/controls/MusicPlayer.vue';
import BlobXyzSettings from './BlobXyzSettings.vue';
import BlackHoleSettings from './BlackHoleSettings.vue';
import { panelIcons } from '@/constants/panel-icons';

const panelIcon = panelIcons.audio ?? 'ph:waveform-duotone';
const avatarStore = useAvatarStore();
const { rendererType } = storeToRefs(avatarStore);
</script>

<template>
  <BasePanel :icon="panelIcon" title="Audio">
    <BlobXyzSettings v-if="rendererType === 'blob-xyz'" />
    <BlackHoleSettings v-else-if="rendererType === 'black-hole'" />

    <PanelSection v-else title="Audio" icon="ph:warning-circle-duotone" collapsible>
      <p class="section-desc">Audio controls are currently available for Blob XYZ and Black Hole.</p>
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
