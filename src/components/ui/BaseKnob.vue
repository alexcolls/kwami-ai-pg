<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: number;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}>(), {
  label: 'Value',
  min: 0,
  max: 100,
  step: 1,
  disabled: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
  (e: 'change', value: number): void;
}>();

const isDragging = ref(false);
const startY = ref(0);
const startValue = ref(0);

const ledCount = 11;

const minValue = computed(() => props.min);
const maxValue = computed(() => Math.max(props.max, minValue.value + 0.000001));
const stepValue = computed(() => Math.max(props.step, 0.000001));

const range = computed(() => maxValue.value - minValue.value);

const clampedValue = computed(() => {
  return Math.min(maxValue.value, Math.max(minValue.value, props.modelValue));
});

const normalized = computed(() => {
  if (range.value <= 0) return 0;
  return (clampedValue.value - minValue.value) / range.value;
});

const rotation = computed(() => normalized.value * 270 - 135);

const activeLedCount = computed(() => Math.round(normalized.value * ledCount));

const knobStyle = computed<Record<string, string>>(() => ({
  transform: `rotate(${rotation.value}deg)`
}));

const indicatorStyle = computed<Record<string, string>>(() => ({
  '--knob-indicator-color': getInterpolatedColor(normalized.value)
}));

function getInterpolatedColor(value: number): string {
  const clamped = Math.min(1, Math.max(0, value));
  if (clamped < 0.5) {
    const t = clamped / 0.5;
    return `color-mix(in srgb, var(--accent-secondary) ${Math.round(t * 100)}%, var(--accent-primary))`;
  }
  const t = (clamped - 0.5) / 0.5;
  return `color-mix(in srgb, var(--accent-primary) ${Math.round(t * 100)}%, var(--accent-tertiary, var(--accent-primary)))`;
}

function getLedStyle(index: number): Record<string, string> {
  const ledValue = ledCount <= 1 ? 0 : index / (ledCount - 1);
  return {
    '--led-color': getInterpolatedColor(ledValue)
  };
}

function clampAndSnap(value: number): number {
  const clamped = Math.min(maxValue.value, Math.max(minValue.value, value));
  const snapped = Math.round((clamped - minValue.value) / stepValue.value) * stepValue.value + minValue.value;
  const precision = getStepPrecision(stepValue.value);
  return Number(snapped.toFixed(precision));
}

function getStepPrecision(step: number): number {
  const text = step.toString();
  const dotIndex = text.indexOf('.');
  return dotIndex === -1 ? 0 : text.length - dotIndex - 1;
}

function updateValue(value: number, emitChange = false) {
  const next = clampAndSnap(value);
  emit('update:modelValue', next);
  if (emitChange) {
    emit('change', next);
  }
}

function onPointerStart(clientY: number) {
  if (props.disabled) return;
  isDragging.value = true;
  startY.value = clientY;
  startValue.value = clampedValue.value;
}

function onPointerMove(clientY: number) {
  if (!isDragging.value || props.disabled) return;
  const deltaY = startY.value - clientY;
  const sensitivity = range.value / 200;
  updateValue(startValue.value + deltaY * sensitivity);
}

function onPointerEnd() {
  if (!isDragging.value) return;
  isDragging.value = false;
  emit('change', clampAndSnap(clampedValue.value));
}

function onMouseDown(event: MouseEvent) {
  onPointerStart(event.clientY);
}

function onTouchStart(event: TouchEvent) {
  const touch = event.touches[0];
  if (!touch) return;
  onPointerStart(touch.clientY);
  event.preventDefault();
}

function onWheel(event: WheelEvent) {
  if (props.disabled) return;
  event.preventDefault();
  const direction = event.deltaY > 0 ? -1 : 1;
  updateValue(clampedValue.value + direction * stepValue.value, true);
}

function handleDocumentMouseMove(event: MouseEvent) {
  onPointerMove(event.clientY);
}

function handleDocumentTouchMove(event: TouchEvent) {
  const touch = event.touches[0];
  if (!touch) return;
  onPointerMove(touch.clientY);
}

onMounted(() => {
  document.addEventListener('mousemove', handleDocumentMouseMove);
  document.addEventListener('mouseup', onPointerEnd);
  document.addEventListener('touchmove', handleDocumentTouchMove, { passive: false });
  document.addEventListener('touchend', onPointerEnd);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDocumentMouseMove);
  document.removeEventListener('mouseup', onPointerEnd);
  document.removeEventListener('touchmove', handleDocumentTouchMove);
  document.removeEventListener('touchend', onPointerEnd);
});
</script>

