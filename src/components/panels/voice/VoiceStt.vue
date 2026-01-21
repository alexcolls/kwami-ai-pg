<script setup lang="ts">
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';

defineProps<{
  config: { provider: string; model: string; language: string };
  providers: { provider: string; label: string }[];
  models: { model: string; name: string }[];
}>();

const emit = defineEmits<{
  (e: 'update:config', val: any): void;
}>();
</script>

<template>
  <PanelSection title="Speech to Text (STT)" icon="ph:microphone-duotone">
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
      <BaseSelect
        label="Language"
        v-model="config.language"
        :options="[
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Japanese', value: 'ja' },
          { label: 'Multi', value: 'multi' },
        ]"
      />
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
