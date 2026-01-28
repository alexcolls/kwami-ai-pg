<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useKwami } from '@/composables/useKwami';
import { useAuthStore } from '@/stores/auth';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { MemoryGraph } from '@/components/memory';

const { userId: sharedUserId } = useKwami();
const authStore = useAuthStore();

// API base URL derived from token endpoint
const apiBaseUrl = computed(() => {
  const tokenEndpoint = import.meta.env.VITE_LIVEKIT_TOKEN_ENDPOINT || '';
  return tokenEndpoint.replace(/\/token\/?$/, '') || 'http://localhost:8080';
});

// User ID with kwami_ prefix (as used by backend)
// This automatically updates when the connection panel's user ID changes
const userId = computed(() => `kwami_${sharedUserId.value}`);

// Loading states
const isLoading = ref(false);
const loadError = ref('');

// Tab state
const activeTab = ref<'facts' | 'entities' | 'messages'>('facts');

// Memory data
interface Edge {
  uuid: string | null;
  fact: string | null;
  name: string | null;
  valid_at: string | null;
  invalid_at: string | null;
  created_at: string | null;
}

interface Node {
  uuid: string | null;
  name: string | null;
  summary: string | null;
  labels: string[];
  created_at: string | null;
}

interface Message {
  uuid: string | null;
  content: string | null;
  role: string | null;
  role_type: string | null;
  created_at: string | null;
  thread_id: string | null;
}

const edges = ref<Edge[]>([]);
const nodes = ref<Node[]>([]);
const messages = ref<Message[]>([]);
const sessionCount = ref(0);

// Graph modal state
const showGraphModal = ref(false);

// Delete confirmation state
const showDeleteConfirm = ref(false);
const isDeleting = ref(false);
const deleteError = ref('');

// Format date for display
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// Get authorization headers for API calls
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await authStore.getAccessToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return { 'Content-Type': 'application/json' };
}

// Fetch all memory data from API
async function loadMemoryData() {
  if (!userId.value) return;
  
  console.log('📊 Loading memory for user:', userId.value);
  isLoading.value = true;
  loadError.value = '';
  
  try {
    const headers = await getAuthHeaders();
    
    // Fetch all data in parallel
    const [edgesRes, nodesRes, messagesRes] = await Promise.all([
      fetch(`${apiBaseUrl.value}/memory/${userId.value}/edges`, { headers }),
      fetch(`${apiBaseUrl.value}/memory/${userId.value}/nodes`, { headers }),
      fetch(`${apiBaseUrl.value}/memory/${userId.value}/messages`, { headers }),
    ]);
    
    if (!edgesRes.ok || !nodesRes.ok || !messagesRes.ok) {
      throw new Error('Failed to load memory data');
    }
    
    const [edgesData, nodesData, messagesData] = await Promise.all([
      edgesRes.json(),
      nodesRes.json(),
      messagesRes.json(),
    ]);
    
    edges.value = edgesData.edges || [];
    nodes.value = nodesData.nodes || [];
    messages.value = messagesData.messages || [];
    sessionCount.value = messagesData.session_count || 0;
    
  } catch (e) {
    loadError.value = (e as Error).message;
    edges.value = [];
    nodes.value = [];
    messages.value = [];
    sessionCount.value = 0;
  } finally {
    isLoading.value = false;
  }
}

