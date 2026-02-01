<script setup lang="ts">
import { computed } from 'vue';

export interface KwamiLogoProps {
  /** Custom CSS class for the SVG */
  className?: string;
  /** Unique gradient ID (useful when multiple logos on page) */
  gradientId?: string;
  /** Stroke width for the logo paths */
  strokeWidth?: number;
  /** Width of the logo (height auto-calculated from aspect ratio) */
  width?: string | number;
  /** Height of the logo (width auto-calculated from aspect ratio) */
  height?: string | number;
  /** Whether to animate the gradient */
  animated?: boolean;
  /** Animation duration in seconds */
  animationDuration?: number;
}

const props = withDefaults(defineProps<KwamiLogoProps>(), {
  gradientId: 'kwami-logo-grad',
  strokeWidth: 4,
  animated: false,
  animationDuration: 3,
});

// Gradient colors for the logo
const gradientStops = [
  { offset: '0%', color: '#EF476F' },
  { offset: '25%', color: '#359EEE' },
  { offset: '50%', color: '#03CEA4' },
  { offset: '75%', color: '#FFC43D' },
  { offset: '100%', color: '#EF476F' },
];

// The KWAMI wordmark path
const wordmarkPath = 'M 224.8 70 L 224.8 67.1 L 264.2 67.1 L 264.2 7.2 L 241.7 55.4 L 219.2 7.1 L 219.2 70.1 L 216.2 70 L 216.2 0 L 219.2 0 L 241.7 48.3 L 264.2 0.1 L 267.2 0 L 267.2 70.1 L 224.8 70 Z M 133.7 3.1 L 71.1 3.1 L 71.1 0.1 L 138 0.1 L 112.5 70.2 L 99.5 34.6 L 86.6 70.2 L 61.1 0.1 L 64.3 0.1 L 86.6 61.4 L 99.5 25.8 L 112.5 61.4 L 133.7 3.1 Z M 157.4 70.1 L 157.4 67.1 L 194.2 67.1 L 173 8.8 L 150.7 70.1 L 147.5 70.1 L 173 0 L 198.5 70.1 L 157.4 70.1 Z M 45.8 0.1 L 50.1 0.1 L 16.5 33.5 L 53.3 70.1 L 49 70.1 L 12.2 33.5 L 45.8 0.1 Z M 0 0.1 L 3 0.1 L 3 70.1 L 0 70.1 L 0 0.1 Z M 296 0.1 L 296 70.1 L 293 70.1 L 293 0.1 L 296 0.1 Z';

const svgStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  return style;
});

const uniqueGradientId = computed(() => `${props.gradientId}-${Math.random().toString(36).slice(2, 8)}`);
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 296 70.2"
    preserveAspectRatio="xMinYMid meet"
    :class="['kwami-logo', className, { animated }]"
    :style="svgStyle"
  >
    <defs>
      <linearGradient
        :id="uniqueGradientId"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
      >
        <stop
          v-for="(stop, index) in gradientStops"
          :key="index"
          :offset="stop.offset"
          :stop-color="stop.color"
          stop-opacity="1"
        />
      </linearGradient>
    </defs>
    
    <path
      opacity="0.95"
      :d="wordmarkPath"
      :stroke="`url(#${uniqueGradientId})`"
      stroke-linecap="round"
      stroke-linejoin="round"
      :stroke-width="strokeWidth"
      fill="none"
      class="logo-path"
    />
  </svg>
</template>

<style scoped>
.kwami-logo {
  display: block;
}

.kwami-logo.animated .logo-path {
  animation: gradientShift v-bind('`${animationDuration}s`') linear infinite;
}

@keyframes gradientShift {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 1000;
  }
}
</style>
