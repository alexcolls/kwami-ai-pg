<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useKwami } from '@/composables/useKwami';
import type { MemoryContext, MemorySearchResult } from 'kwami-ai';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import MemoryGraph from '@/components/MemoryGraph.vue';

const { kwami } = useKwami();

// State
const initialized = ref(false);
const config = ref({ adapter: 'zep', zep: { apiKey: '', baseUrl: '' } });
const context = ref<MemoryContext | null>(null);
const searchResults = ref<MemorySearchResult[]>([]);
const searchQuery = ref('');
const isLoadingSearch = ref(false);
const searchError = ref('');
const contextError = ref('');

function formatShort(text: string, len = 100) {
  return text.length <= len ? text : text.slice(0, len) + '...';
}

async function refreshContext() {
  if (!kwami.value?.memory.isInitialized()) {
    context.value = null;
    return;
  }
  try {
    contextError.value = '';
    context.value = await kwami.value.getMemoryContext();
  } catch (e) {
    contextError.value = (e as Error).message;
  }
}

async function searchMemory() {
  if (!searchQuery.value.trim() || !kwami.value) return;
  isLoadingSearch.value = true;
  searchError.value = '';
  searchResults.value = [];
  try {
    searchResults.value = await kwami.value.searchMemory(searchQuery.value, 5);
  } catch (e) {
    searchError.value = (e as Error).message;
  } finally {
    isLoadingSearch.value = false;
  }
}

