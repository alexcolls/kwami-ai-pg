<script setup lang="ts">
import type { MemoryNode, MemoryEdge, MemoryGraph } from './types'
import { getNodeColorHex, formatDate } from './utils'

const props = defineProps<{
  node: MemoryNode | null
  edges: MemoryEdge[]
  graph: MemoryGraph
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function getConnectedNodeLabel(nodeId: string): string {
  const node = props.graph.nodes.find(n => n.id === nodeId)
  return node?.label || nodeId
}
</script>

<template>
  <Transition name="slide">
    <div v-if="node" class="node-details-panel">
      <div class="panel-header">
        <h3 class="panel-title">Node Details</h3>
        <span 
          class="type-badge-header" 
          :style="{ background: getNodeColorHex(node.type) }"
        >
          {{ node.type }}
        </span>
        <button class="close-btn" @click="emit('close')">
          <iconify-icon icon="ph:x"></iconify-icon>
        </button>
      </div>
      
      <div class="panel-content">
        <!-- Name -->
        <div class="detail-section">
          <span class="detail-label">Name:</span>
          <span class="detail-value name-value">{{ node.label }}</span>
        </div>
        
        <!-- UUID -->
        <div v-if="node.uuid" class="detail-section">
          <span class="detail-label">UUID:</span>
          <span class="detail-value mono uuid-value">{{ node.uuid }}</span>
        </div>
        
        <!-- Created date -->
        <div v-if="node.created_at" class="detail-section">
          <span class="detail-label">Created:</span>
          <span class="detail-value">{{ formatDate(node.created_at) }}</span>
        </div>
        
        <!-- Summary -->
        <div v-if="node.summary" class="detail-section summary-section">
          <span class="detail-label">Summary:</span>
          <p class="summary-text">{{ node.summary }}</p>
        </div>
        
        <!-- Labels -->
        <div v-if="node.labels && node.labels.length > 0" class="detail-section">
          <span class="detail-label">Labels:</span>
          <div class="labels-container">
            <span 
              v-for="label in node.labels" 
              :key="label" 
              class="label-badge"
            >
              {{ label }}
            </span>
          </div>
        </div>
        
        <!-- Connections -->
        <div v-if="edges.length > 0" class="connections-section">
          <span class="section-title">
            <iconify-icon icon="ph:link"></iconify-icon>
            Connections ({{ edges.length }})
          </span>
          <div class="connections-list">
            <div 
              v-for="(edge, idx) in edges" 
              :key="idx" 
              class="connection-item"
            >
              <span class="connection-direction">
                <template v-if="edge.source === node?.id">
                  <iconify-icon icon="ph:arrow-right"></iconify-icon>
                </template>
                <template v-else>
                  <iconify-icon icon="ph:arrow-left"></iconify-icon>
                </template>
              </span>
              <span class="connection-relation">{{ edge.relation }}</span>
              <span class="connection-target">
                {{ edge.source === node?.id 
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
</template>

<style scoped>
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
  z-index: 10;
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
