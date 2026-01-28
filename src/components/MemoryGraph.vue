<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { getMemoryGraph, type MemoryGraph as GraphData, type MemoryNode, type MemoryEdge } from 'kwami-ai'
import { useAuthStore } from '@/stores/auth'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps<{
  userId: string
  apiBaseUrl?: string
}>()

const authStore = useAuthStore()

const graph = ref<GraphData>({ nodes: [], edges: [] })
const loading = ref(false)
const error = ref<string | null>(null)
const selectedNode = ref<MemoryNode | null>(null)
const selectedNodeEdges = ref<MemoryEdge[]>([])
const searchQuery = ref('')
const filterType = ref('all')

// 3D Scene refs
const containerRef = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number
let nodeObjects: Map<string, THREE.Mesh> = new Map()
let edgeObjects: THREE.Line[] = []
let labelSprites: Map<string, THREE.Sprite> = new Map()
let positions3D: Map<string, THREE.Vector3> = new Map()
let raycaster: THREE.Raycaster
let mouse: THREE.Vector2

// Entity type colors (matching Zep's color scheme)
const typeColors: Record<string, number> = {
  user: 0x00d9a6,      // Teal/green
  person: 0xff6b9d,     // Pink
  location: 0x00d9a6,   // Green
  organization: 0xffa726, // Orange
  event: 0x42a5f5,      // Blue
  genre: 0xab47bc,      // Purple
  artist: 0xff6b9d,     // Pink
  venue: 0x00d9a6,      // Green
  fact: 0x42a5f5,       // Blue
  entity: 0xffa726,     // Orange (default)
}

const typeColorsHex: Record<string, string> = {
  user: '#00d9a6',
  person: '#ff6b9d',
  location: '#00d9a6',
  organization: '#ffa726',
  event: '#42a5f5',
  genre: '#ab47bc',
  artist: '#ff6b9d',
  venue: '#00d9a6',
  fact: '#42a5f5',
  entity: '#ffa726',
}

const defaultColor = 0xffa726
const defaultColorHex = '#ffa726'

// Get unique entity types for filter
const entityTypes = computed(() => {
  const types = new Set(graph.value.nodes.map(n => n.type))
  return ['all', ...Array.from(types)]
})

// Filtered nodes based on search and type
const filteredGraph = computed(() => {
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

function getNodeColor(type: string): number {
  const key = type.toLowerCase() as keyof typeof typeColors
  return typeColors[key] ?? defaultColor
}

function getNodeColorHex(type: string): string {
  const key = type.toLowerCase() as keyof typeof typeColorsHex
  return typeColorsHex[key] ?? defaultColorHex
}

async function fetchGraph() {
  if (!props.userId) return
  
  loading.value = true
  error.value = null
  selectedNode.value = null
  
  try {
    const baseUrl = props.apiBaseUrl || 'http://localhost:8080'
    console.log(`📊 Fetching memory graph from: ${baseUrl}/memory/${props.userId}/graph`)
    
    // Get auth token for API request
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
  
  // Wait for DOM to update after loading state changes, then init 3D scene
  if (graph.value.nodes.length > 0) {
    await nextTick()
    initScene()
    init3DLayout()
    buildGraphObjects()
  }
}

function initScene() {
  if (!containerRef.value) return
  
  // Clean up existing scene
  if (renderer) {
    renderer.domElement.removeEventListener('click', onMouseClick)
    renderer.domElement.removeEventListener('mousemove', onMouseMove)
    renderer.dispose()
    // Safely remove the canvas if it's still in the container
    if (renderer.domElement.parentNode === containerRef.value) {
      containerRef.value.removeChild(renderer.domElement)
    }
  }
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  nodeObjects.clear()
  labelSprites.clear()
  edgeObjects = []
  
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight || 500

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0e14)

  // Camera
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000)
  camera.position.set(0, 0, 300)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  containerRef.value.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 50
  controls.maxDistance = 800

  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  // Point light
  const pointLight = new THREE.PointLight(0xffffff, 1)
  pointLight.position.set(100, 100, 100)
  scene.add(pointLight)

  // Raycaster for picking
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Event listeners
  renderer.domElement.addEventListener('click', onMouseClick)
  renderer.domElement.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onWindowResize)

  animate()
}

