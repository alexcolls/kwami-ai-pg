<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useKwami } from '@/composables/useKwami';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseTagInput from '@/components/ui/BaseTagInput.vue';

const { kwami } = useKwami();

// State
const config = reactive({
  name: '',
  personality: '',
  conversationStyle: '',
  language: 'en',
  responseLength: 'medium' as 'short' | 'medium' | 'long',
  emotionalTone: 'neutral' as 'neutral' | 'warm' | 'enthusiastic' | 'calm',
  systemPrompt: '',
});

const traits = ref<string[]>([]);
// const newTrait = ref('') // Handled by BaseTagInput

const emotionalTraits = reactive({
  happiness: 0,
  energy: 0,
  confidence: 0,
  empathy: 0,
  curiosity: 0,
  creativity: 0,
});

const emotionalTraitDefs = [
  { key: 'happiness', label: 'Happiness', icon: 'ph:smiley-duotone' },
  { key: 'energy', label: 'Energy', icon: 'ph:lightning-duotone' },
  { key: 'confidence', label: 'Confidence', icon: 'ph:trophy-duotone' },
  { key: 'empathy', label: 'Empathy', icon: 'ph:heart-duotone' },
  { key: 'curiosity', label: 'Curiosity', icon: 'ph:magnifying-glass-duotone' },
  { key: 'creativity', label: 'Creativity', icon: 'ph:paint-brush-duotone' },
] as const;

// Sync from Kwami
function syncFromKwami() {
  if (!kwami.value) return;
  const pConfig = kwami.value.persona.getConfig();

  config.name = pConfig.name || 'Kwami';
  config.personality = pConfig.personality || '';
  config.conversationStyle = pConfig.conversationStyle || 'friendly';
  config.language = pConfig.language || 'en';
  config.responseLength = pConfig.responseLength || 'medium';
  config.emotionalTone = pConfig.emotionalTone || 'neutral';
  config.systemPrompt = pConfig.systemPrompt || '';

  traits.value = [...kwami.value.persona.getTraits()];

  if (pConfig.emotionalTraits) {
    Object.assign(emotionalTraits, pConfig.emotionalTraits);
  }
}

// Actions
function updateName() {
  kwami.value?.persona.setName(config.name);
}
function updatePersonality() {
  kwami.value?.persona.updateConfig({ personality: config.personality });
}
function updateStyle() {
  kwami.value?.persona.setConversationStyle(config.conversationStyle);
}
function updateLanguage() {
  kwami.value?.persona.setLanguage(config.language);
}

function updateResponseLength(length: 'short' | 'medium' | 'long') {
  config.responseLength = length;
  kwami.value?.persona.setResponseLength(length);
}

function updateEmotionalTone(tone: 'neutral' | 'warm' | 'enthusiastic' | 'calm') {
  config.emotionalTone = tone;
  kwami.value?.persona.setEmotionalTone(tone);
}

function updateSystemPrompt() {
  kwami.value?.persona.updateConfig({ systemPrompt: config.systemPrompt });
}

function updateTraits(newTraits: string[]) {
  // We need to sync the difference
  kwami.value?.persona.updateConfig({ traits: newTraits });
  syncFromKwami(); // Refresh local reference
}

function updateEmotionalTrait(key: keyof typeof emotionalTraits) {
  kwami.value?.persona.setEmotionalTrait(key, emotionalTraits[key]);
}

function previewPrompt() {
  if (!kwami.value) return;
  console.log('📝 Full System Prompt:\n', kwami.value.persona.getSystemPrompt());
  alert('Full prompt logged to console');
}

function exportPersona() {
  if (!kwami.value) return;
  const json = kwami.value.persona.exportAsJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kwami-persona.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importPersona() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      kwami.value?.persona.importFromJSON(await file.text());
      alert('Persona imported!');
      syncFromKwami();
    } catch (error) {
      alert('Failed to import: ' + (error as Error).message);
    }
  };
  input.click();
}

function resetPersona() {
  if (!kwami.value) return;
  if (confirm('Reset persona to defaults?')) {
    kwami.value.persona.updateConfig({
      name: 'Kwami',
      personality: 'A friendly and helpful AI companion',
      traits: ['friendly', 'helpful', 'curious'],
      conversationStyle: 'friendly',
      responseLength: 'medium',
      emotionalTone: 'warm',
    });
    alert('Persona reset!');
    syncFromKwami();
  }
}

