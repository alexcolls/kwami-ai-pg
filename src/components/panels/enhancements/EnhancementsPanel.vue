<script setup lang="ts">
import { reactive, watch } from 'vue';
import { panelIcons } from '@/constants/panel-icons';
import { useKwami } from '@/composables/useKwami';
import type { VoiceEnhancementsConfig, VADConfig } from 'kwami-ai';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';

const { kwami, isConnected } = useKwami();

// State
const turnDetection = reactive({
  enabled: true,
  mode: 'model' as 'vad' | 'stt' | 'model' | 'manual',
  model: 'multilingual' as 'english' | 'multilingual',
  minEndpointingDelay: 0.5,
  maxEndpointingDelay: 3.0,
});

const interruptions = reactive({ enabled: true, minDuration: 0.5, minWords: 0 });
const noiseCancellation = reactive({ enabled: true, mode: 'bvc' as 'bvc' | 'krisp' | 'default' });
const vad = reactive({ provider: 'silero', threshold: 0.5, minSpeech: 0.1, minSilence: 0.5 });
const audioProcessing = reactive({ echoCancellation: true, autoGainControl: true });
const performance = reactive({ preemptiveGeneration: false });

function applySettings() {
  if (!kwami.value) return;

  const config: VoiceEnhancementsConfig = {
    turnDetection: {
      enabled: turnDetection.enabled,
      mode: turnDetection.mode,
      model: turnDetection.model,
      minEndpointingDelay: turnDetection.minEndpointingDelay,
      maxEndpointingDelay: turnDetection.maxEndpointingDelay,
      allowInterruptions: interruptions.enabled,
      minInterruptionDuration: interruptions.minDuration,
      minInterruptionWords: interruptions.minWords,
    },
    noiseCancellation: { enabled: noiseCancellation.enabled, mode: noiseCancellation.mode },
    echoCancellation: audioProcessing.echoCancellation,
    autoGainControl: audioProcessing.autoGainControl,
    preemptiveGeneration: performance.preemptiveGeneration,
  };

  const vadConfig: VADConfig = {
    provider: vad.provider as 'silero',
    threshold: vad.threshold,
    minSpeechDuration: vad.minSpeech,
    minSilenceDuration: vad.minSilence,
  };

  // Update local config
  kwami.value.agent.updateConfig({
    livekit: {
      ...kwami.value.agent.getConfig().livekit,
      voice: {
        ...kwami.value.agent.getConfig().livekit?.voice,
        enhancements: config,
        vad: vadConfig,
      },
    },
  });

  // If connected, sync to backend immediately
  if (isConnected.value) {
    console.log('📤 Syncing enhancements to backend:', config);
    kwami.value.agent.syncConfigToBackend('voice', {
      enhancements: config,
      vad: vadConfig,
    });
  }

  console.log('Enhancements applied:', config, vadConfig);
}

// =============================================================================
// Live Update Watchers - Apply settings automatically when values change
// =============================================================================

// Debounce helper to avoid too many updates
let applyTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedApply() {
  if (applyTimeout) clearTimeout(applyTimeout);
  applyTimeout = setTimeout(() => {
    applySettings();
  }, 300);
}

// Watch all enhancement settings for changes
watch(() => turnDetection.enabled, debouncedApply);
watch(() => turnDetection.mode, debouncedApply);
watch(() => turnDetection.model, debouncedApply);
watch(() => turnDetection.minEndpointingDelay, debouncedApply);
watch(() => turnDetection.maxEndpointingDelay, debouncedApply);

watch(() => interruptions.enabled, debouncedApply);
watch(() => interruptions.minDuration, debouncedApply);
watch(() => interruptions.minWords, debouncedApply);

watch(() => noiseCancellation.enabled, debouncedApply);
watch(() => noiseCancellation.mode, debouncedApply);

watch(() => vad.provider, debouncedApply);
watch(() => vad.threshold, debouncedApply);
watch(() => vad.minSpeech, debouncedApply);
watch(() => vad.minSilence, debouncedApply);

watch(() => audioProcessing.echoCancellation, debouncedApply);
watch(() => audioProcessing.autoGainControl, debouncedApply);

