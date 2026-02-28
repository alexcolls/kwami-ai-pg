<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useSearchStore, type SearchResultItem } from '@/stores/search';

const searchStore = useSearchStore();
const containerRef = ref<HTMLElement | null>(null);

const CARD_WIDTH = 280;
const CARD_IMAGE_HEIGHT = 140;
const DECK_OFFSET = 14;
const STAGGER_MS = 90;

// Dragged position per card index (when user has moved a card). Undefined = use deck position.
const cardPositions = ref<Record<number, { x: number; y: number }>>({});
let dragIndex = -1;
let dragStartX = 0;
let dragStartY = 0;
let cardStartX = 0;
let cardStartY = 0;
let didDrag = false;

function faviconForUrl(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  } catch {
    return '';
  }
}

function placeholderGradient(index: number): string {
  const hues = [200, 260, 320, 40, 160];
  const h = hues[index % hues.length];
  return `linear-gradient(135deg, hsl(${h}, 50%, 35%), hsl(${h}, 55%, 20%))`;
}

const results = computed(() => searchStore.results);
const batchId = computed(() => searchStore.resultsBatchId);
const imageError = ref<Record<number, boolean>>({});
function setImageError(index: number) {
  imageError.value = { ...imageError.value, [index]: true };
}
function imageBg(index: number, r: SearchResultItem) {
  if (imageError.value[index] || !r.image) return placeholderGradient(index);
  return 'transparent';
}

watch(batchId, () => {
  imageError.value = {};
  cardPositions.value = {};
});

function getDeckBase(): { x: number; y: number } {
  const el = containerRef.value;
  if (!el) return { x: 50, y: 50 };
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width * 0.5 - CARD_WIDTH * 0.5,
    y: rect.top + rect.height * 0.6 - CARD_IMAGE_HEIGHT * 0.5,
  };
}

function getCardPosition(index: number): { x: number; y: number } {
  const custom = cardPositions.value[index];
  if (custom) return custom;
  const base = getDeckBase();
  return {
    x: base.x + index * DECK_OFFSET,
    y: base.y + index * DECK_OFFSET,
  };
}

function onPointerDown(e: PointerEvent, index: number) {
  if (dragIndex !== -1) return;
  e.preventDefault();
  dragIndex = index;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  const pos = getCardPosition(index);
  cardStartX = pos.x;
  cardStartY = pos.y;
  didDrag = false;
  (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
}

function onPointerMove(e: PointerEvent, index: number) {
  if (dragIndex !== index) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag = true;
  const newX = cardStartX + dx;
  const newY = cardStartY + dy;
  cardPositions.value = {
    ...cardPositions.value,
    [index]: { x: newX, y: newY },
  };
}

function onPointerUp(e: PointerEvent, index: number) {
  if (dragIndex !== index) return;
  (e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId);
  dragIndex = -1;
}

function onCardClick(e: MouseEvent, index: number, url: string) {
  if (didDrag) {
    e.preventDefault();
    return;
  }
  // Allow default (open link)
}

function onPointerMoveGlobal(e: PointerEvent) {
  if (dragIndex >= 0) onPointerMove(e, dragIndex);
}
function onPointerUpGlobal() {
  if (dragIndex >= 0) {
    onPointerUp({ clientX: 0, clientY: 0 } as PointerEvent, dragIndex);
    dragIndex = -1;
  }
}

onMounted(() => {
  window.addEventListener('pointermove', onPointerMoveGlobal);
  window.addEventListener('pointerup', onPointerUpGlobal);
  window.addEventListener('pointerleave', onPointerUpGlobal);
});
onUnmounted(() => {
  window.removeEventListener('pointermove', onPointerMoveGlobal);
  window.removeEventListener('pointerup', onPointerUpGlobal);
  window.removeEventListener('pointerleave', onPointerUpGlobal);
});
</script>

<template>
  <div
    v-if="searchStore.hasSearchData && !searchStore.error && results.length > 0"
    ref="containerRef"
    class="deck-container"
    aria-label="Web search results"
  >
    <button
      type="button"
      class="deck-close"
      aria-label="Close search results"
      @click="searchStore.clear"
    >
      <iconify-icon icon="ph:x" />
    </button>

    <a
      v-for="(r, i) in results"
      :key="`${batchId}-${i}`"
      :href="r.url"
      target="_blank"
      rel="noopener noreferrer"
      class="deck-card"
      :style="{
        width: `${CARD_WIDTH}px`,
        left: `${getCardPosition(i).x}px`,
        top: `${getCardPosition(i).y}px`,
        zIndex: 100 + i,
        transitionDelay: `${i * STAGGER_MS}ms`,
      }"
      @pointerdown.prevent="onPointerDown($event, i)"
      @pointermove="onPointerMove($event, i)"
      @pointerup="onPointerUp($event, i)"
      @pointerleave="onPointerUp($event, i)"
      @click="onCardClick($event, i, r.url)"
    >
      <div class="deck-card-image" :style="{ background: imageBg(i, r) }">
        <img
          v-if="r.image && !imageError[i]"
          :src="r.image"
          :alt="r.title"
          class="deck-card-img"
          loading="lazy"
          referrerpolicy="no-referrer"
          @error="setImageError(i)"
        />
        <img
          v-else-if="faviconForUrl(r.url)"
          :src="faviconForUrl(r.url)"
          alt=""
          class="deck-card-favicon"
          loading="lazy"
        />
        <iconify-icon v-else icon="ph:image-duotone" class="deck-card-icon" />
      </div>
      <div class="deck-card-body">
        <span class="deck-card-title">{{ (r.title || '').slice(0, 60) }}{{ (r.title || '').length > 60 ? '…' : '' }}</span>
        <p v-if="r.content" class="deck-card-desc">
          {{ (r.content || '').slice(0, 72) }}{{ (r.content || '').length > 72 ? '…' : '' }}
        </p>
        <div v-if="r.features && r.features.length" class="deck-card-features">
          <span
            v-for="(f, j) in (r.features || []).slice(0, 3)"
            :key="j"
            class="deck-card-tag"
          >
            {{ (f || '').slice(0, 20) }}{{ (f || '').length > 20 ? '…' : '' }}
          </span>
        </div>
        <span class="deck-card-open">
          <iconify-icon icon="ph:arrow-square-out" />
          Open
        </span>
      </div>
    </a>
  </div>
</template>

<style scoped>
.deck-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.deck-close {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 200;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  pointer-events: auto;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: background 0.2s, transform 0.2s;
}
.deck-close:hover {
  background: rgba(255, 255, 255, 0.14);
  transform: scale(1.05);
}

.deck-card {
  position: fixed;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow 0.25s ease,
    transform 0.25s ease,
    opacity 0.4s ease,
    left 0.15s ease,
    top 0.15s ease;
  animation: deckCardEnter 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
  cursor: grab;
}
.deck-card:active {
  cursor: grabbing;
}
.deck-card:hover {
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    0 0 40px rgba(0, 217, 255, 0.08);
}

@keyframes deckCardEnter {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.deck-card-image {
  width: 100%;
  height: 140px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deck-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.deck-card-favicon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  opacity: 0.7;
}

.deck-card-icon {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.25);
}

.deck-card-body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.deck-card-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.deck-card-desc {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.55);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.deck-card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.deck-card-tag {
  font-size: 0.65rem;
  padding: 3px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.75);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deck-card-open {
  margin-top: 4px;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.deck-card-open iconify-icon {
  font-size: 0.9rem;
}
</style>
