<script setup lang="ts">
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';

defineProps<{
  config: { provider: string; model: string; temperature: number; maxTokens: number };
  providers: { provider: string; label: string }[];
  models: { model: string; name: string }[];
}>();
</script>

<template>
  <PanelSection title="Language Model (LLM)" icon="ph:brain-duotone">
    <div class="config-form">
      <BaseSelect
        label="Provider"
        v-model="config.provider"
        :options="providers.map((p) => ({ label: p.label, value: p.provider }))"
      />
      <BaseSelect
        label="Model"
        v-model="config.model"
        :options="models.map((m) => ({ label: m.name, value: m.model }))"
      />
      <BaseSlider label="Temperature" :min="0" :max="1" :step="0.05" v-model="config.temperature" />
      <BaseSlider label="Max Tokens" :min="64" :max="4096" :step="64" v-model="config.maxTokens" />
    </div>
  </PanelSection>
</template>

<style scoped>
.config-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
