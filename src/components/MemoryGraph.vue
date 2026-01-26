<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { getMemoryGraph, type MemoryGraph as GraphData } from 'kwami-ai'

const props = defineProps<{
  userId: string
  apiBaseUrl?: string
}>()

const graph = ref<GraphData>({ nodes: [], edges: [] })
const loading = ref(false)
const error = ref<string | null>(null)
const positions = ref<Map<string, {x: number, y: number}>>(new Map())
const selectedNode = ref<string | null>(null)
const searchQuery = ref('')
const filterType = ref('all')

// Entity type colors (matching Zep's color scheme)
const typeColors = {
  user: '#00d9a6',      // Teal/green
  person: '#ff6b9d',     // Pink
  location: '#00d9a6',   // Green
  organization: '#ffa726', // Orange
  event: '#42a5f5',      // Blue
  genre: '#ab47bc',      // Purple
  artist: '#ff6b9d',     // Pink
  venue: '#00d9a6',      // Green
  fact: '#42a5f5',       // Blue
  entity: '#ffa726',     // Orange (default)
} as const

const defaultColor = '#ffa726'

// Get unique entity types for filter
const entityTypes = computed(() => {
  const types = new Set(graph.value.nodes.map(n => n.type))
  return ['all', ...Array.from(types)]
})

