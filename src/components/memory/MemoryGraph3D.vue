<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { MemoryNode, MemoryEdge, MemoryGraph } from './types'
import { getNodeColor, calculateDegrees, findCentralNode, calculateNodeRadius, truncateText } from './utils'

const props = defineProps<{
  graph: MemoryGraph
  showEdgeLabels: boolean
  selectedNodeId: string | null
}>()

const emit = defineEmits<{
  (e: 'select-node', node: MemoryNode | null): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number
let nodeObjects: Map<string, THREE.Mesh> = new Map()
let edgeObjects: THREE.Line[] = []
let labelSprites: Map<string, THREE.Sprite> = new Map()
let edgeLabelSprites: THREE.Sprite[] = []
let positions3D: Map<string, THREE.Vector3> = new Map()
let nodeDegrees: Map<string, number> = new Map()
let raycaster: THREE.Raycaster
let mouse: THREE.Vector2

function initScene() {
  if (!containerRef.value) return
  
  cleanup()
  
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight || 500

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0e14)

  camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 2000)
  camera.position.set(0, 50, 280)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  containerRef.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 50
  controls.maxDistance = 800

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 1)
  pointLight.position.set(100, 100, 100)
  scene.add(pointLight)

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  renderer.domElement.addEventListener('click', onMouseClick)
  renderer.domElement.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onWindowResize)

  animate()
}

function init3DLayout() {
  const nodes = props.graph.nodes
  const edges = props.graph.edges
  
  positions3D.clear()
  nodeDegrees = calculateDegrees(nodes, edges)
  const centralNodeId = findCentralNode(nodeDegrees)
  
  const connectedToCentral = new Set<string>()
  edges.forEach(edge => {
    if (edge.source === centralNodeId) connectedToCentral.add(edge.target)
    if (edge.target === centralNodeId) connectedToCentral.add(edge.source)
  })
  
  const directRadius = 120
  const indirectRadius = 220
  let directAngle = 0
  let indirectAngle = 0
  const directAngleStep = (2 * Math.PI) / Math.max(connectedToCentral.size, 1)
  const indirectNodes = nodes.filter(n => n.id !== centralNodeId && !connectedToCentral.has(n.id))
  const indirectAngleStep = (2 * Math.PI) / Math.max(indirectNodes.length, 1)
  
  nodes.forEach(node => {
    if (node.id === centralNodeId) {
      positions3D.set(node.id, new THREE.Vector3(0, 0, 0))
    } else if (connectedToCentral.has(node.id)) {
      const phi = directAngle
      const theta = Math.PI / 2 + (Math.random() - 0.5) * 0.8
      positions3D.set(node.id, new THREE.Vector3(
        directRadius * Math.sin(theta) * Math.cos(phi),
        directRadius * Math.cos(theta),
        directRadius * Math.sin(theta) * Math.sin(phi)
      ))
      directAngle += directAngleStep
    } else {
      const phi = indirectAngle + Math.PI / 4
      const theta = Math.PI / 2 + (Math.random() - 0.5) * 1.2
      positions3D.set(node.id, new THREE.Vector3(
        indirectRadius * Math.sin(theta) * Math.cos(phi),
        indirectRadius * Math.cos(theta),
        indirectRadius * Math.sin(theta) * Math.sin(phi)
      ))
      indirectAngle += indirectAngleStep
    }
  })
  
  // Force-directed layout
  const iterations = 300
  const k = 0.15
  const baseRepulsion = 15000
  const minDistance = 50
  
  for (let i = 0; i < iterations; i++) {
    const cooling = 1 - (i / iterations) * 0.7
    
    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const nodeA = nodes[a]
        const nodeB = nodes[b]
        if (!nodeA || !nodeB) continue
        
        const posA = positions3D.get(nodeA.id)!
        const posB = positions3D.get(nodeB.id)!
        
        const delta = new THREE.Vector3().subVectors(posA, posB)
        const dist = delta.length() || 1
        
        const degreeA = nodeDegrees.get(nodeA.id) || 1
        const degreeB = nodeDegrees.get(nodeB.id) || 1
        const degreeFactor = Math.sqrt(degreeA * degreeB) / 2 + 1
        
        const repulsion = baseRepulsion * degreeFactor
        let force = (repulsion / (dist * dist)) * cooling
        
        if (dist < minDistance) {
          force += (minDistance - dist) * 2 * cooling
        }
        
        delta.normalize().multiplyScalar(force)
        
        const isCentralA = nodeA.id === centralNodeId
        const isCentralB = nodeB.id === centralNodeId
        
        if (!isCentralA) posA.add(delta)
        if (!isCentralB) posB.sub(delta)
      }
    }
    
    edges.forEach(edge => {
      const posA = positions3D.get(edge.source)
      const posB = positions3D.get(edge.target)
      
      if (posA && posB) {
        const delta = new THREE.Vector3().subVectors(posB, posA)
        const dist = delta.length() || 1
        
        const degreeA = nodeDegrees.get(edge.source) || 1
        const degreeB = nodeDegrees.get(edge.target) || 1
        const targetLength = 60 + Math.max(degreeA, degreeB) * 8
        
        const force = (dist - targetLength) * k * cooling
        delta.normalize().multiplyScalar(force)
        
        if (edge.source !== centralNodeId) posA.add(delta)
        if (edge.target !== centralNodeId) posB.sub(delta)
      }
    })
    
    if (i % 10 === 0) {
      const centerOfMass = new THREE.Vector3()
      let count = 0
      positions3D.forEach((pos, id) => {
        if (id !== centralNodeId) {
          centerOfMass.add(pos)
          count++
        }
      })
      if (count > 0) {
        centerOfMass.divideScalar(count)
        positions3D.forEach((pos, id) => {
          if (id !== centralNodeId) {
            pos.sub(centerOfMass.clone().multiplyScalar(0.1))
          }
        })
      }
    }
  }
}

