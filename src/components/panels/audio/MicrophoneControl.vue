<script setup lang="ts">
import { ref } from 'vue';
import { useKwami } from '@/composables/useKwami';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const { kwami } = useKwami();
const micActive = ref(false);
const volume = ref(1);

function getAudio() {
  return kwami.value?.avatar.getAudio();
}

async function toggleMic() {
  const audio = getAudio();
  if (!audio) return;

  if (micActive.value) {
    audio.stopMicrophoneListening();
    micActive.value = false;
  } else {
    try {
      await audio.startMicrophoneListening();
      micActive.value = true;
    } catch (err: unknown) {
      console.error('Failed to start microphone:', err);
    }
  }
}

// Watch volume
import { watch } from 'vue';
watch(volume, (v) => getAudio()?.setVolume(v));

// Sync initial volume
import { onMounted } from 'vue';
onMounted(() => {
  if (kwami.value) {
    const v = getAudio()?.getVolume();
    if (v !== undefined) volume.value = v;
  }
});
</script>

<template>
  <PanelSection title="Microphone">
    <div class="mic-controls">
      <BaseButton
        :variant="micActive ? 'primary' : 'secondary'"
        :icon="micActive ? 'ph:microphone-slash-duotone' : 'ph:microphone-duotone'"
        @click="toggleMic"
      >
        {{ micActive ? 'Stop Mic' : 'Start Mic' }}
      </BaseButton>
      <div class="mic-status">
        <span class="status-indicator" :class="{ active: micActive }"></span>
        <span class="status-text">{{ micActive ? 'Active' : 'Inactive' }}</span>
      </div>
    </div>
  </PanelSection>
</template>

<style scoped>
.mic-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mic-controls :deep(.base-btn) {
  flex: 1;
}

.mic-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: var(--text-muted);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: var(--success);
  box-shadow: 0 0 12px var(--success);
  animation: pulse 1.5s infinite;
}

.status-text {
  font-size: 11px;
  color: var(--text-muted);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