function init3DLayout() {
  const nodes = filteredGraph.value.nodes
  const edges = filteredGraph.value.edges
  
  positions3D.clear()
  
  // Initial random positions in 3D space
  nodes.forEach(node => {
    if (node.id === 'user') {
      positions3D.set(node.id, new THREE.Vector3(0, 0, 0))
    } else {
      positions3D.set(node.id, new THREE.Vector3(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      ))
    }
  })
  
  // Force-directed layout in 3D
  const iterations = 200
  const k = 0.3 // Spring constant
  const repulsion = 8000
  const targetLength = 80
  
  for (let i = 0; i < iterations; i++) {
    const cooling = 1 - (i / iterations) * 0.5 // Cooling factor
    
    // Repulsion between all nodes
    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const nodeA = nodes[a]
        const nodeB = nodes[b]
        if (!nodeA || !nodeB) continue
        
        const posA = positions3D.get(nodeA.id)!
        const posB = positions3D.get(nodeB.id)!
        
        const delta = new THREE.Vector3().subVectors(posA, posB)
        const distSq = delta.lengthSq() || 1
        const dist = Math.sqrt(distSq)
        
        const force = (repulsion / distSq) * cooling
        delta.normalize().multiplyScalar(force)
        
        if (nodeA.id !== 'user') posA.add(delta)
        if (nodeB.id !== 'user') posB.sub(delta)
      }
    }
    
    // Attraction along edges
    edges.forEach(edge => {
      const posA = positions3D.get(edge.source)
      const posB = positions3D.get(edge.target)
      
      if (posA && posB) {
        const delta = new THREE.Vector3().subVectors(posB, posA)
        const dist = delta.length() || 1
        const force = (dist - targetLength) * k * cooling
        delta.normalize().multiplyScalar(force)
        
        if (edge.source !== 'user') posA.add(delta)
        if (edge.target !== 'user') posB.sub(delta)
      }
    })
  }
}

function buildGraphObjects() {
  if (!scene) {
    console.error('📊 Scene not initialized')
    return
  }
  
  // Clear existing objects
  nodeObjects.forEach(obj => scene.remove(obj))
  edgeObjects.forEach(obj => scene.remove(obj))
  labelSprites.forEach(sprite => scene.remove(sprite))
  nodeObjects.clear()
  edgeObjects = []
  labelSprites.clear()
  
  const nodes = filteredGraph.value.nodes
  const edges = filteredGraph.value.edges
  
  // Create edges first (so they appear behind nodes)
  edges.forEach(edge => {
    const startPos = positions3D.get(edge.source)
    const endPos = positions3D.get(edge.target)
    
    if (startPos && endPos) {
      // Create curved line for better visibility
      const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5)
      
      // Add slight curve to avoid overlap
      const perpendicular = new THREE.Vector3()
        .crossVectors(
          new THREE.Vector3().subVectors(endPos, startPos).normalize(),
          new THREE.Vector3(0, 1, 0)
        )
        .normalize()
        .multiplyScalar(5)
      midPoint.add(perpendicular)
      
      // Create quadratic bezier curve
      const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos)
      const points = curve.getPoints(20)
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ 
        color: 0x4a5568, 
        opacity: 0.7,
        transparent: true,
        linewidth: 2
      })
      
      const line = new THREE.Line(geometry, material)
      ;(line as any).edgeData = edge
      scene.add(line)
      edgeObjects.push(line)
      
      // Add edge label at midpoint
      const labelSprite = createTextSprite(edge.relation, 0x8892a0, 0.6, 8)
      labelSprite.position.copy(midPoint)
      scene.add(labelSprite)
    }
  })
  
  // Create nodes
  nodes.forEach(node => {
    const pos = positions3D.get(node.id)
    if (!pos) return
    
    const radius = node.id === 'user' ? 12 : 8
    const color = getNodeColor(node.type)
    
    // Node sphere
    const geometry = new THREE.SphereGeometry(radius, 32, 32)
    const material = new THREE.MeshPhongMaterial({ 
      color,
      emissive: color,
      emissiveIntensity: 0.3,
      shininess: 50
    })
    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.copy(pos)
    ;(sphere as any).nodeData = node
    scene.add(sphere)
    nodeObjects.set(node.id, sphere)
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(radius * 1.3, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    glow.position.copy(pos)
    scene.add(glow)
    
    // Node label
    const label = node.label.length > 18 ? node.label.slice(0, 16) + '...' : node.label
    const labelSprite = createTextSprite(label, 0xe2e8f0, 1, 12)
    labelSprite.position.copy(pos)
    labelSprite.position.y -= radius + 12
    scene.add(labelSprite)
    labelSprites.set(node.id, labelSprite)
  })
}

