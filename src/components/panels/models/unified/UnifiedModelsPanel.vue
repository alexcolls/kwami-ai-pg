<script setup lang="ts">
import { ref } from 'vue';
import PipelineSelector from './PipelineSelector.vue';
import ModelTypeTabs, { type ModelType } from './ModelTypeTabs.vue';
import LLMTab from './tabs/LLMTab.vue';
import STTTab from './tabs/STTTab.vue';
import TTSTab from './tabs/TTSTab.vue';
import RealtimeTab from './tabs/RealtimeTab.vue';

// Pipeline type
const pipelineType = ref<'standard' | 'realtime'>('standard');

// Active model type tab (for standard pipeline)
const activeModelType = ref<ModelType>('llm');
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:cpu-duotone" class="panel-icon"></iconify-icon>
      <h2>Models</h2>
    </div>

    <div class="panel-body">
      <!-- Pipeline Selector -->
      <PipelineSelector v-model="pipelineType" />

      <!-- Standard Pipeline: Model Type Tabs -->
      <template v-if="pipelineType === 'standard'">
        <ModelTypeTabs v-model="activeModelType" />
        
        <div class="tab-container">
          <LLMTab v-if="activeModelType === 'llm'" />
          <STTTab v-if="activeModelType === 'stt'" />
          <TTSTab v-if="activeModelType === 'tts'" />
        </div>
      </template>

      <!-- Realtime Pipeline -->
      <template v-if="pipelineType === 'realtime'">
        <RealtimeTab />
      </template>
    </div>
  </div>
</template>

<style scoped>
.panel-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--surface-2);
  flex-shrink: 0;
}

.panel-icon {
  font-size: 24px;
  color: var(--accent-primary);
}

.panel-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tab-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