// Filtered nodes based on search and type
const filteredGraph = computed(() => {
  let nodes = graph.value.nodes
  let edges = graph.value.edges
  
  // Filter by type
  if (filterType.value !== 'all') {
    const nodeIds = new Set(nodes.filter(n => n.type === filterType.value).map(n => n.id))
    nodes = nodes.filter(n => nodeIds.has(n.id))
    edges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
  }
  
  // Filter by search
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

function getNodeColor(type: string): string {
  const key = type.toLowerCase() as keyof typeof typeColors
  return typeColors[key] ?? defaultColor
}

async function fetchGraph() {
  if (!props.userId) return
  
  loading.value = true
  error.value = null
  try {
    const baseUrl = props.apiBaseUrl || 'http://localhost:8080'
    const url = `${baseUrl}/memory/${props.userId}/graph`
    console.log(`📊 Fetching memory graph from: ${url}`)
    
    graph.value = await getMemoryGraph(baseUrl, props.userId)
    console.log(`📊 Graph data:`, graph.value)
    
    if (graph.value.nodes.length === 0) {
      console.log('📊 No nodes returned - memory might be empty or user_id mismatch')
    }
    
    initSimulation()
  } catch (e) {
    console.error('📊 Failed to fetch graph:', e)
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

function initSimulation() {
  const width = 800
  const height = 600
  const k = 0.5 // spring constant
  const repulsion = 5000
  
  // Initial positions
  const newPositions = new Map()
  graph.value.nodes.forEach(node => {
     if (node.id === 'user') {
         newPositions.set(node.id, { x: width/2, y: height/2 })
     } else {
         newPositions.set(node.id, {
             x: width/2 + (Math.random() - 0.5) * 200,
             y: height/2 + (Math.random() - 0.5) * 200
         })
     }
  })
  positions.value = newPositions
  
  // Simple layout iterations
  for(let i=0; i<150; i++) {
     tick(width, height, k, repulsion)
  }
}

function tick(width: number, height: number, k: number, repulsion: number) {
    const nodes = graph.value.nodes
    const edges = graph.value.edges
    const pos = positions.value
    
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const nodeI = nodes[i]
            const nodeJ = nodes[j]
            if (!nodeI || !nodeJ) continue
            const u = nodeI.id
            const v = nodeJ.id
            const p1 = pos.get(u)!
            const p2 = pos.get(v)!
            
            const dx = p1.x - p2.x
            const dy = p1.y - p2.y
            const distSq = dx*dx + dy*dy || 1
            const f = repulsion / distSq
            const dist = Math.sqrt(distSq)
            
            const fx = (dx/dist) * f
            const fy = (dy/dist) * f
            
            if (u !== 'user') { p1.x += fx; p1.y += fy; }
            if (v !== 'user') { p2.x -= fx; p2.y -= fy; }
        }
    }
    
    // Attraction (Edges)
    edges.forEach(edge => {
        const u = edge.source
        const v = edge.target
        const p1 = pos.get(u)
        const p2 = pos.get(v)
        
        if(p1 && p2) {
             const dx = p2.x - p1.x
             const dy = p2.y - p1.y
             const dist = Math.sqrt(dx*dx + dy*dy) || 1
             
             const f = (dist - 100) * k // Target length 100
             const fx = (dx/dist) * f
             const fy = (dy/dist) * f
             
             if (u !== 'user') { p1.x += fx; p1.y += fy; }
             if (v !== 'user') { p2.x -= fx; p2.y -= fy; }
        }
    })
    
    // Bounding box
    nodes.forEach(node => {
        const p = pos.get(node.id)!
        p.x = Math.max(20, Math.min(width-20, p.x))
        p.y = Math.max(20, Math.min(height-20, p.y))
    })
}

onMounted(fetchGraph)
watch(() => props.userId, fetchGraph)
</script>

<template>
  <div class="memory-graph-container">
    <!-- Header with search and filter -->
    <div class="graph-header">
      <div class="search-box">
        <iconify-icon icon="ph:magnifying-glass"></iconify-icon>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search graph.."
          class="search-input"
        />
      </div>
      <select v-model="filterType" class="type-filter">
        <option v-for="t in entityTypes" :key="t" :value="t">
          {{ t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) }}
        </option>
      </select>
      <button class="refresh-btn" @click="fetchGraph" :disabled="loading">
        <iconify-icon :icon="loading ? 'ph:spinner-gap' : 'ph:arrows-clockwise'" :class="{ spin: loading }"></iconify-icon>
      </button>
    </div>
    
    <!-- Entity Type Legend -->
    <div class="type-legend" v-if="graph.nodes.length > 0">
      <span class="legend-label">Entity Types</span>
      <div class="legend-items">
        <span 
          v-for="type in [...new Set(graph.nodes.map(n => n.type))]" 
          :key="type"
          class="legend-item"
        >
          <span class="legend-dot" :style="{ background: getNodeColor(type) }"></span>
          {{ type }}
        </span>
      </div>
    </div>
    
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
    
    <div v-else class="graph-view">
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="5" 
          refX="18" refY="2.5" orient="auto" fill="#4a5568">
            <polygon points="0 0, 6 2.5, 0 5" />
          </marker>
        </defs>
      
        <!-- Edges -->
        <g class="edges">
           <line v-for="(edge, i) in filteredGraph.edges" :key="i"
             :x1="positions.get(edge.source)?.x" 
             :y1="positions.get(edge.source)?.y"
             :x2="positions.get(edge.target)?.x" 
             :y2="positions.get(edge.target)?.y"
             stroke="#4a5568" 
             stroke-width="1" 
             stroke-opacity="0.6"
             marker-end="url(#arrowhead)" />
        </g>
        
        <!-- Nodes -->
        <g class="nodes">
           <g v-for="node in filteredGraph.nodes" :key="node.id"
              :transform="`translate(${positions.get(node.id)?.x || 0}, ${positions.get(node.id)?.y || 0})`"
              class="node-group"
              :class="{ selected: selectedNode === node.id }"
              @click="selectedNode = selectedNode === node.id ? null : node.id">
              
              <circle 
                :r="node.type === 'user' ? 20 : 12" 
                :fill="getNodeColor(node.type)"
                stroke="rgba(255,255,255,0.3)" 
                stroke-width="2"
                class="node-circle"
              />
                      
              <text dy="28" text-anchor="middle" font-size="11" fill="#e2e8f0" class="node-label">
                  {{ node.label.length > 15 ? node.label.slice(0, 13) + '...' : node.label }}
              </text>
           </g>
        </g>
      </svg>
      
      <!-- Node details tooltip -->
      <div v-if="selectedNode" class="node-details">
        <div class="detail-header">
          <span class="detail-dot" :style="{ background: getNodeColor(graph.nodes.find(n => n.id === selectedNode)?.type || 'entity') }"></span>
          <strong>{{ graph.nodes.find(n => n.id === selectedNode)?.label }}</strong>
        </div>
        <div class="detail-type">Type: {{ graph.nodes.find(n => n.id === selectedNode)?.type }}</div>
      </div>
      
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

.graph-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: #94a3b8;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e2e8f0;
  font-size: 13px;
}

.search-input::placeholder {
  color: #64748b;
}

.type-filter {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: #e2e8f0;
  font-size: 13px;
  cursor: pointer;
}

.type-filter option {
  background: #1e293b;
}

.refresh-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(255,255,255,0.02);
  border-radius: 6px;
}

.legend-label {
  font-size: 11px;
  color: #ff6b9d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.graph-view {
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  background: #0a0e14;
  overflow: hidden;
  position: relative;
  flex: 1;
  min-height: 400px;
}

.node-group {
  cursor: pointer;
  transition: transform 0.2s;
}

.node-group:hover .node-circle {
  filter: brightness(1.2);
}

.node-group.selected .node-circle {
  stroke: #fff;
  stroke-width: 3;
}

.node-label {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-shadow: 0 1px 3px rgba(0,0,0,0.9);
  pointer-events: none;
}

.node-details {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 12px;
  min-width: 180px;
  backdrop-filter: blur(8px);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.detail-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.detail-type {
  font-size: 11px;
  color: #64748b;
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
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 8px 12px;
  font-size: 12px;
  color: #64748b;
  background: rgba(0,0,0,0.3);
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
