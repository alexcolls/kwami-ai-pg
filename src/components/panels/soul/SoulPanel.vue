<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { useKwami } from '@/composables/useKwami';
import { useVoiceStore } from '@/stores/voice';
import { useWorkspaceStore } from '@/stores/workspace';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseTagInput from '@/components/ui/BaseTagInput.vue';
import { soulPresets, templateCategories, type SoulPreset } from '@/presets/agent/soul-presets';
import { panelIcons } from '@/constants/panel-icons';

const toast = useToast();

const { kwami, isConnected } = useKwami();
const voiceStore = useVoiceStore();
const workspaceStore = useWorkspaceStore();
const authStore = useAuthStore();
const { soulUI, soulConfig: savedSoulConfig } = storeToRefs(voiceStore);

// Persisted template selection state via store
const selectedCategory = computed({
  get: () => soulUI.value.selectedCategory,
  set: (v) => { soulUI.value.selectedCategory = v; }
});
const selectedTemplateId = computed({
  get: () => soulUI.value.selectedTemplateId,
  set: (v) => { soulUI.value.selectedTemplateId = v; }
});

const filteredTemplates = computed(() => {
  if (!selectedCategory.value) return soulPresets;
  return soulPresets.filter(t => t.category === selectedCategory.value);
});

function selectCategory(categoryId: string | null) {
  selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId;
}

function applyTemplate(template: SoulPreset) {
  if (!kwami.value) return;

  selectedTemplateId.value = template.id;

  const soulConfig = {
    name: template.name,
    personality: template.personality,
    systemPrompt: template.systemPrompt,
    traits: [...template.traits],
    conversationStyle: template.conversationStyle,
    responseLength: template.responseLength,
    emotionalTone: template.emotionalTone as 'neutral' | 'warm' | 'enthusiastic' | 'calm',
    emotionalTraits: { ...template.emotionalTraits },
  };

  kwami.value.soul.updateConfig(soulConfig);
  syncSoulToBackend(soulConfig);
  syncFromKwami();
}

/**
 * Sync soul changes to the backend agent (if connected)
 */
function syncSoulToBackend(soulConfig?: Record<string, unknown>) {
  if (!kwami.value || !isConnected.value) return;

  const configToSync = soulConfig ?? {
    name: config.name,
    personality: config.personality,
    systemPrompt: config.systemPrompt,
    traits: traits.value,
    conversationStyle: config.conversationStyle,
    responseLength: config.responseLength,
    emotionalTone: config.emotionalTone,
    emotionalTraits: { ...emotionalTraits },
  };

  kwami.value.agent.syncConfigToBackend('soul', configToSync);
  console.log('📤 Synced soul to backend:', configToSync);
}

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

// Sync from Kwami and mirror to persisted store
function syncFromKwami() {
  if (!kwami.value) return;
  
  // Prevent watchers from firing during sync
  isSyncing = true;
  
  try {
    const pConfig = kwami.value.soul.getConfig();

    config.name = pConfig.name || 'Kwami';
    config.personality = pConfig.personality || '';
    config.conversationStyle = pConfig.conversationStyle || 'friendly';
    config.language = pConfig.language || 'en';
    config.responseLength = pConfig.responseLength || 'medium';
    config.emotionalTone = pConfig.emotionalTone || 'neutral';
    config.systemPrompt = pConfig.systemPrompt || '';

    traits.value = [...kwami.value.soul.getTraits()];

    if (pConfig.emotionalTraits) {
      Object.assign(emotionalTraits, pConfig.emotionalTraits);
    }

    // Mirror to store for persistence across reloads
    saveToStore();
  } finally {
    // Re-enable watchers after sync completes (use setTimeout to ensure all reactive updates are processed)
    setTimeout(() => { isSyncing = false; }, 0);
  }
}

// Save current local state to the persisted store
function saveToStore() {
  savedSoulConfig.value = {
    name: config.name,
    personality: config.personality,
    conversationStyle: config.conversationStyle,
    language: config.language,
    responseLength: config.responseLength,
    emotionalTone: config.emotionalTone,
    systemPrompt: config.systemPrompt,
    traits: [...traits.value],
    emotionalTraits: { ...emotionalTraits },
  };
}

