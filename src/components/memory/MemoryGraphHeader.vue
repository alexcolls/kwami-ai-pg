<script setup lang="ts">
import type { ViewMode } from './types'

const props = defineProps<{
  searchQuery: string
  filterType: string
  entityTypes: string[]
  showEdgeLabels: boolean
  viewMode: ViewMode
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:filterType', value: string): void
  (e: 'update:showEdgeLabels', value: boolean): void
  (e: 'update:viewMode', value: ViewMode): void
  (e: 'refresh'): void
}>()
</script>

<template>
  <div class="graph-header">
    <div class="search-box">
      <iconify-icon icon="ph:magnifying-glass"></iconify-icon>
      <input 
        :value="searchQuery"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text" 
        placeholder="Search graph.."
        class="search-input"
      />
    </div>
    
    <select 
      :value="filterType" 
      @change="emit('update:filterType', ($event.target as HTMLSelectElement).value)"
      class="type-filter"
    >
      <option v-for="t in entityTypes" :key="t" :value="t">
        {{ t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) }}
      </option>
    </select>
    
    <!-- View Mode Toggle -->
    <div class="view-toggle">
      <button 
        class="view-btn"
        :class="{ active: viewMode === '3d' }"
        @click="emit('update:viewMode', '3d')"
        title="3D View"
      >
        <iconify-icon icon="ph:cube"></iconify-icon>
        3D
      </button>
      <button 
        class="view-btn"
        :class="{ active: viewMode === '2d' }"
        @click="emit('update:viewMode', '2d')"
        title="2D View"
      >
        <iconify-icon icon="ph:graph"></iconify-icon>
        2D
      </button>
    </div>
    
    <button 
      class="toggle-btn" 
      :class="{ active: showEdgeLabels }"
      @click="emit('update:showEdgeLabels', !showEdgeLabels)"
      title="Toggle edge labels"
    >
      <iconify-icon icon="ph:text-aa"></iconify-icon>
    </button>
    
    <button class="refresh-btn" @click="emit('refresh')" :disabled="loading">
      <iconify-icon 
        :icon="loading ? 'ph:spinner-gap' : 'ph:arrows-clockwise'" 
        :class="{ spin: loading }"
      />
    </button>
  </div>
</template>

<style scoped>
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

.view-toggle {
  display: flex;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  color: #94a3b8;
  background: rgba(255,255,255,0.05);
}

.view-btn.active {
  color: #42a5f5;
  background: rgba(66, 165, 245, 0.15);
}

.view-btn:first-child {
  border-right: 1px solid rgba(255,255,255,0.1);
}

.refresh-btn,
.toggle-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover,
.toggle-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-btn.active {
  background: rgba(66, 165, 245, 0.2);
  border-color: rgba(66, 165, 245, 0.4);
  color: #42a5f5;
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