function createTextSprite(text: string, color: number, opacity: number = 1, fontSize: number = 14): THREE.Sprite {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = 256
  canvas.height = 64
  
  context.fillStyle = 'transparent'
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  context.font = `bold ${fontSize * 3}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  
  // Text shadow for readability
  context.shadowColor = 'rgba(0, 0, 0, 0.8)'
  context.shadowBlur = 4
  context.shadowOffsetX = 1
  context.shadowOffsetY = 1
  
  context.fillStyle = `#${color.toString(16).padStart(6, '0')}`
  context.fillText(text, canvas.width / 2, canvas.height / 2)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  
  const material = new THREE.SpriteMaterial({ 
    map: texture, 
    transparent: true,
    opacity,
    depthTest: false
  })
  
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(50, 12.5, 1)
  
  return sprite
}

function onMouseClick(event: MouseEvent) {
  if (!containerRef.value) return
  
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  raycaster.setFromCamera(mouse, camera)
  
  const meshes = Array.from(nodeObjects.values())
  const intersects = raycaster.intersectObjects(meshes)
  
  if (intersects.length > 0) {
    const obj = intersects[0].object as THREE.Mesh
    const nodeData = (obj as any).nodeData as MemoryNode
    
    if (nodeData) {
      selectedNode.value = nodeData
      
      // Find all edges connected to this node
      selectedNodeEdges.value = graph.value.edges.filter(
        e => e.source === nodeData.id || e.target === nodeData.id
      )
      
      // Highlight selected node
      nodeObjects.forEach((mesh, id) => {
        const mat = mesh.material as THREE.MeshPhongMaterial
        if (id === nodeData.id) {
          mat.emissiveIntensity = 0.8
        } else {
          mat.emissiveIntensity = 0.3
        }
      })
    }
  } else {
    selectedNode.value = null
    selectedNodeEdges.value = []
    
    // Reset all node highlights
    nodeObjects.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshPhongMaterial
      mat.emissiveIntensity = 0.3
    })
  }
}

function onMouseMove(event: MouseEvent) {
  if (!containerRef.value || !renderer) return
  
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  raycaster.setFromCamera(mouse, camera)
  
  const meshes = Array.from(nodeObjects.values())
  const intersects = raycaster.intersectObjects(meshes)
  
  renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'grab'
}

function onWindowResize() {
  if (!containerRef.value || !camera || !renderer) return
  
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight || 500
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  
  if (controls) controls.update()
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function getConnectedNodeLabel(nodeId: string): string {
  const node = graph.value.nodes.find(n => n.id === nodeId)
  return node?.label || nodeId
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return dateStr
  }
}

onMounted(fetchGraph)

watch(() => props.userId, fetchGraph)

