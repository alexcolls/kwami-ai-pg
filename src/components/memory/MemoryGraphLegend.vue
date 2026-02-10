<script setup lang="ts">
import type { MemoryNode, ViewMode } from './types'
import { getNodeColorHex } from './utils'

defineProps<{
  nodes: MemoryNode[]
  viewMode: ViewMode
}>()

const uniqueTypes = (nodes: MemoryNode[]) => {
  return [...new Set(nodes.map(n => n.type))]
}
</script>

<template>
  <div class="type-legend" v-if="nodes.length > 0">
    <span class="legend-label">Entity Types</span>
    <div class="legend-items">
      <span 
        v-for="type in uniqueTypes(nodes)" 
        :key="type"
        class="legend-item"
      >
        <span class="legend-dot" :style="{ background: getNodeColorHex(type) }"></span>
        {{ type }}
      </span>
    </div>
    <span class="legend-hint">
      <template v-if="viewMode === '3d'">
        <iconify-icon icon="ph:hand-grabbing"></iconify-icon>
        Drag to rotate • Scroll to zoom • Right click to move • Click nodes for details
      </template>
      <template v-else>
        <iconify-icon icon="ph:cursor-click"></iconify-icon>
        Click and drag to pan • Scroll to zoom • Click nodes for details
      </template>
    </span>
  </div>
</template>

<style scoped>
.type-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--surface-1);
  border-radius: var(--radius-sm);
  flex-wrap: wrap;
}

.legend-label {
  font-size: 11px;
  color: var(--accent-secondary);
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
  color: var(--text-secondary);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-hint {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