watch(() => performance.preemptiveGeneration, debouncedApply);
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon :icon="panelIcons.enhancements" class="panel-icon"></iconify-icon>
      <h2>Enhancements</h2>
    </div>

    <div class="panel-body">
      <!-- Turn Detection -->
      <PanelSection title="Turn Detection" icon="ph:chat-circle-dots-duotone">
        <div class="row">
          <div class="info">
            <span class="label">Enable Turn Detection</span>
            <span class="desc">Automatically detect when user finishes speaking</span>
          </div>
          <BaseToggle v-model="turnDetection.enabled" />
        </div>

        <div class="config-form" v-if="turnDetection.enabled">
          <BaseSelect
            label="Detection Mode"
            v-model="turnDetection.mode"
            :options="[
              { label: 'Turn Detector Model', value: 'model' },
              { label: 'VAD Only', value: 'vad' },
              { label: 'STT Endpointing', value: 'stt' },
              { label: 'Manual Control', value: 'manual' },
            ]"
          />

          <BaseSelect
            v-if="turnDetection.mode === 'model'"
            label="Model Type"
            v-model="turnDetection.model"
            :options="[
              { label: 'Multilingual', value: 'multilingual' },
              { label: 'English Only', value: 'english' },
            ]"
          />

          <BaseSlider
            label="Min Endpointing Delay (s)"
            :min="0"
            :max="2"
            :step="0.1"
            v-model="turnDetection.minEndpointingDelay"
          />
          <BaseSlider
            label="Max Endpointing Delay (s)"
            :min="1"
            :max="5"
            :step="0.5"
            v-model="turnDetection.maxEndpointingDelay"
          />
        </div>
      </PanelSection>

      <!-- Interruptions -->
      <PanelSection title="Interruptions" icon="ph:hand-palm-duotone">
        <div class="row">
          <div class="info">
            <span class="label">Allow Interruptions</span>
            <span class="desc">Let user interrupt agent while speaking</span>
          </div>
          <BaseToggle v-model="interruptions.enabled" />
        </div>
        <div class="config-form" v-if="interruptions.enabled">
          <BaseSlider
            label="Min Interruption Duration (s)"
            :min="0.1"
            :max="1.5"
            :step="0.1"
            v-model="interruptions.minDuration"
          />
          <BaseSlider
            label="Min Interruption Words"
            :min="0"
            :max="5"
            :step="1"
            v-model="interruptions.minWords"
          />
        </div>
      </PanelSection>

      <!-- Noise Cancellation -->
      <PanelSection title="Noise Cancellation" icon="ph:speaker-x-duotone">
        <div class="row">
          <div class="info">
            <span class="label">Enable Noise Cancellation</span>
            <span class="desc">Reduce background noise in audio input</span>
          </div>
          <BaseToggle v-model="noiseCancellation.enabled" />
        </div>
        <div class="config-form" v-if="noiseCancellation.enabled">
          <BaseSelect
            label="Mode"
            v-model="noiseCancellation.mode"
            :options="[
              { label: 'BVC (Background Voice Cancellation)', value: 'bvc' },
              { label: 'Krisp', value: 'krisp' },
              { label: 'Default', value: 'default' },
            ]"
          />
        </div>
      </PanelSection>

      <!-- VAD Settings -->
      <PanelSection title="Voice Activity Detection (VAD)" icon="ph:waveform-duotone">
        <div class="config-form">
          <BaseSelect
            label="Provider"
            v-model="vad.provider"
            :options="[{ label: 'Silero', value: 'silero' }]"
          />
          <BaseSlider
            label="Speech Threshold"
            :min="0"
            :max="1"
            :step="0.05"
            v-model="vad.threshold"
          />
          <BaseSlider
            label="Min Speech Duration (s)"
            :min="0"
            :max="0.5"
            :step="0.05"
            v-model="vad.minSpeech"
          />
          <BaseSlider
            label="Min Silence Duration (s)"
            :min="0.1"
            :max="1"
            :step="0.1"
            v-model="vad.minSilence"
          />
        </div>
      </PanelSection>

      <!-- Audio Enhancements -->
      <PanelSection title="Audio Processing" icon="ph:speaker-high-duotone">
        <div class="row">
          <div class="info">
            <span class="label">Echo Cancellation</span>
            <span class="desc">Prevent audio feedback loops</span>
          </div>
          <BaseToggle v-model="audioProcessing.echoCancellation" />
        </div>
        <div class="row">
          <div class="info">
            <span class="label">Auto Gain Control</span>
            <span class="desc">Automatically adjust microphone volume</span>
          </div>
          <BaseToggle v-model="audioProcessing.autoGainControl" />
        </div>
      </PanelSection>

      <!-- Performance -->
      <PanelSection title="Performance" icon="ph:lightning-duotone">
        <div class="row">
          <div class="info">
            <span class="label">Preemptive Generation</span>
            <span class="desc">Start generating response before turn ends</span>
          </div>
          <BaseToggle v-model="performance.preemptiveGeneration" />
        </div>
      </PanelSection>

    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--surface-1);
  border-radius: 10px;
  margin-bottom: 12px;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}
.desc {
  font-size: 11px;
  color: var(--text-tertiary);
}
.config-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  background: var(--surface-0);
  padding: 12px;
  border-radius: 8px;
}

.status-indicator {
  margin: 0;
}

.live-notice,
.saved-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
  margin: 0;
}

.live-notice {
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 255, 136, 0.1));
  border: 1px solid rgba(0, 217, 255, 0.2);
  color: var(--accent-primary);
}

.live-notice iconify-icon {
  font-size: 16px;
  animation: pulse 2s ease-in-out infinite;
}

.saved-notice {
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
}

.saved-notice iconify-icon {
  font-size: 16px;
  color: var(--text-muted);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