async function exportContext() {
  try {
    const json = JSON.stringify(await kwami.value?.getMemoryContext(), null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kwami-memory.json';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert('Failed: ' + (error as Error).message);
  }
}

async function clearMemory() {
  if (!confirm('⚠️ Delete all memory?')) return;
  try {
    await kwami.value?.memory.clear();
    await refreshContext();
    alert('Memory cleared');
  } catch (error) {
    alert('Failed: ' + (error as Error).message);
  }
}

// Graph configuration
const showGraphModal = ref(false);
const apiBaseUrl = computed(() => {
  // Get the token endpoint and derive the API base URL
  const tokenEndpoint = import.meta.env.VITE_LIVEKIT_TOKEN_ENDPOINT || '';
  // Extract base URL (remove /token path if present)
  return tokenEndpoint.replace(/\/token\/?$/, '') || 'http://localhost:8080';
});
// Memory user_id - this should match what the agent uses
// Before today's fix: random IDs like 'kwami_zweazjas' 
// After fix: should be 'kwami_playground_user'
const graphUserId = ref('kwami_zweazjas'); // Your most recent user with data

// Allow changing the user_id
const userIdInput = ref('kwami_zweazjas');
function setGraphUserId() {
  graphUserId.value = userIdInput.value;
}

function updateStatus() {
  if (kwami.value) {
    initialized.value = kwami.value.memory.isInitialized();
    // @ts-expect-error config
    config.value = kwami.value.memory.getConfig();
  }
}

let interval: ReturnType<typeof setInterval>;
onMounted(() => {
  updateStatus();
  interval = setInterval(() => {
    updateStatus();
    if (initialized.value && !context.value) {
      refreshContext();
      clearInterval(interval);
    }
  }, 2000);
});
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:brain-duotone" class="panel-icon"></iconify-icon>
      <h2>Memory</h2>
      <span class="memory-badge"><iconify-icon icon="ph:database-duotone"></iconify-icon> Zep</span>
    </div>

    <div class="panel-body">
      <!-- Status -->
      <PanelSection title="Status">
        <div class="memory-status-card">
          <div class="status-row">
            <span class="key">Adapter</span><span class="value">{{ config.adapter || 'zep' }}</span>
          </div>
          <div class="status-row">
            <span class="key">Initialized</span>
            <span class="value" :class="initialized ? 'yes' : 'no'"
              ><iconify-icon
                :icon="initialized ? 'ph:check-circle-duotone' : 'ph:x-circle-duotone'"
              ></iconify-icon>
              {{ initialized ? 'Yes' : 'No' }}</span
            >
          </div>
        </div>
      </PanelSection>

      <!-- Knowledge Graph -->
      <PanelSection title="Knowledge Graph">
        <div class="graph-user-select">
          <BaseInput
            v-model="userIdInput"
            label="User ID"
            placeholder="kwami_xxx"
            icon="ph:user-duotone"
          />
          <BaseButton
            size="sm"
            icon="ph:arrow-right"
            @click="setGraphUserId"
          >
            Load
          </BaseButton>
        </div>
        <div class="graph-actions">
          <BaseButton
            variant="primary"
            size="sm"
            icon="ph:graph-duotone"
            @click="showGraphModal = true"
          >
            Open Graph View
          </BaseButton>
          <span class="graph-info">
            <iconify-icon icon="ph:check-circle"></iconify-icon>
            {{ graphUserId }}
          </span>
        </div>
      </PanelSection>
      
      <!-- Graph Modal -->
      <Teleport to="body">
        <div v-if="showGraphModal" class="graph-modal-overlay" @click.self="showGraphModal = false">
          <div class="graph-modal">
            <div class="graph-modal-header">
              <h2><iconify-icon icon="ph:graph-duotone"></iconify-icon> Memory Knowledge Graph</h2>
              <button class="close-btn" @click="showGraphModal = false">
                <iconify-icon icon="ph:x"></iconify-icon>
              </button>
            </div>
            <div class="graph-modal-body">
              <MemoryGraph 
                :userId="graphUserId" 
                :apiBaseUrl="apiBaseUrl"
              />
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Config (Read-only) -->
      <PanelSection title="Zep Configuration">
        <BaseInput
          label="API Key"
          :modelValue="config.zep?.apiKey"
          icon="ph:key-duotone"
          disabled
          type="password"
        />
        <BaseInput
          label="Base URL"
          :modelValue="config.zep?.baseUrl"
          icon="ph:link-duotone"
          disabled
        />
      </PanelSection>

      <!-- Context -->
      <PanelSection title="Current Context">
        <div class="context-display">
          <div v-if="!initialized" class="context-empty">
            <iconify-icon icon="ph:warning-duotone"></iconify-icon> Not initialized
          </div>
          <div v-else-if="contextError" class="context-empty error">
            <iconify-icon icon="ph:x-circle-duotone"></iconify-icon> {{ contextError }}
          </div>
          <div v-else-if="!context" class="context-empty">
            <iconify-icon icon="ph:brain-duotone"></iconify-icon> No context
          </div>
          <div v-else>
            <div v-if="context.summary" class="sect">
              <h4><iconify-icon icon="ph:article-duotone"></iconify-icon> Summary</h4>
              <p>{{ context.summary }}</p>
            </div>
            <div v-if="context.facts?.length" class="sect">
              <h4><iconify-icon icon="ph:lightbulb-duotone"></iconify-icon> Facts</h4>
              <ul class="facts">
                <li v-for="(f, i) in context.facts" :key="i">{{ f }}</li>
              </ul>
            </div>
            <div v-if="context.entities?.length" class="sect">
              <h4><iconify-icon icon="ph:tag-duotone"></iconify-icon> Entities</h4>
              <div class="tags">
                <span v-for="(e, i) in context.entities" :key="i" class="tag">{{ e.name }}</span>
              </div>
            </div>
          </div>
        </div>
        <BaseButton
          size="sm"
          icon="ph:arrows-clockwise-duotone"
          @click="refreshContext"
          style="margin-top: 8px"
          >Refresh</BaseButton
        >
      </PanelSection>

      <!-- Search -->
      <PanelSection title="Search Memory">
        <div class="search-row">
          <BaseInput
            v-model="searchQuery"
            @keypress.enter="searchMemory"
            placeholder="Search..."
            style="flex: 1"
          />
          <BaseButton icon="ph:magnifying-glass-duotone" @click="searchMemory" />
        </div>
        <div class="search-results">
          <div v-if="isLoadingSearch" class="msg">
            <iconify-icon icon="ph:spinner-gap-duotone" class="spin"></iconify-icon> Searching...
          </div>
          <div v-else-if="searchError" class="msg error">{{ searchError }}</div>
          <div
            v-else-if="!isLoadingSearch && searchQuery && searchResults.length === 0"
            class="msg"
          >
            No results
          </div>
          <div v-for="(res, i) in searchResults" :key="i" class="res-card">
            <div class="score">{{ (res.score * 100).toFixed(0) }}%</div>
            <div class="content">{{ formatShort(res.content, 120) }}</div>
          </div>
        </div>
      </PanelSection>

      <!-- Recent Messages -->
      <PanelSection title="Recent Messages">
        <div class="messages-list">
           <div class="messages-empty">
             <iconify-icon icon="ph:chat-circle-dots-duotone"></iconify-icon>
             <span>No recent messages</span>
           </div>
        </div>
      </PanelSection>

      <!-- Actions -->
      <PanelSection title="Actions">
        <div class="row">
          <BaseButton variant="secondary" icon="ph:export-duotone" @click="exportContext"
            >Export</BaseButton
          >
          <BaseButton variant="danger" icon="ph:trash-duotone" @click="clearMemory"
            >Clear</BaseButton
          >
        </div>
      </PanelSection>
    </div>
  </div>
</template>

<style scoped>
.memory-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 4px 8px;
  background: var(--surface-2);
  border-radius: 12px;
  color: var(--text-secondary);
}
.memory-status-card {
  background: var(--surface-2);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.status-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.key {
  color: var(--text-tertiary);
}
.value {
  color: var(--text-primary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}
.value.yes {
  color: var(--accent-success);
}
.value.no {
  color: var(--accent-error);
}

.context-display {
  background: var(--surface-0);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px;
  min-height: 100px;
  max-height: 250px;
  overflow-y: auto;
  font-size: 13px;
}
.context-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  color: var(--text-tertiary);
  gap: 6px;
}
.sect {
  margin-bottom: 12px;
}
.sect h4 {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.facts {
  list-style: disc inside;
  padding-left: 4px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.tag {
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
}

.search-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 8px;
}
.msg {
  text-align: center;
  padding: 12px;
  color: var(--text-tertiary);
  font-size: 12px;
}
.msg.error {
  color: var(--accent-error);
}
.res-card {
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 8px;
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}
.score {
  background: var(--surface-3);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  color: var(--accent-secondary);
  height: fit-content;
}
.content {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.3;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.spin {
  animation: spin 1s linear infinite;
}
.messages-list {
  background: var(--surface-1);
  border-radius: 8px;
  min-height: 60px;
  padding: 12px;
}
.messages-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 12px;
}
.messages-empty iconify-icon {
  font-size: 24px;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
.graph-user-select {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 12px;
}
.graph-user-select :deep(.base-input) {
  flex: 1;
}
.graph-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.graph-info {
  font-size: 11px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Graph Modal */
.graph-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.graph-modal {
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  background: #0d1117;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.graph-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}
.graph-modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.graph-modal-header h2 iconify-icon {
  color: #00d9a6;
}
.close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.graph-modal-body {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
</style>
