<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useKwami } from '@/composables/useKwami';

const { kwami, rendererType } = useKwami();

// Current rotation values (in degrees for better readability)
const rotationX = ref(0);
const rotationY = ref(0);
const rotationZ = ref(0);

// Tooltip position and visibility
const tooltipX = ref(0);
const tooltipY = ref(0);
const isVisible = ref(false);
const isDragging = ref(false);

// Animation frame ID for cleanup
let animationFrameId: number | null = null;

// Convert radians to degrees
function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// Normalize angle to 0-360 range
function normalizeAngle(degrees: number): number {
  let normalized = degrees % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

// Update rotation values from the current renderer
function updateRotation() {
  if (!kwami.value || !isVisible.value) {
    animationFrameId = requestAnimationFrame(updateRotation);
    return;
  }

  try {
    if (rendererType.value === 'blob-xyz') {
      const blob = kwami.value.avatar.getBlob();
      if (blob) {
        const mesh = blob.getMesh();
        if (mesh) {
          rotationX.value = normalizeAngle(radToDeg(mesh.rotation.x));
          rotationY.value = normalizeAngle(radToDeg(mesh.rotation.y));
          rotationZ.value = normalizeAngle(radToDeg(mesh.rotation.z));
        }
      }
    } else if (rendererType.value === 'orbital-shards') {
      const orbitalShards = (kwami.value.avatar as any).getOrbitalShards();
      if (orbitalShards) {
        const group = orbitalShards.getMesh();
        if (group) {
          rotationX.value = normalizeAngle(radToDeg(group.rotation.x));
          rotationY.value = normalizeAngle(radToDeg(group.rotation.y));
          rotationZ.value = normalizeAngle(radToDeg(group.rotation.z));
        }
      }
    }
  } catch (e) {
    // Silently handle any errors during rotation read
  }

  animationFrameId = requestAnimationFrame(updateRotation);
}

// Mouse event handlers
function onMouseDown(e: MouseEvent) {
  // Left-click drag is used for rotation (button 0)
  if (e.button === 0) {
    isDragging.value = true;
    isVisible.value = true;
    updateTooltipPosition(e);
  }
}

function onMouseMove(e: MouseEvent) {
  if (isDragging.value) {
    updateTooltipPosition(e);
  }
}

function onMouseUp(e: MouseEvent) {
  if (e.button === 0) {
    isDragging.value = false;
    // Hide after a short delay
    setTimeout(() => {
      if (!isDragging.value) {
        isVisible.value = false;
      }
    }, 500);
  }
}

function updateTooltipPosition(e: MouseEvent) {
  // Offset from cursor
  tooltipX.value = e.clientX + 16;
  tooltipY.value = e.clientY + 16;
  
  // Keep within viewport
  const tooltipWidth = 130;
  const tooltipHeight = 80;
  
  if (tooltipX.value + tooltipWidth > window.innerWidth) {
    tooltipX.value = e.clientX - tooltipWidth - 8;
  }
  if (tooltipY.value + tooltipHeight > window.innerHeight) {
    tooltipY.value = e.clientY - tooltipHeight - 8;
  }
}

onMounted(() => {
  // Start the rotation update loop
  animationFrameId = requestAnimationFrame(updateRotation);
  
  // Listen for mouse events on the canvas
  const canvas = document.getElementById('kwami-canvas');
  if (canvas) {
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', () => {
      isDragging.value = false;
      isVisible.value = false;
    });
  }
  
  // Also listen globally for mouseup in case mouse leaves canvas
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mousemove', onMouseMove);
});

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  
  const canvas = document.getElementById('kwami-canvas');
  if (canvas) {
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseup', onMouseUp);
  }
  
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('mousemove', onMouseMove);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="tooltip">
      <div 
        v-if="isVisible"
        class="rotation-tooltip"
        :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
      >
        <div class="rotation-axis">
          <span class="axis-label x">X</span>
          <span class="axis-value">{{ rotationX.toFixed(1) }}°</span>
        </div>
        <div class="rotation-axis">
          <span class="axis-label y">Y</span>
          <span class="axis-value">{{ rotationY.toFixed(1) }}°</span>
        </div>
        <div class="rotation-axis">
          <span class="axis-label z">Z</span>
          <span class="axis-value">{{ rotationZ.toFixed(1) }}°</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rotation-tooltip {
  position: fixed;
  z-index: 10000;
  background: rgba(10, 10, 26, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 8px 10px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.rotation-axis {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 0;
}

.axis-label {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  border-radius: 3px;
  text-transform: uppercase;
}

.axis-label.x {
  background: rgba(255, 0, 102, 0.25);
  color: #ff0066;
}

.axis-label.y {
  background: rgba(0, 255, 102, 0.25);
  color: #00ff66;
}

.axis-label.z {
  background: rgba(102, 0, 255, 0.25);
  color: #6600ff;
}

.axis-value {
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  min-width: 60px;
  text-align: right;
}

/* Transition */
.tooltip-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