async function deleteUserMemory() {
  if (!userId.value) return;
  
  isDeleting.value = true;
  deleteError.value = '';
  
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${apiBaseUrl.value}/memory/${userId.value}`, {
      method: 'DELETE',
      headers,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || 'Failed to delete memory');
    }
    
    if (result.success) {
      showDeleteConfirm.value = false;
      edges.value = [];
      nodes.value = [];
      messages.value = [];
      sessionCount.value = 0;
      alert(`Memory deleted!\n\nDeleted ${result.deleted_threads} thread(s)\nUser deleted: ${result.deleted_user ? 'Yes' : 'No'}`);
    } else {
      throw new Error(result.errors?.join(', ') || 'Delete operation failed');
    }
  } catch (e) {
    deleteError.value = (e as Error).message;
  } finally {
    isDeleting.value = false;
  }
}

// Auto-load when user ID changes (from connection panel)
watch(
  () => sharedUserId.value,
  (newId, oldId) => {
    console.log('🔄 User ID changed:', oldId, '->', newId);
    if (newId) {
      loadMemoryData();
    }
  }
);

onMounted(() => {
  if (userId.value) {
    loadMemoryData();
  }
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:brain-duotone" class="panel-icon"></iconify-icon>
      <h2>Memory</h2>
      <span class="memory-badge"><iconify-icon icon="ph:database-duotone"></iconify-icon> Temporal</span>
    </div>

    <div class="panel-body">
     
      <!-- Memory Stats -->
      <PanelSection title="Overview">
        <div v-if="isLoading" class="loading-state">
          <iconify-icon icon="ph:spinner-gap-duotone" class="spin"></iconify-icon>
          Loading memory data...
        </div>
        <div v-else-if="loadError" class="error-state">
          <iconify-icon icon="ph:warning-duotone"></iconify-icon>
          {{ loadError }}
          <BaseButton size="sm" variant="secondary" @click="loadMemoryData">Retry</BaseButton>
        </div>
        <div v-else class="stats-grid">
          <div class="stat-card" :class="{ active: activeTab === 'facts' }" @click="activeTab = 'facts'">
            <div class="stat-value">{{ edges.length }}</div>
            <div class="stat-label">Facts</div>
          </div>
          <div class="stat-card" :class="{ active: activeTab === 'entities' }" @click="activeTab = 'entities'">
            <div class="stat-value">{{ nodes.length }}</div>
            <div class="stat-label">Entities</div>
          </div>
          <div class="stat-card" :class="{ active: activeTab === 'messages' }" @click="activeTab = 'messages'">
            <div class="stat-value">{{ messages.length }}</div>
            <div class="stat-label">Messages</div>
            <div class="stat-sub">{{ sessionCount }} session{{ sessionCount !== 1 ? 's' : '' }}</div>
          </div>
        </div>
      </PanelSection>

      <!-- Facts with Temporal Data -->
      <PanelSection v-if="activeTab === 'facts'" title="Facts (Temporal)">
        <div v-if="isLoading" class="loading-state small">
          <iconify-icon icon="ph:spinner-gap-duotone" class="spin"></iconify-icon>
        </div>
        <div v-else-if="!edges.length" class="empty-state small">
          <iconify-icon icon="ph:lightbulb-duotone"></iconify-icon>
          No facts learned yet
        </div>
        <div v-else class="facts-list">
          <div v-for="(edge, i) in edges" :key="i" class="fact-item">
            <div class="fact-content">
              <iconify-icon 
                :icon="edge.invalid_at ? 'ph:x-circle-duotone' : 'ph:check-circle-duotone'" 
                :class="edge.invalid_at ? 'invalid' : 'valid'"
              ></iconify-icon>
              <span :class="{ 'strikethrough': edge.invalid_at }">{{ edge.fact }}</span>
            </div>
            <div class="fact-meta">
              <span v-if="edge.valid_at" class="date valid">
                <iconify-icon icon="ph:calendar-check-duotone"></iconify-icon>
                {{ formatDate(edge.valid_at) }}
              </span>
              <span v-if="edge.invalid_at" class="date invalid">
                <iconify-icon icon="ph:calendar-x-duotone"></iconify-icon>
                {{ formatDate(edge.invalid_at) }}
              </span>
              <span v-if="!edge.valid_at && !edge.invalid_at && edge.created_at" class="date">
                {{ formatDate(edge.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </PanelSection>

      <!-- Entities with Summaries -->
      <PanelSection v-if="activeTab === 'entities'" title="Entities (with Summaries)">
        <div v-if="isLoading" class="loading-state small">
          <iconify-icon icon="ph:spinner-gap-duotone" class="spin"></iconify-icon>
        </div>
        <div v-else-if="!nodes.length" class="empty-state small">
          <iconify-icon icon="ph:tag-duotone"></iconify-icon>
          No entities discovered
        </div>
        <div v-else class="entities-list">
          <div v-for="(node, i) in nodes" :key="i" class="entity-item">
            <div class="entity-header">
              <span class="entity-name">{{ node.name }}</span>
              <span v-for="label in node.labels" :key="label" class="entity-label">{{ label }}</span>
            </div>
            <p v-if="node.summary" class="entity-summary">{{ node.summary }}</p>
            <span v-if="node.created_at" class="entity-date">
              <iconify-icon icon="ph:clock-duotone"></iconify-icon>
              {{ formatDate(node.created_at) }}
            </span>
          </div>
        </div>
      </PanelSection>

      <!-- Messages (Conversation History) -->
      <PanelSection v-if="activeTab === 'messages'" title="Conversation History">
        <div v-if="isLoading" class="loading-state small">
          <iconify-icon icon="ph:spinner-gap-duotone" class="spin"></iconify-icon>
        </div>
        <div v-else-if="!messages.length" class="empty-state small">
          <iconify-icon icon="ph:chat-circle-dots-duotone"></iconify-icon>
          No conversation history
        </div>
        <div v-else class="messages-list">
          <div v-for="(msg, i) in messages" :key="i" class="message-item" :class="msg.role_type || msg.role">
            <div class="message-header">
              <span class="message-role">
                <iconify-icon :icon="msg.role_type === 'assistant' || msg.role === 'assistant' ? 'ph:robot-duotone' : 'ph:user-duotone'"></iconify-icon>
                {{ msg.role || msg.role_type || 'unknown' }}
              </span>
              <span v-if="msg.created_at" class="message-date">{{ formatDate(msg.created_at) }}</span>
            </div>
            <p class="message-content">{{ msg.content }}</p>
          </div>
        </div>
      </PanelSection>

      <!-- Knowledge Graph -->
      <PanelSection title="Knowledge Graph">
        <div class="graph-actions">
          <BaseButton
            variant="primary"
            size="sm"
            icon="ph:graph-duotone"
            @click="showGraphModal = true"
          >
            Open Graph View
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            icon="ph:arrows-clockwise-duotone"
            @click="loadMemoryData"
            :disabled="isLoading"
          >
            Refresh
          </BaseButton>
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
                :userId="userId" 
                :apiBaseUrl="apiBaseUrl"
              />
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Danger Zone -->
      <PanelSection title="Danger Zone">
        <div class="danger-zone">
          <h4><iconify-icon icon="ph:warning-duotone"></iconify-icon> Destructive Action</h4>
          <p>Permanently delete all memory for this user. This includes all threads, facts, entities, and the knowledge graph.</p>
          <BaseButton 
            variant="danger" 
            icon="ph:trash-simple-duotone" 
            @click="showDeleteConfirm = true"
          >
            Delete All User Memory
          </BaseButton>
        </div>
      </PanelSection>
      
      <!-- Delete Confirmation Modal -->
      <Teleport to="body">
        <div v-if="showDeleteConfirm" class="confirm-modal-overlay" @click.self="showDeleteConfirm = false">
          <div class="confirm-modal">
            <div class="confirm-modal-header">
              <iconify-icon icon="ph:warning-duotone" class="warning-icon"></iconify-icon>
              <h3>Delete All Memory?</h3>
            </div>
            <div class="confirm-modal-body">
              <p>You are about to permanently delete all memory for:</p>
              <code class="user-id-display">{{ userId }}</code>
              <p class="warning-text">
                <strong>This action cannot be undone.</strong> All threads, facts, entities, 
                and the knowledge graph will be permanently deleted.
              </p>
              <div v-if="deleteError" class="delete-error">
                <iconify-icon icon="ph:x-circle-duotone"></iconify-icon>
                {{ deleteError }}
              </div>
            </div>
            <div class="confirm-modal-footer">
              <BaseButton 
                variant="secondary" 
                @click="showDeleteConfirm = false"
                :disabled="isDeleting"
              >
                Cancel
              </BaseButton>
              <BaseButton 
                variant="danger" 
                icon="ph:trash-simple-duotone"
                @click="deleteUserMemory"
                :disabled="isDeleting"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete Forever' }}
              </BaseButton>
            </div>
          </div>
        </div>
      </Teleport>
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.stat-card {
  background: var(--surface-2);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}
.stat-card:hover {
  background: var(--surface-3);
}
.stat-card.active {
  border-color: var(--accent-primary);
  background: rgba(var(--accent-primary-rgb), 0.1);
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-primary);
  line-height: 1;
}
.stat-label {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-sub {
  font-size: 9px;
  color: var(--text-tertiary);
  margin-top: 2px;
  opacity: 0.7;
}

/* Loading / Empty / Error States */
.loading-state,
.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 13px;
  text-align: center;
}
.loading-state.small,
.empty-state.small {
  padding: 12px;
  font-size: 12px;
}
.loading-state iconify-icon,
.empty-state iconify-icon,
.error-state iconify-icon {
  font-size: 24px;
}
.error-state {
  color: var(--accent-error);
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* Facts List */
.facts-list {
  max-height: 300px;
  overflow-y: auto;
}
.fact-item {
  padding: 10px 12px;
  border-bottom: 1px solid var(--glass-border);
}
.fact-item:last-child {
  border-bottom: none;
}
.fact-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}
.fact-content iconify-icon {
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 2px;
}
.fact-content iconify-icon.valid {
  color: var(--accent-success);
}
.fact-content iconify-icon.invalid {
  color: var(--accent-error);
}
.fact-content .strikethrough {
  text-decoration: line-through;
  opacity: 0.6;
}
.fact-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  padding-left: 22px;
}
.fact-meta .date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-tertiary);
}
.fact-meta .date.valid iconify-icon {
  color: var(--accent-success);
}
.fact-meta .date.invalid iconify-icon {
  color: var(--accent-error);
}

/* Entities List */
.entities-list {
  max-height: 300px;
  overflow-y: auto;
}
.entity-item {
  padding: 12px;
  background: var(--surface-2);
  border-radius: 8px;
  margin-bottom: 8px;
}
.entity-item:last-child {
  margin-bottom: 0;
}
.entity-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.entity-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
}
.entity-label {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--accent-primary);
  color: var(--surface-0);
  border-radius: 4px;
  text-transform: uppercase;
}
.entity-summary {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}
.entity-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-tertiary);
  margin-top: 8px;
}

/* Messages List */
.messages-list {
  max-height: 300px;
  overflow-y: auto;
}
.message-item {
  padding: 10px 12px;
  border-left: 3px solid var(--glass-border);
  margin-bottom: 8px;
  background: var(--surface-1);
  border-radius: 0 6px 6px 0;
}
.message-item.user, .message-item.human {
  border-left-color: var(--accent-primary);
}
.message-item.assistant, .message-item.ai {
  border-left-color: var(--accent-secondary);
}
.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.message-role {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: capitalize;
}
.message-content {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}
.message-date {
  font-size: 10px;
  color: var(--text-tertiary);
}

/* Graph Actions */
.graph-actions {
  display: flex;
  gap: 8px;
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

/* Danger Zone */
.danger-zone {
  padding: 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
}
.danger-zone h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-error);
  display: flex;
  align-items: center;
  gap: 6px;
}
.danger-zone p {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.4;
}

/* Delete Confirmation Modal */
.confirm-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.confirm-modal {
  width: 100%;
  max-width: 420px;
  background: var(--surface-1);
  border-radius: 16px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.confirm-modal-header {
  padding: 20px 24px;
  background: rgba(239, 68, 68, 0.1);
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
}
.confirm-modal-header .warning-icon {
  font-size: 28px;
  color: var(--accent-error);
}
.confirm-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.confirm-modal-body {
  padding: 20px 24px;
}
.confirm-modal-body p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.user-id-display {
  display: block;
  padding: 10px 14px;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
  color: var(--accent-primary);
  margin-bottom: 16px;
  word-break: break-all;
}
.warning-text {
  padding: 12px;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 6px;
  font-size: 13px;
  color: var(--accent-error);
}
.delete-error {
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: var(--accent-error);
  display: flex;
  align-items: center;
  gap: 8px;
}
.confirm-modal-footer {
  padding: 16px 24px;
  background: var(--surface-0);
  border-top: 1px solid var(--glass-border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
