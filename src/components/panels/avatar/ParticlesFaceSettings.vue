<script setup lang="ts">
import { useParticlesFaceStore } from '@/stores/avatar.particles-face';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';

const pfStore = useParticlesFaceStore();
</script>

<template>
  <!-- Colors -->
  <PanelSection title="Colors" icon="ph:palette-duotone" collapsible>
    <p class="section-desc">Face particle colors</p>
    <div class="color-row">
      <label class="color-label">Primary</label>
      <BaseColorPicker v-model="pfStore.state.color" />
    </div>
    <div class="color-row">
      <label class="color-label">Secondary</label>
      <BaseColorPicker v-model="pfStore.state.secondaryColor" />
    </div>
  </PanelSection>

  <!-- Appearance -->
  <PanelSection title="Appearance" icon="ph:eye-duotone" collapsible>
    <p class="section-desc">Particle size, opacity, and face scale</p>
    <BaseSlider
      v-model="pfStore.state.particleSize"
      :min="0.02" :max="0.3" :step="0.01"
      label="Particle Size"
    />
    <BaseSlider
      v-model="pfStore.state.opacity"
      :min="0.1" :max="1" :step="0.05"
      label="Opacity"
    />
    <BaseSlider
      v-model="pfStore.state.faceScale"
      :min="1.5" :max="4.5" :step="0.1"
      label="Face Scale"
    />
    <BaseSlider
      v-model="pfStore.state.scale"
      :min="0.2" :max="3" :step="0.05"
      label="Overall Scale"
    />
    <BaseSlider
      v-model="pfStore.state.depthSpread"
      :min="0.2" :max="1.8" :step="0.05"
      label="Depth Spread"
    />
  </PanelSection>

  <!-- Speaking -->
  <PanelSection title="Speaking Animation" icon="ph:waveform-duotone" collapsible>
    <p class="section-desc">How the face reacts to speech</p>
    <BaseSlider
      v-model="pfStore.state.mouthAmplitude"
      :min="0" :max="1.5" :step="0.05"
      label="Mouth Amplitude"
    />
    <BaseSlider
      v-model="pfStore.state.speakingReactivity"
      :min="0" :max="3" :step="0.1"
      label="Speaking Reactivity"
    />
  </PanelSection>

  <!-- Animation -->
  <PanelSection title="Motion" icon="ph:wind-duotone" collapsible>
    <p class="section-desc">Breathing, drift, and state animations</p>
    <BaseSlider
      v-model="pfStore.state.breathingSpeed"
      :min="0.1" :max="4" :step="0.1"
      label="Breathing Speed"
    />
    <BaseSlider
      v-model="pfStore.state.breathingAmplitude"
      :min="0" :max="0.03" :step="0.001"
      label="Breathing Amplitude"
    />
    <BaseSlider
      v-model="pfStore.state.driftSpeed"
      :min="0" :max="2" :step="0.05"
      label="Drift Speed"
    />
    <BaseSlider
      v-model="pfStore.state.driftAmplitude"
      :min="0" :max="0.02" :step="0.001"
      label="Drift Amplitude"
    />
    <BaseSlider
      v-model="pfStore.state.listeningPulse"
      :min="0" :max="2" :step="0.05"
      label="Listening Pulse"
    />
    <BaseSlider
      v-model="pfStore.state.thinkingSpeed"
      :min="0.5" :max="6" :step="0.1"
      label="Thinking Speed"
    />
  </PanelSection>

  <!-- Ambient -->
  <PanelSection title="Ambient Particles" icon="ph:sparkle-duotone" collapsible>
    <p class="section-desc">Background floating particles</p>
    <BaseSlider
      v-model="pfStore.state.ambientParticles"
      :min="0" :max="200" :step="5"
      label="Count"
    />
    <BaseSlider
      v-model="pfStore.state.ambientRadius"
      :min="1" :max="10" :step="0.5"
      label="Radius"
    />
  </PanelSection>
</template>

<style scoped>
.section-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.color-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