function buildGraphObjects() {
  if (!scene) return
  
  nodeObjects.forEach(obj => scene.remove(obj))
  edgeObjects.forEach(obj => scene.remove(obj))
  labelSprites.forEach(sprite => scene.remove(sprite))
  edgeLabelSprites.forEach(sprite => scene.remove(sprite))
  nodeObjects.clear()
  edgeObjects = []
  labelSprites.clear()
  edgeLabelSprites = []
  
  const nodes = props.graph.nodes
  const edges = props.graph.edges
  
  let maxDegree = 1
  nodeDegrees.forEach(degree => {
    if (degree > maxDegree) maxDegree = degree
  })
  
  const edgeLabelPositions: THREE.Vector3[] = []
  
  edges.forEach((edge, index) => {
    const startPos = positions3D.get(edge.source)
    const endPos = positions3D.get(edge.target)
    
    if (startPos && endPos) {
      const direction = new THREE.Vector3().subVectors(endPos, startPos)
      const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5)
      
      const perpendicular = new THREE.Vector3()
        .crossVectors(direction.normalize(), new THREE.Vector3(0, 1, 0))
      
      if (perpendicular.length() < 0.1) {
        perpendicular.crossVectors(direction, new THREE.Vector3(1, 0, 0))
      }
      
      perpendicular.normalize()
      const curveAmount = 8 + (index % 5) * 3
      midPoint.add(perpendicular.multiplyScalar(curveAmount))
      
      const curve = new THREE.QuadraticBezierCurve3(startPos.clone(), midPoint, endPos.clone())
      const points = curve.getPoints(20)
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ 
        color: 0x3d4a5c, 
        opacity: 0.5,
        transparent: true,
      })
      
      const line = new THREE.Line(geometry, material)
      scene.add(line)
      edgeObjects.push(line)
      
      const labelPos = curve.getPoint(0.5).clone()
      
      let offset = new THREE.Vector3(0, 0, 0)
      const labelSpacing = 15
      for (const existingPos of edgeLabelPositions) {
        const dist = labelPos.distanceTo(existingPos)
        if (dist < labelSpacing) {
          const pushDir = new THREE.Vector3().subVectors(labelPos, existingPos).normalize()
          offset.add(pushDir.multiplyScalar(labelSpacing - dist + 5))
        }
      }
      labelPos.add(offset)
      edgeLabelPositions.push(labelPos.clone())
      
      const relationLabel = truncateText(edge.relation, 20)
      const labelSprite = createTextSprite(relationLabel, 0x8fa4bd, 0.7, 8, true)
      labelSprite.position.copy(labelPos)
      scene.add(labelSprite)
      edgeLabelSprites.push(labelSprite)
    }
  })
  
  nodes.forEach(node => {
    const pos = positions3D.get(node.id)
    if (!pos) return
    
    const degree = nodeDegrees.get(node.id) || 1
    const isUserNode = node.type === 'user' || node.id === 'user'
    const radius = calculateNodeRadius(degree, maxDegree, isUserNode)
    const degreeScale = Math.min(degree / maxDegree, 1)
    
    const color = getNodeColor(node.type)
    
    const geometry = new THREE.SphereGeometry(radius, 32, 32)
    const material = new THREE.MeshPhongMaterial({ 
      color,
      emissive: color,
      emissiveIntensity: props.selectedNodeId === node.id ? 0.8 : 0.3,
      shininess: 50
    })
    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.copy(pos)
    ;(sphere as any).nodeData = node
    ;(sphere as any).nodeRadius = radius
    scene.add(sphere)
    nodeObjects.set(node.id, sphere)
    
    const glowGeometry = new THREE.SphereGeometry(radius * 1.4, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.12 + degreeScale * 0.08
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    glow.position.copy(pos)
    scene.add(glow)
    
    const maxLabelLength = degree > 3 ? 20 : 14
    const label = truncateText(node.label, maxLabelLength)
    const fontSize = 10 + Math.floor(degreeScale * 4)
    const labelSprite = createTextSprite(label, 0xe2e8f0, 1, fontSize)
    labelSprite.position.copy(pos)
    labelSprite.position.y -= radius + 10 + radius * 0.3
    scene.add(labelSprite)
    labelSprites.set(node.id, labelSprite)
  })
  
  updateEdgeLabelVisibility()
}