onMounted(() => {
  syncFromKwami();
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:user-circle-duotone" class="panel-icon"></iconify-icon>
      <h2>Persona</h2>
    </div>

    <div class="panel-body">
      <!-- Identity -->
      <PanelSection title="Identity">
        <BaseInput
           label="Name"
           v-model="config.name"
           icon="ph:identification-badge-duotone"
           @change="updateName"
           placeholder="Kwami"
        />
        <!-- TextArea not yet primitive, keep native or make Primitive? Native is fine for now but styled -->
        <div class="form-group" style="margin-top: 8px">
          <label style="font-size: 11px; color: var(--text-tertiary); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <iconify-icon icon="ph:sparkle-duotone" style="font-size: 14px; color: var(--text-tertiary);"></iconify-icon>
            Personality
          </label>
          <textarea
            v-model.lazy="config.personality"
            @change="updatePersonality"
            rows="2"
            placeholder="Describe the personality..."
          ></textarea>
        </div>
      </PanelSection>

      <!-- Traits -->
      <PanelSection title="Traits">
        <BaseTagInput
          :modelValue="traits"
          @update:modelValue="updateTraits"
          placeholder="Add trait..."
        />
      </PanelSection>

      <!-- Conversation Style -->
      <PanelSection title="Conversation Style">
        <BaseInput
          label="Style"
          v-model="config.conversationStyle"
          icon="ph:chat-teardrop-duotone"
          @change="updateStyle"
          placeholder="friendly, professional..."
        />
        <div style="margin-top: 8px">
          <BaseSelect
            label="Language"
            v-model="config.language"
            icon="ph:translate-duotone"
            :options="[
              { label: 'English', value: 'en' },
              { label: 'Spanish', value: 'es' },
              { label: 'French', value: 'fr' },
              { label: 'German', value: 'de' },
              { label: 'Japanese', value: 'ja' },
              { label: 'Chinese', value: 'zh' },
            ]"
            @change="updateLanguage"
          />
        </div>
      </PanelSection>

      <!-- Response Settings -->
      <PanelSection title="Response Settings">
        <div class="option-group">
          <span class="option-label">Response Length</span>
          <div class="toggle-group">
            <button
              class="toggle-btn"
              :class="{ active: config.responseLength === 'short' }"
              @click="updateResponseLength('short')"
            >
              Short
            </button>
            <button
              class="toggle-btn"
              :class="{ active: config.responseLength === 'medium' }"
              @click="updateResponseLength('medium')"
            >
              Medium
            </button>
            <button
              class="toggle-btn"
              :class="{ active: config.responseLength === 'long' }"
              @click="updateResponseLength('long')"
            >
              Long
            </button>
          </div>
        </div>
        <div class="option-group">
          <span class="option-label">Emotional Tone</span>
          <div class="tone-selector">
            <div
              v-for="tone in ['neutral', 'warm', 'enthusiastic', 'calm']"
              :key="tone"
              class="tone-option"
              :class="{ active: config.emotionalTone === tone }"
              @click="updateEmotionalTone(tone as any)"
            >
              <iconify-icon
                :icon="
                  tone === 'neutral'
                    ? 'ph:minus-duotone'
                    : tone === 'warm'
                      ? 'ph:sun-duotone'
                      : tone === 'enthusiastic'
                        ? 'ph:lightning-duotone'
                        : 'ph:moon-stars-duotone'
                "
              ></iconify-icon>
              <span>{{ tone.charAt(0).toUpperCase() + tone.slice(1) }}</span>
            </div>
          </div>
        </div>
      </PanelSection>

      <!-- Emotional Traits -->
      <PanelSection title="Emotional Traits">
        <div class="slider-group">
          <div v-for="t in emotionalTraitDefs" :key="t.key" class="trait-slider">
            <BaseSlider
              :label="t.label"
              :min="-100"
              :max="100"
              :step="1"
              v-model="emotionalTraits[t.key]"
              @update:modelValue="updateEmotionalTrait(t.key)"
            />
          </div>
        </div>
      </PanelSection>

      <!-- System Prompt -->
      <PanelSection title="System Prompt">
        <textarea
          v-model.lazy="config.systemPrompt"
          @change="updateSystemPrompt"
          rows="4"
          placeholder="Custom system prompt..."
        ></textarea>
        <BaseButton size="sm" icon="ph:eye-duotone" @click="previewPrompt" style="margin-top: 8px"
          >Preview Full Prompt</BaseButton
        >
      </PanelSection>

      <!-- Actions -->
      <PanelSection title="Actions">
        <div class="action-buttons">
          <div class="row">
            <BaseButton variant="secondary" icon="ph:export-duotone" @click="exportPersona"
              >Export JSON</BaseButton
            >
            <BaseButton variant="secondary" icon="ph:download-duotone" @click="importPersona"
              >Import JSON</BaseButton
            >
          </div>
          <BaseButton
            variant="secondary"
            icon="ph:arrow-counter-clockwise-duotone"
            @click="resetPersona"
            block
            style="margin-top: 8px"
            >Reset Default</BaseButton
          >
        </div>
      </PanelSection>
    </div>
  </div>
</template>

<style scoped>
textarea {
  width: 100%;
  padding: 8px 12px;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  resize: vertical;
}

.traits-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.trait-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--accent-glow);
  border: 1px solid var(--accent-primary);
  border-radius: 16px;
  font-size: 11px;
  color: var(--text-primary);
}
.trait-remove {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  display: flex;
  align-items: center;
}
.trait-remove:hover {
  color: var(--accent-error);
}
.trait-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-group {
  margin-bottom: 12px;
}
.option-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 8px;
}

.toggle-group {
  display: flex;
  background: var(--surface-2);
  padding: 2px;
  border-radius: 8px;
}
.toggle-btn {
  flex: 1;
  padding: 6px 10px;
  background: transparent;
  border: none;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.tone-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.tone-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.tone-option.active {
  background: var(--surface-3);
  border-color: var(--accent-primary);
  color: var(--text-primary);
}
.tone-option iconify-icon {
  font-size: 20px;
}
.tone-option span {
  font-size: 11px;
}

.trait-slider {
  margin-bottom: 8px;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
</style>