watch(filteredGraph, () => {
  if (scene && graph.value.nodes.length > 0) {
    init3DLayout()
    buildGraphObjects()
  }
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.domElement.removeEventListener('click', onMouseClick)
    renderer.domElement.removeEventListener('mousemove', onMouseMove)
    renderer.dispose()
  }
  window.removeEventListener('resize', onWindowResize)
})
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
          <span class="legend-dot" :style="{ background: getNodeColorHex(type) }"></span>
          {{ type }}
        </span>
      </div>
      <span class="legend-hint">
        <iconify-icon icon="ph:hand-grabbing"></iconify-icon>
        Drag to rotate • Scroll to zoom • Click nodes for details
      </span>
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
    
    <div v-else class="graph-wrapper">
      <div ref="containerRef" class="graph-3d-container"></div>
      
      <!-- Node details panel (Zep-style) -->
      <Transition name="slide">
        <div v-if="selectedNode" class="node-details-panel">
          <div class="panel-header">
            <h3 class="panel-title">Node Details</h3>
            <span 
              class="type-badge-header" 
              :style="{ background: getNodeColorHex(selectedNode.type) }"
            >
              {{ selectedNode.type }}
            </span>
            <button class="close-btn" @click="selectedNode = null">
              <iconify-icon icon="ph:x"></iconify-icon>
            </button>
          </div>
          
          <div class="panel-content">
            <!-- Name -->
            <div class="detail-section">
              <span class="detail-label">Name:</span>
              <span class="detail-value name-value">{{ selectedNode.label }}</span>
            </div>
            
            <!-- UUID -->
            <div v-if="selectedNode.uuid" class="detail-section">
              <span class="detail-label">UUID:</span>
              <span class="detail-value mono uuid-value">{{ selectedNode.uuid }}</span>
            </div>
            
            <!-- Created date -->
            <div v-if="selectedNode.created_at" class="detail-section">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ formatDate(selectedNode.created_at) }}</span>
            </div>
            
            <!-- Summary -->
            <div v-if="selectedNode.summary" class="detail-section summary-section">
              <span class="detail-label">Summary:</span>
              <p class="summary-text">{{ selectedNode.summary }}</p>
            </div>
            
            <!-- Labels -->
            <div v-if="selectedNode.labels && selectedNode.labels.length > 0" class="detail-section">
              <span class="detail-label">Labels:</span>
              <div class="labels-container">
                <span 
                  v-for="label in selectedNode.labels" 
                  :key="label" 
                  class="label-badge"
                >
                  {{ label }}
                </span>
              </div>
            </div>
            
            <!-- Connections -->
            <div v-if="selectedNodeEdges.length > 0" class="connections-section">
              <span class="section-title">
                <iconify-icon icon="ph:link"></iconify-icon>
                Connections ({{ selectedNodeEdges.length }})
              </span>
              <div class="connections-list">
                <div 
                  v-for="(edge, idx) in selectedNodeEdges" 
                  :key="idx" 
                  class="connection-item"
                >
                  <span class="connection-direction">
                    <template v-if="edge.source === selectedNode?.id">
                      <iconify-icon icon="ph:arrow-right"></iconify-icon>
                    </template>
                    <template v-else>
                      <iconify-icon icon="ph:arrow-left"></iconify-icon>
                    </template>
                  </span>
                  <span class="connection-relation">{{ edge.relation }}</span>
                  <span class="connection-target">
                    {{ edge.source === selectedNode?.id 
                      ? getConnectedNodeLabel(edge.target) 
                      : getConnectedNodeLabel(edge.source) 
                    }}
                  </span>
                </div>
              </div>
            </div>
            
            <div v-else class="no-connections">
              <iconify-icon icon="ph:link-break"></iconify-icon>
              No connections found
            </div>
          </div>
        </div>
      </Transition>
      
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
  padding: 8px 12px;
  background: rgba(255,255,255,0.02);
  border-radius: 6px;
  flex-wrap: wrap;
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
  flex: 1;
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

.legend-hint {
  font-size: 11px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.graph-wrapper {
  position: relative;
  flex: 1;
  min-height: 500px;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  overflow: hidden;
}

.graph-3d-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.node-details-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 340px;
  max-height: calc(100% - 60px);
  background: rgba(20, 27, 40, 0.98);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  backdrop-filter: blur(16px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
}

.panel-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
}

.type-badge-header {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  text-transform: capitalize;
}

.close-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
}

.panel-content {
  padding: 18px;
  overflow-y: auto;
  flex: 1;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  color: #e2e8f0;
}

.detail-value.name-value {
  font-size: 15px;
  font-weight: 500;
}

.detail-value.mono {
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 12px;
  color: #94a3b8;
}

.detail-value.uuid-value {
  word-break: break-all;
  line-height: 1.4;
}

.summary-section {
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.summary-text {
  font-size: 13px;
  color: #b8c5d6;
  line-height: 1.6;
  margin: 6px 0 0 0;
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  border-left: 3px solid #42a5f5;
}

.labels-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.label-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.type-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.connections-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #ff6b9d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.connections-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.connection-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.05);
}

.connection-direction {
  color: #64748b;
  font-size: 14px;
}

.connection-relation {
  font-size: 11px;
  color: #42a5f5;
  background: rgba(66, 165, 245, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.connection-target {
  flex: 1;
  font-size: 13px;
  color: #e2e8f0;
  text-align: right;
}

.no-connections {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #64748b;
  font-size: 13px;
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

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