// Restore saved soul config to kwami (on page reload)
function restoreSavedSoulToKwami() {
  if (!kwami.value) return;
  const saved = savedSoulConfig.value;
  // Only restore if it looks like a non-default config
  if (!saved.personality && saved.name === 'Kwami' && saved.traits.length === 0) return;

  kwami.value.soul.updateConfig({
    name: saved.name,
    personality: saved.personality,
    systemPrompt: saved.systemPrompt,
    traits: [...saved.traits],
    conversationStyle: saved.conversationStyle,
    responseLength: saved.responseLength,
    emotionalTone: saved.emotionalTone,
    emotionalTraits: { ...saved.emotionalTraits },
  });
}

// Live sync watchers - sync changes to kwami automatically
let isSyncing = false; // Prevent infinite loops during sync

watch(() => config.name, (v) => {
  if (!isSyncing && kwami.value) {
    kwami.value.soul.setName(v);
    syncSoulToBackend();
    saveToStore();
    const activeId = workspaceStore.activeWorkspaceId;
    if (activeId && v.trim()) {
      workspaceStore.updateKwami(activeId, { name: v.trim() }, authStore.userId);
    }
  }
});

watch(() => config.personality, (v) => {
  if (!isSyncing && kwami.value) {
    kwami.value.soul.updateConfig({ personality: v });
    syncSoulToBackend();
    saveToStore();
  }
});

watch(() => config.conversationStyle, (v) => {
  if (!isSyncing && kwami.value) {
    kwami.value.soul.setConversationStyle(v);
    syncSoulToBackend();
    saveToStore();
  }
});

watch(() => config.language, (v) => {
  if (!isSyncing && kwami.value) {
    kwami.value.soul.setLanguage(v);
    saveToStore();
  }
});

watch(() => config.responseLength, (v) => {
  if (!isSyncing && kwami.value) {
    kwami.value.soul.setResponseLength(v);
    syncSoulToBackend();
    saveToStore();
  }
});

watch(() => config.emotionalTone, (v) => {
  if (!isSyncing && kwami.value) {
    kwami.value.soul.setEmotionalTone(v);
    syncSoulToBackend();
    saveToStore();
  }
});

watch(() => config.systemPrompt, (v) => {
  if (!isSyncing && kwami.value) {
    kwami.value.soul.updateConfig({ systemPrompt: v });
    syncSoulToBackend();
    saveToStore();
  }
});

watch(emotionalTraits, (v) => {
  if (!isSyncing && kwami.value) {
    Object.keys(v).forEach((key) => {
      kwami.value?.soul.setEmotionalTrait(
        key as keyof typeof emotionalTraits, 
        v[key as keyof typeof v]
      );
    });
    syncSoulToBackend();
    saveToStore();
  }
}, { deep: true });

function updateTraits(newTraits: string[]) {
  kwami.value?.soul.updateConfig({ traits: newTraits });
  syncFromKwami();
  syncSoulToBackend();
}

function previewPrompt() {
  if (!kwami.value) return;
  console.log('📝 Full System Prompt:\n', kwami.value.soul.getSystemPrompt());
  toast.info('Full prompt logged to console');
}

function exportSoul() {
  if (!kwami.value) return;
  const json = kwami.value.soul.exportAsJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kwami-soul.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importSoul() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      kwami.value?.soul.importFromJSON(await file.text());
      toast.success('Soul imported!');
      syncFromKwami();
    } catch (error) {
      toast.error('Failed to import: ' + (error as Error).message);
    }
  };
  input.click();
}

function resetSoul() {
  if (!kwami.value) return;
  if (confirm('Reset soul to defaults?')) {
    selectedTemplateId.value = null;
    kwami.value.soul.updateConfig({
      name: 'Kwami',
      personality: 'A friendly and helpful AI companion',
      traits: ['friendly', 'helpful', 'curious'],
      conversationStyle: 'friendly',
      responseLength: 'medium',
      emotionalTone: 'warm',
    });
    toast.success('Soul reset!');
    syncFromKwami();
  }
}

// Auto-sync when connection state changes
watch(isConnected, (connected) => {
  syncFromKwami();
  // When becoming connected, also push soul config to the backend agent
  if (connected) {
    syncSoulToBackend();
  }
});

