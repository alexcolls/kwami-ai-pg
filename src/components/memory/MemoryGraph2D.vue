<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import type { MemoryNode, MemoryGraph, Position2D } from './types'
import { 
  getNodeColorHex, 
  calculate2DLayout, 
  calculateNodeRadius,
  truncateText 
} from './utils'

const props = defineProps<{
  graph: MemoryGraph
  showEdgeLabels: boolean
  selectedNodeId: string | null
}>()

const emit = defineEmits<{
  (e: 'select-node', node: MemoryNode | null): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let positions = new Map<string, Position2D>()
let degrees = new Map<string, number>()
let animationId: number

// Pan and zoom state
const transform = ref({
  x: 0,
  y: 0,
  scale: 1
})

let isDragging = false
let lastMousePos = { x: 0, y: 0 }
let hoveredNodeId: string | null = null

const canvasSize = ref({ width: 800, height: 600 })

// Get CSS variable value
function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// Check if light mode
function isLightMode(): boolean {
  return document.documentElement.getAttribute('data-theme') === 'light'
}

// Get theme-aware canvas background
function getCanvasBg(): string {
  const opacity = parseFloat(getCSSVar('--glass-opacity')) || 0.88
  if (isLightMode()) {
    const base = Math.round(245 * opacity + 255 * (1 - opacity))
    return `rgb(${base}, ${base}, ${base})`
  } else {
    const base = Math.round(8 * opacity)
    return `rgb(${base}, ${base + 2}, ${base + 10})`
  }
}

function initCanvas() {
  if (!canvasRef.value || !containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  canvasSize.value = { width: rect.width, height: rect.height || 500 }
  
  canvasRef.value.width = canvasSize.value.width * window.devicePixelRatio
  canvasRef.value.height = canvasSize.value.height * window.devicePixelRatio
  canvasRef.value.style.width = `${canvasSize.value.width}px`
  canvasRef.value.style.height = `${canvasSize.value.height}px`
  
  ctx = canvasRef.value.getContext('2d')
  if (ctx) {
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  }
}

function calculateLayout() {
  if (props.graph.nodes.length === 0) return
  
  const result = calculate2DLayout(
    props.graph.nodes,
    props.graph.edges,
    canvasSize.value.width,
    canvasSize.value.height
  )
  
  positions = result.positions
  degrees = result.degrees
}

function draw() {
  if (!ctx) return
  
  const { width, height } = canvasSize.value
  const lightMode = isLightMode()
  
  // Get theme colors - use black text in light mode for readability
  const textColor = lightMode ? '#0f172a' : '#e2e8f0'
  const textMuted = lightMode ? '#334155' : '#94a3b8'
  const edgeColor = lightMode ? 'rgba(71, 85, 105, 0.6)' : 'rgba(61, 74, 92, 0.6)'
  const labelBg = lightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.8)'
  const textShadow = lightMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'
  
  // Clear canvas with theme background
  ctx.fillStyle = getCanvasBg()
  ctx.fillRect(0, 0, width, height)
  
  // Apply transform
  ctx.save()
  ctx.translate(transform.value.x, transform.value.y)
  ctx.scale(transform.value.scale, transform.value.scale)
  
  const nodes = props.graph.nodes
  const edges = props.graph.edges
  
  // Get max degree for sizing
  let maxDegree = 1
  degrees.forEach(d => { if (d > maxDegree) maxDegree = d })
  
  // Draw edges
  edges.forEach(edge => {
    const startPos = positions.get(edge.source)
    const endPos = positions.get(edge.target)
    
    if (startPos && endPos) {
      // Calculate curve control point
      const midX = (startPos.x + endPos.x) / 2
      const midY = (startPos.y + endPos.y) / 2
      
      // Add perpendicular offset for curve
      const dx = endPos.x - startPos.x
      const dy = endPos.y - startPos.y
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const perpX = -dy / len * 15
      const perpY = dx / len * 15
      
      const ctrlX = midX + perpX
      const ctrlY = midY + perpY
      
      // Draw edge
      ctx.beginPath()
      ctx.moveTo(startPos.x, startPos.y)
      ctx.quadraticCurveTo(ctrlX, ctrlY, endPos.x, endPos.y)
      ctx.strokeStyle = edgeColor
      ctx.lineWidth = 1.5
      ctx.stroke()
      
      // Draw edge label if enabled
      if (props.showEdgeLabels && transform.value.scale > 0.6) {
        const labelX = (startPos.x + 2 * ctrlX + endPos.x) / 4
        const labelY = (startPos.y + 2 * ctrlY + endPos.y) / 4
        
        const label = truncateText(edge.relation, 16)
        
        ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        const textMetrics = ctx.measureText(label)
        const padding = 4
        const bgWidth = textMetrics.width + padding * 2
        const bgHeight = 14
        
        // Draw background
        ctx.fillStyle = labelBg
        roundRect(ctx, labelX - bgWidth/2, labelY - bgHeight/2, bgWidth, bgHeight, 3)
        ctx.fill()
        
        // Draw text
        ctx.fillStyle = textMuted
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, labelX, labelY)
      }
    }
  })
  
  // Draw nodes
  nodes.forEach(node => {
    const pos = positions.get(node.id)
    if (!pos) return
    
    const degree = degrees.get(node.id) || 1
    const isUserNode = node.type === 'user' || node.id === 'user'
    const radius = calculateNodeRadius(degree, maxDegree, isUserNode, 8, 24)
    const isSelected = props.selectedNodeId === node.id
    const isHovered = hoveredNodeId === node.id
    
    const color = getNodeColorHex(node.type)
    
    // Draw glow
    const gradient = ctx.createRadialGradient(pos.x, pos.y, radius * 0.5, pos.x, pos.y, radius * 2)
    gradient.addColorStop(0, color + '40')
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, radius * 2, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw node
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    
    // Draw border for selected/hovered
    if (isSelected || isHovered) {
      ctx.strokeStyle = isSelected ? '#fff' : 'rgba(255,255,255,0.5)'
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.stroke()
    }
    
    // Draw label
    const label = truncateText(node.label, degree > 3 ? 18 : 12)
    const fontSize = 11 + Math.floor((degree / maxDegree) * 3)
    
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    // Text shadow
    ctx.fillStyle = textShadow
    ctx.fillText(label, pos.x + 1, pos.y + radius + 6 + 1)
    
    // Text
    ctx.fillStyle = textColor
    ctx.fillText(label, pos.x, pos.y + radius + 6)
  })
  
  ctx.restore()
  
  animationId = requestAnimationFrame(draw)
}