<template>
  <div class="base-knob" :class="{ disabled }">
    <div class="knob-shell">
      <div class="knob-bezel"></div>
      <div class="knob-track-ring"></div>
      <div class="knob-leds">
        <div
          v-for="ledIndex in ledCount"
          :key="ledIndex"
          class="knob-led"
          :class="{ active: ledIndex <= activeLedCount }"
          :style="getLedStyle(ledIndex - 1)"
        />
      </div>
      <div
        class="knob-body"
        :class="{ grabbing: isDragging }"
        @mousedown="onMouseDown"
        @touchstart="onTouchStart"
        @wheel="onWheel"
      >
        <div class="knob-edge"></div>
        <div class="knob-face"></div>
        <div class="knob-grooves">
          <div class="knob-groove knob-groove-1"></div>
          <div class="knob-groove knob-groove-2"></div>
          <div class="knob-groove knob-groove-3"></div>
          <div class="knob-groove knob-groove-4"></div>
        </div>
        <div class="knob-cap"></div>
        <div class="knob-needle-track" :style="knobStyle">
          <div class="knob-indicator" :style="indicatorStyle"></div>
        </div>
      </div>
    </div>
    <span v-if="label" class="knob-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.base-knob {
  --knob-base-0: color-mix(in srgb, var(--surface-1) 55%, #000);
  --knob-base-1: color-mix(in srgb, var(--surface-2) 72%, #000);
  --knob-base-2: color-mix(in srgb, var(--surface-3) 78%, #000);
  --knob-base-3: color-mix(in srgb, var(--surface-3) 58%, #000);
  --knob-highlight: color-mix(in srgb, var(--text-primary) 16%, transparent);
  --knob-shadow-strong: color-mix(in srgb, #000 62%, transparent);
  --knob-shadow-soft: color-mix(in srgb, #000 36%, transparent);
  --knob-idle-led: color-mix(in srgb, var(--text-muted) 52%, var(--surface-3));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.base-knob.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.knob-shell {
  position: relative;
  width: 132px;
  height: 132px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.knob-bezel {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(150deg, var(--knob-base-2) 0%, var(--knob-base-1) 48%, var(--knob-base-0) 100%);
  box-shadow:
    inset 0 6px 14px var(--knob-shadow-strong),
    inset 0 -1px 3px var(--knob-highlight),
    0 5px 14px var(--knob-shadow-soft);
}

.knob-track-ring {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: linear-gradient(150deg, var(--knob-base-1), var(--knob-base-0));
  box-shadow:
    inset 0 1px 1px var(--knob-highlight),
    0 2px 6px var(--knob-shadow-soft);
}

.knob-leds {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.knob-led {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  left: calc(50% - 3px);
  top: calc(50% - 3px);
  background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--knob-idle-led) 70%, var(--text-primary)), var(--knob-idle-led));
  opacity: 0.25;
  transition: opacity 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
}

.knob-led:nth-child(1) { transform: rotate(-135deg) translateY(-55px); }
.knob-led:nth-child(2) { transform: rotate(-108deg) translateY(-55px); }
.knob-led:nth-child(3) { transform: rotate(-81deg) translateY(-55px); }
.knob-led:nth-child(4) { transform: rotate(-54deg) translateY(-55px); }
.knob-led:nth-child(5) { transform: rotate(-27deg) translateY(-55px); }
.knob-led:nth-child(6) { transform: rotate(0deg) translateY(-55px); }
.knob-led:nth-child(7) { transform: rotate(27deg) translateY(-55px); }
.knob-led:nth-child(8) { transform: rotate(54deg) translateY(-55px); }
.knob-led:nth-child(9) { transform: rotate(81deg) translateY(-55px); }
.knob-led:nth-child(10) { transform: rotate(108deg) translateY(-55px); }
.knob-led:nth-child(11) { transform: rotate(135deg) translateY(-55px); }

.knob-led.active {
  background: var(--led-color, var(--accent-primary));
  opacity: 1;
  box-shadow: 0 0 8px var(--led-color, var(--accent-primary));
}

.knob-body {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  position: relative;
  z-index: 3;
  cursor: grab;
  user-select: none;
}

.knob-body.grabbing {
  cursor: grabbing;
}

.knob-body:active {
  transform: scale(0.98);
}

.knob-edge {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(155deg, var(--knob-base-3) 0%, var(--knob-base-2) 28%, var(--knob-base-1) 58%, var(--knob-base-0) 100%);
  box-shadow:
    0 7px 16px var(--knob-shadow-soft),
    inset 0 2px 4px color-mix(in srgb, var(--text-primary) 14%, transparent),
    inset 0 -5px 10px var(--knob-shadow-strong);
}

.knob-face {
  position: absolute;
  inset: 7px;
  border-radius: 50%;
  background:
    radial-gradient(ellipse 65% 45% at 35% 25%, color-mix(in srgb, var(--text-primary) 24%, transparent), transparent 50%),
    linear-gradient(160deg, var(--knob-base-3) 0%, var(--knob-base-1) 40%, var(--knob-base-0) 100%);
}

.knob-grooves {
  position: absolute;
  inset: 7px;
  border-radius: 50%;
  opacity: 1;
}

.knob-groove {
  position: absolute;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, #000 42%, var(--surface-1));
}

.knob-groove-1 { inset: 10px; }
.knob-groove-2 { inset: 16px; }
.knob-groove-3 { inset: 22px; }
.knob-groove-4 { inset: 28px; }

.knob-cap {
  position: absolute;
  inset: 22px;
  border-radius: 50%;
  background:
    radial-gradient(ellipse 80% 60% at 35% 30%, color-mix(in srgb, var(--text-primary) 22%, transparent), transparent 55%),
    linear-gradient(160deg, var(--knob-base-2) 0%, var(--knob-base-1) 45%, var(--knob-base-0) 100%);
  box-shadow:
    inset 0 1px 2px var(--knob-highlight),
    inset 0 -2px 4px var(--knob-shadow-strong),
    0 2px 6px var(--knob-shadow-soft);
}

.knob-needle-track {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  transition: transform 0.08s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 5;
  pointer-events: none;
}

.knob-indicator {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: var(--knob-indicator-color, var(--accent-primary));
  box-shadow:
    0 0 6px var(--knob-indicator-color, var(--accent-primary)),
    0 0 12px var(--knob-indicator-color, var(--accent-primary));
}

.knob-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-secondary);
}
</style>
