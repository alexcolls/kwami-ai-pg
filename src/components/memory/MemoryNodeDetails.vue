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
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--glass-shadow);
  z-index: 10;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-highlight);
}

.panel-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.type-badge-header {
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  text-transform: capitalize;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
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
  color: var(--text-muted);
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  color: var(--text-primary);
}

.detail-value.name-value {
  font-size: 15px;
  font-weight: 500;
}

.detail-value.mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-secondary);
}

.detail-value.uuid-value {
  word-break: break-all;
  line-height: 1.4;
}

.summary-section {
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

.summary-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 6px 0 0 0;
  padding: 12px;
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-primary);
}

.labels-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.label-badge {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  background: var(--surface-2);
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

.connections-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--accent-secondary);
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
  background: var(--surface-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.connection-direction {
  color: var(--text-muted);
  font-size: 14px;
}

.connection-relation {
  font-size: 11px;
  color: var(--accent-primary);
  background: var(--accent-glow);
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.connection-target {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
  text-align: right;
}

.no-connections {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all var(--duration-normal) ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