function roundRect(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function screenToCanvas(screenX: number, screenY: number): Position2D {
  return {
    x: (screenX - transform.value.x) / transform.value.scale,
    y: (screenY - transform.value.y) / transform.value.scale
  }
}

function findNodeAtPosition(canvasPos: Position2D): MemoryNode | null {
  let maxDegree = 1
  degrees.forEach(d => { if (d > maxDegree) maxDegree = d })
  
  for (const node of props.graph.nodes) {
    const pos = positions.get(node.id)
    if (!pos) continue
    
    const degree = degrees.get(node.id) || 1
    const isUserNode = node.type === 'user' || node.id === 'user'
    const radius = calculateNodeRadius(degree, maxDegree, isUserNode, 8, 24)
    
    const dx = canvasPos.x - pos.x
    const dy = canvasPos.y - pos.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    if (dist <= radius) {
      return node
    }
  }
  
  return null
}

function onMouseDown(e: MouseEvent) {
  isDragging = true
  lastMousePos = { x: e.clientX, y: e.clientY }
}

function onMouseMove(e: MouseEvent) {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  if (isDragging) {
    const dx = e.clientX - lastMousePos.x
    const dy = e.clientY - lastMousePos.y
    transform.value.x += dx
    transform.value.y += dy
    lastMousePos = { x: e.clientX, y: e.clientY }
  } else {
    // Check for hover
    const canvasPos = screenToCanvas(mouseX, mouseY)
    const node = findNodeAtPosition(canvasPos)
    hoveredNodeId = node?.id || null
    
    if (canvasRef.value) {
      canvasRef.value.style.cursor = node ? 'pointer' : 'grab'
    }
  }
}

function onMouseUp() {
  isDragging = false
}

function onClick(e: MouseEvent) {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  const canvasPos = screenToCanvas(mouseX, mouseY)
  
  const node = findNodeAtPosition(canvasPos)
  emit('select-node', node)
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(0.2, Math.min(3, transform.value.scale * zoomFactor))
  
  // Zoom toward mouse position
  const scaleDiff = newScale - transform.value.scale
  transform.value.x -= mouseX * scaleDiff / transform.value.scale
  transform.value.y -= mouseY * scaleDiff / transform.value.scale
  transform.value.scale = newScale
}

function onResize() {
  initCanvas()
  calculateLayout()
}

function rebuild() {
  initCanvas()
  calculateLayout()
  
  // Center the graph
  transform.value = { x: 0, y: 0, scale: 1 }
}

onMounted(() => {
  rebuild()
  draw()
  window.addEventListener('resize', onResize)
})

watch(() => props.graph, rebuild, { deep: true })

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div ref="containerRef" class="graph-2d-container">
    <canvas
      ref="canvasRef"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @click="onClick"
      @wheel="onWheel"
    />
  </div>
</template>

<style scoped>
.graph-2d-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
  overflow: hidden;
}

.graph-2d-container canvas {
  display: block;
  cursor: grab;
}

.graph-2d-container canvas:active {
  cursor: grabbing;
}
</style>
