<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';

export interface BackgroundRingsProps {
  /** Number of ring ellipses */
  ringCount?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Starting radius in pixels */
  baseRadius?: number;
  /** How much each subsequent ring expands relative to the maximum dimension */
  expansionFactor?: number;
  /** Maximum per-ring opacity (ring opacity decreases with ring index) */
  maxRingOpacity?: number;
  /** Palette used for interpolated ring stroke colors */
  colors?: string[];
  /** Position rings relative to the size (fraction of width/height) */
  centerOffset?: { x: number; y: number };
  /** Container z-index */
  zIndex?: string | number;
  /** Initial opacity (0-1) */
  opacity?: number;
  /** Whether to show the rings */
  visible?: boolean;
  /** Transition duration in ms */
  transitionMs?: number;
}

const props = withDefaults(defineProps<BackgroundRingsProps>(), {
  ringCount: 120,
  strokeWidth: 2,
  baseRadius: 2,
  expansionFactor: 0.007,
  maxRingOpacity: 0.3,
  colors: () => ['#359EEE', '#FFC43D', '#EF476F', '#03CEA4'],
  centerOffset: () => ({ x: 0.1, y: -0.1 }),
  zIndex: '0',
  opacity: 1,
  visible: true,
  transitionMs: 900,
});

const containerRef = ref<HTMLDivElement | null>(null);
const viewBox = ref({ width: 0, height: 0 });
const rings = ref<Array<{ cx: number; cy: number; r: number; opacity: number; color: string }>>([]);

// Color interpolation utilities
function parseHex(input: string): { r: number; g: number; b: number } | null {
  const hex = input.trim();
  if (!hex.startsWith('#')) return null;
  const raw = hex.slice(1);
  
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b };
  }
  
  if (raw.length === 6) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b };
  }
  
  return null;
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const to = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${to(rgb.r)}${to(rgb.g)}${to(rgb.b)}`;
}

function interpolatePalette(palette: string[], t: number): string {
  if (!palette.length) return '#000000';
  if (palette.length === 1) return palette[0];

  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (palette.length - 1);
  const idx = Math.floor(scaled);
  const frac = scaled - idx;

  const a = palette[idx];
  const b = palette[Math.min(idx + 1, palette.length - 1)];

  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return frac < 0.5 ? a : b;

  return rgbToHex({
    r: Math.round(ca.r + (cb.r - ca.r) * frac),
    g: Math.round(ca.g + (cb.g - ca.g) * frac),
    b: Math.round(ca.b + (cb.b - ca.b) * frac),
  });
}

function updateLayout() {
  if (!containerRef.value) return;
  
  const rect = containerRef.value.getBoundingClientRect();
  const width = Math.max(0, Math.round(rect.width));
  const height = Math.max(0, Math.round(rect.height));
  
  if (width <= 0 || height <= 0) return;
  
  viewBox.value = { width, height };
  
  // Position rings centered outside top-right
  const cx = width + width * props.centerOffset.x;
  const cy = height * props.centerOffset.y;
  
  const maxDimension = Math.max(width, height);
  const expansionPerRing = maxDimension * props.expansionFactor;
  
  const newRings = [];
  for (let i = 0; i < props.ringCount; i++) {
    const count = i + 1;
    const radius = props.baseRadius + count * expansionPerRing;
    const t = count / props.ringCount;
    
    newRings.push({
      cx,
      cy,
      r: radius,
      opacity: (1 - t) * props.maxRingOpacity,
      color: interpolatePalette(props.colors, t),
    });
  }
  
  rings.value = newRings;
}

const containerStyle = computed(() => ({
  zIndex: props.zIndex,
  opacity: props.visible ? props.opacity : 0,
  transition: `opacity ${props.transitionMs}ms ease-in-out`,
}));

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  updateLayout();
  
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });
    resizeObserver.observe(containerRef.value);
  }
  
  window.addEventListener('resize', updateLayout, { passive: true });
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  window.removeEventListener('resize', updateLayout);
});

watch(() => [props.ringCount, props.colors, props.expansionFactor, props.centerOffset], () => {
  updateLayout();
}, { deep: true });
</script>

<template>
  <div
    ref="containerRef"
    class="background-rings"
    :style="containerStyle"
  >
    <svg
      v-if="viewBox.width > 0 && viewBox.height > 0"
      :viewBox="`0 0 ${viewBox.width} ${viewBox.height}`"
      preserveAspectRatio="xMidYMid slice"
      class="rings-svg"
    >
      <ellipse
        v-for="(ring, index) in rings"
        :key="index"
        class="ring"
        :cx="ring.cx"
        :cy="ring.cy"
        :rx="ring.r"
        :ry="ring.r"
        :stroke="ring.color"
        :stroke-width="strokeWidth"
        :style="{ opacity: ring.opacity }"
        fill="none"
      />
    </svg>
  </div>
</template>

<style scoped>
.background-rings {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.rings-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.ring {
  transition: opacity 0.3s ease;
}
</style>