function createTextSprite(
  text: string, 
  color: number, 
  opacity: number = 1, 
  fontSize: number = 14,
  isEdgeLabel: boolean = false
): THREE.Sprite {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  
  const scale = 2
  canvas.width = 512 * scale
  canvas.height = 64 * scale
  
  const actualFontSize = fontSize * 3 * scale
  
  context.font = `${isEdgeLabel ? '500' : 'bold'} ${actualFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  
  const metrics = context.measureText(text)
  const textWidth = metrics.width
  const textHeight = actualFontSize
  
  context.clearRect(0, 0, canvas.width, canvas.height)
  
  if (isEdgeLabel) {
    const padding = 12 * scale
    const bgWidth = textWidth + padding * 2
    const bgHeight = textHeight + padding
    const bgX = (canvas.width - bgWidth) / 2
    const bgY = (canvas.height - bgHeight) / 2
    const radius = 6 * scale
    
    context.fillStyle = 'rgba(13, 17, 23, 0.85)'
    context.beginPath()
    if (context.roundRect) {
      context.roundRect(bgX, bgY, bgWidth, bgHeight, radius)
    } else {
      context.moveTo(bgX + radius, bgY)
      context.lineTo(bgX + bgWidth - radius, bgY)
      context.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius)
      context.lineTo(bgX + bgWidth, bgY + bgHeight - radius)
      context.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight)
      context.lineTo(bgX + radius, bgY + bgHeight)
      context.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius)
      context.lineTo(bgX, bgY + radius)
      context.quadraticCurveTo(bgX, bgY, bgX + radius, bgY)
      context.closePath()
    }
    context.fill()
  }
  
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  
  context.shadowColor = 'rgba(0, 0, 0, 0.9)'
  context.shadowBlur = 6 * scale
  context.shadowOffsetX = 1 * scale
  context.shadowOffsetY = 1 * scale
  
  context.fillStyle = `#${color.toString(16).padStart(6, '0')}`
  context.fillText(text, canvas.width / 2, canvas.height / 2)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  
  const material = new THREE.SpriteMaterial({ 
    map: texture, 
    transparent: true,
    opacity,
    depthTest: false,
    sizeAttenuation: true
  })
  
  const sprite = new THREE.Sprite(material)
  
  const baseScale = isEdgeLabel ? 35 : 45
  const aspectRatio = canvas.width / canvas.height
  sprite.scale.set(baseScale * aspectRatio * 0.5, baseScale * 0.5, 1)
  
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
      emit('select-node', nodeData)
      
      nodeObjects.forEach((mesh, id) => {
        const mat = mesh.material as THREE.MeshPhongMaterial
        mat.emissiveIntensity = id === nodeData.id ? 0.8 : 0.3
      })
    }
  } else {
    emit('select-node', null)
    
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

function updateEdgeLabelVisibility() {
  if (!camera || !edgeLabelSprites.length) return
  
  const cameraDistance = camera.position.length()
  const fadeStart = 350
  const fadeEnd = 500
  
  edgeLabelSprites.forEach(sprite => {
    if (props.showEdgeLabels && cameraDistance < fadeEnd) {
      const opacity = cameraDistance < fadeStart 
        ? 0.6 
        : 0.6 * (1 - (cameraDistance - fadeStart) / (fadeEnd - fadeStart))
      ;(sprite.material as THREE.SpriteMaterial).opacity = Math.max(0, opacity)
      sprite.visible = opacity > 0.05
    } else {
      sprite.visible = false
    }
  })
}

function animate() {
  animationId = requestAnimationFrame(animate)
  
  if (controls) controls.update()
  updateEdgeLabelVisibility()
  
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function cleanup() {
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.domElement.removeEventListener('click', onMouseClick)
    renderer.domElement.removeEventListener('mousemove', onMouseMove)
    renderer.dispose()
    if (renderer.domElement.parentNode === containerRef.value) {
      containerRef.value?.removeChild(renderer.domElement)
    }
  }
  window.removeEventListener('resize', onWindowResize)
  nodeObjects.clear()
  labelSprites.clear()
  edgeObjects = []
  edgeLabelSprites = []
}

function rebuild() {
  if (props.graph.nodes.length > 0) {
    initScene()
    init3DLayout()
    buildGraphObjects()
  }
}

onMounted(rebuild)

watch(() => props.graph, rebuild, { deep: true })

watch(() => props.showEdgeLabels, updateEdgeLabelVisibility)

watch(() => props.selectedNodeId, (newId) => {
  nodeObjects.forEach((mesh, id) => {
    const mat = mesh.material as THREE.MeshPhongMaterial
    mat.emissiveIntensity = id === newId ? 0.8 : 0.3
  })
})

onUnmounted(cleanup)
</script>

<template>
  <div ref="containerRef" class="graph-3d-container"></div>
</template>

<style scoped>
.graph-3d-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