onMounted(() => {
  // Restore saved soul to kwami before syncing (handles page reload)
  restoreSavedSoulToKwami();
  syncFromKwami();
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon :icon="panelIcons.soul" class="panel-icon"></iconify-icon>
      <h2>Soul</h2>
      <button class="refresh-btn" @click="syncFromKwami" title="Refresh from Kwami">
        <iconify-icon icon="ph:arrows-clockwise-duotone"></iconify-icon>
      </button>
    </div>

    <div class="panel-body">
      <!-- Presets -->
      <PanelSection title="Presets">
        <div class="template-categories">
          <button
            v-for="cat in templateCategories"
            :key="cat.id"
            class="category-chip"
            :class="{ active: selectedCategory === cat.id }"
            :style="{ '--cat-color': cat.color }"
            @click="selectCategory(cat.id)"
          >
            <iconify-icon :icon="cat.icon"></iconify-icon>
            <span>{{ cat.label }}</span>
          </button>
        </div>
        <div class="template-grid">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
            :class="{ selected: selectedTemplateId === template.id }"
            :style="{ '--template-color': template.color }"
            @click="applyTemplate(template)"
          >
            <div class="template-icon">
              <iconify-icon :icon="template.icon"></iconify-icon>
            </div>
            <div class="template-info">
              <span class="template-name">{{ template.name }}</span>
              <span class="template-desc">{{ template.personality.substring(0, 50) }}...</span>
            </div>
          </div>
        </div>
      </PanelSection>

      <!-- Identity -->
      <PanelSection title="Identity">
        <BaseInput
           label="Name"
           v-model="config.name"
           icon="ph:identification-badge-duotone"
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
              @click="config.responseLength = 'short'"
            >
              Short
            </button>
            <button
              class="toggle-btn"
              :class="{ active: config.responseLength === 'medium' }"
              @click="config.responseLength = 'medium'"
            >
              Medium
            </button>
            <button
              class="toggle-btn"
              :class="{ active: config.responseLength === 'long' }"
              @click="config.responseLength = 'long'"
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
              @click="config.emotionalTone = tone as any"
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
            />
          </div>
        </div>
      </PanelSection>

      <!-- System Prompt -->
      <PanelSection title="System Prompt">
        <textarea
          v-model.lazy="config.systemPrompt"
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
            <BaseButton variant="secondary" icon="ph:export-duotone" @click="exportSoul"
              >Export JSON</BaseButton
            >
            <BaseButton variant="secondary" icon="ph:download-duotone" @click="importSoul"
              >Import JSON</BaseButton
            >
          </div>
          <BaseButton
            variant="secondary"
            icon="ph:arrow-counter-clockwise-duotone"
            @click="resetSoul"
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
.refresh-btn {
  margin-left: auto;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: var(--surface-3);
  color: var(--text-primary);
  border-color: var(--accent-primary);
}

.refresh-btn:active {
  transform: rotate(180deg);
}

.refresh-btn iconify-icon {
  font-size: 16px;
}

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

/* Template Selector Styles */
.template-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  font-size: 11px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.category-chip:hover {
  background: var(--surface-3);
  border-color: var(--cat-color, var(--accent-primary));
}

.category-chip.active {
  background: color-mix(in srgb, var(--cat-color, var(--accent-primary)) 15%, transparent);
  border-color: var(--cat-color, var(--accent-primary));
  color: var(--text-primary);
}

.category-chip iconify-icon {
  font-size: 14px;
  color: var(--cat-color, var(--text-tertiary));
}

.template-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.template-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 0;
  overflow: hidden;
}

.template-card:hover {
  background: var(--surface-2);
  border-color: var(--template-color, var(--accent-primary));
  transform: translateY(-1px);
}

.template-card.selected {
  background: color-mix(in srgb, var(--template-color, var(--accent-primary)) 12%, transparent);
  border-color: var(--template-color, var(--accent-primary));
  box-shadow: 0 0 12px color-mix(in srgb, var(--template-color, var(--accent-primary)) 25%, transparent);
}

.template-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--template-color, var(--accent-primary)) 15%, transparent);
  border-radius: 8px;
  flex-shrink: 0;
}

.template-icon iconify-icon {
  font-size: 18px;
  color: var(--template-color, var(--accent-primary));
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.template-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.template-desc {
  font-size: 10px;
  color: var(--text-tertiary);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
