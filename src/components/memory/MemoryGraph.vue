<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getMemoryGraph } from 'kwami-ai'
import { useAuthStore } from '@/stores/auth'
import type { MemoryGraph as GraphData, MemoryNode, MemoryEdge, ViewMode } from './types'
import MemoryGraphHeader from './MemoryGraphHeader.vue'
import MemoryGraphLegend from './MemoryGraphLegend.vue'
import MemoryGraph3D from './MemoryGraph3D.vue'
import MemoryGraph2D from './MemoryGraph2D.vue'
import MemoryNodeDetails from './MemoryNodeDetails.vue'

const props = defineProps<{
  userId: string
  apiBaseUrl?: string
}>()

const authStore = useAuthStore()

// State
const graph = ref<GraphData>({ nodes: [], edges: [] })
const loading = ref(false)
const error = ref<string | null>(null)
const selectedNode = ref<MemoryNode | null>(null)
const searchQuery = ref('')
const filterType = ref('all')
const showEdgeLabels = ref(true)
const viewMode = ref<ViewMode>('3d')

// Computed
const entityTypes = computed(() => {
  const types = new Set(graph.value.nodes.map(n => n.type))
  return ['all', ...Array.from(types)]
})

const filteredGraph = computed((): GraphData => {
  let nodes = graph.value.nodes
  let edges = graph.value.edges
  
  if (filterType.value !== 'all') {
    const nodeIds = new Set(nodes.filter(n => n.type === filterType.value).map(n => n.id))
    nodes = nodes.filter(n => nodeIds.has(n.id))
    edges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    const matchingIds = new Set(nodes.filter(n => 
      n.label.toLowerCase().includes(query)
    ).map(n => n.id))
    nodes = nodes.filter(n => matchingIds.has(n.id))
    edges = edges.filter(e => matchingIds.has(e.source) || matchingIds.has(e.target))
  }
  
  return { nodes, edges }
})

const selectedNodeEdges = computed((): MemoryEdge[] => {
  if (!selectedNode.value) return []
  return graph.value.edges.filter(
    e => e.source === selectedNode.value!.id || e.target === selectedNode.value!.id
  )
})

// Methods
async function fetchGraph() {
  if (!props.userId) return
  
  loading.value = true
  error.value = null
  selectedNode.value = null
  
  try {
    const baseUrl = props.apiBaseUrl || 'http://localhost:8080'
    console.log(`📊 Fetching memory graph from: ${baseUrl}/memory/${props.userId}/graph`)
    
    const authToken = await authStore.getAccessToken()
    
    graph.value = await getMemoryGraph(baseUrl, props.userId, { authToken: authToken || undefined })
    console.log(`📊 Graph data:`, graph.value)
    
    if (graph.value.nodes.length === 0) {
      console.log('📊 No nodes returned - memory might be empty or user_id mismatch')
    }
  } catch (e) {
    console.error('📊 Failed to fetch graph:', e)
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

function handleSelectNode(node: MemoryNode | null) {
  selectedNode.value = node
}

function handleCloseDetails() {
  selectedNode.value = null
}

// Lifecycle
onMounted(fetchGraph)

watch(() => props.userId, fetchGraph)
</script>

<template>
  <div class="memory-graph-container">
    <!-- Header -->
    <MemoryGraphHeader
      v-model:searchQuery="searchQuery"
      v-model:filterType="filterType"
      v-model:showEdgeLabels="showEdgeLabels"
      v-model:viewMode="viewMode"
      :entity-types="entityTypes"
      :loading="loading"
      @refresh="fetchGraph"
    />
    
    <!-- Legend -->
    <MemoryGraphLegend 
      :nodes="graph.nodes"
      :view-mode="viewMode"
    />
    
    <!-- Loading / Error / Empty states -->
    <div v-if="loading" class="loading">
      <iconify-icon icon="ph:spinner-gap" class="spin"></iconify-icon>
      Loading graph data...
    </div>
    
    <div v-else-if="error" class="error">
      <iconify-icon icon="ph:warning-circle"></iconify-icon>
      {{ error }}
    </div>
    
    <div v-else-if="graph.nodes.length === 0" class="empty">
      <iconify-icon icon="ph:graph"></iconify-icon>
      <span>No graph data found</span>
      <small>User ID: {{ props.userId }}</small>
      <small>API: {{ props.apiBaseUrl }}/memory/{{ props.userId }}/graph</small>
      <small class="hint">If facts exist but graph is empty, the Zep graph API may not be available on your plan</small>
    </div>
    
    <!-- Graph visualization -->
    <div v-else class="graph-wrapper">
      <!-- 3D View -->
      <MemoryGraph3D
        v-if="viewMode === '3d'"
        :graph="filteredGraph"
        :show-edge-labels="showEdgeLabels"
        :selected-node-id="selectedNode?.id ?? null"
        @select-node="handleSelectNode"
      />
      
      <!-- 2D View -->
      <MemoryGraph2D
        v-else
        :graph="filteredGraph"
        :show-edge-labels="showEdgeLabels"
        :selected-node-id="selectedNode?.id ?? null"
        @select-node="handleSelectNode"
      />
      
      <!-- Node Details Panel -->
      <MemoryNodeDetails
        :node="selectedNode"
        :edges="selectedNodeEdges"
        :graph="graph"
        @close="handleCloseDetails"
      />
      
      <!-- Metrics -->
      <div class="metrics">
        <span>{{ filteredGraph.nodes.length }} nodes</span>
        <span>{{ filteredGraph.edges.length }} edges</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.memory-graph-container {
  background: #0d1117;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  color: #e2e8f0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.graph-wrapper {
  position: relative;
  flex: 1;
  min-height: 500px;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  overflow: hidden;
}

.loading, .error, .empty {
  padding: 60px 20px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.loading iconify-icon, .error iconify-icon, .empty iconify-icon {
  font-size: 32px;
}

.error {
  color: #f87171;
}

.empty small {
  font-size: 12px;
  color: #475569;
}

.empty small.hint {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(255, 171, 64, 0.1);
  border: 1px solid rgba(255, 171, 64, 0.2);
  border-radius: 6px;
  color: #ffa726;
  max-width: 400px;
  text-align: center;
}

.metrics {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 8px 12px;
  font-size: 12px;
  color: #64748b;
  background: rgba(0,0,0,0.6);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
