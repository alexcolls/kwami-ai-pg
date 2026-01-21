<script setup lang="ts">
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

defineProps<{
  config: { provider: string; voice: string; speed: number };
  providers: { provider: string; label: string }[];
  voices: { id: string; name: string }[];
}>();
</script>

<template>
  <PanelSection title="Text to Speech (TTS)" icon="ph:speaker-high-duotone">
    <div class="config-form">
      <BaseSelect
        label="Provider"
        v-model="config.provider"
        :options="providers.map((p) => ({ label: p.label, value: p.provider }))"
      />
      <BaseSelect
        label="Voice"
        v-model="config.voice"
        :options="voices.map((v) => ({ label: v.name, value: v.id }))"
      />
      <BaseSlider label="Speed" :min="0.5" :max="2" :step="0.1" v-model="config.speed" />
    </div>
    <div class="voice-preview">
      <BaseButton icon="ph:play-duotone" size="sm">Preview Voice</BaseButton>
    </div>
  </PanelSection>
</template>

<style scoped>
.config-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.voice-preview {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
</style>
