<script setup lang="ts">
import { useSearchResults } from '@/composables/useSearchResults';

const {
  query,
  results,
  answer,
  error,
  clear,
  hasSearchData,
} = useSearchResults();
</script>

<template>
  <Teleport to="body">
    <Transition name="card-pop">
      <div
        v-if="hasSearchData || error"
        class="search-card"
        role="region"
        aria-label="Web search results"
      >
      <div class="search-card-glow" aria-hidden="true" />
      <div class="search-card-inner">
        <header class="search-card-header">
          <span class="search-card-badge">
            <iconify-icon icon="ph:magnifying-glass-duotone" />
            <span>Web search</span>
          </span>
          <button
            type="button"
            class="search-card-close"
            @click="clear"
            title="Close"
            aria-label="Close search results"
          >
            <iconify-icon icon="ph:x" />
          </button>
        </header>

        <div v-if="error" class="search-card-error">
          {{ error }}
        </div>

        <template v-else>
          <p v-if="query" class="search-card-query">
            “{{ query }}”
          </p>
          <p v-if="answer" class="search-card-answer">
            {{ answer }}
          </p>
          <ul v-if="results.length" class="search-card-list">
            <li
              v-for="(r, i) in results"
              :key="i"
              class="search-card-item"
            >
              <a
                :href="r.url"
                target="_blank"
                rel="noopener noreferrer"
                class="search-card-link"
              >
                <span class="search-card-link-title">{{ r.title }}</span>
                <span class="search-card-link-snippet">{{
                  (r.content || '').slice(0, 120)
                }}{{ (r.content || '').length > 120 ? '…' : '' }}</span>
              </a>
            </li>
          </ul>
        </template>
      </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-card {
  position: fixed;
  left: 50%;
  bottom: 18%;
  transform: translateX(-50%);
  z-index: 9999;
  width: min(420px, calc(100vw - 32px));
  max-height: min(55vh, 420px);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  isolation: isolate;
}

.search-card-glow {
  position: absolute;
  inset: -1px;
  border-radius: var(--radius-lg);
  background: linear-gradient(
    135deg,
    rgba(0, 217, 255, 0.12) 0%,
    rgba(168, 85, 247, 0.06) 100%
  );
  filter: blur(12px);
  opacity: 0.8;
  z-index: -1;
}

.search-card-inner {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow:
    var(--glass-shadow),
    0 0 0 1px rgba(0, 217, 255, 0.08),
    0 0 24px rgba(0, 217, 255, 0.06);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: inherit;
}

.search-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.search-card-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.search-card-badge iconify-icon {
  font-size: 1.1rem;
}

.search-card-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
}

.search-card-close:hover {
  color: var(--text-primary);
  background: var(--surface-3);
}

.search-card-close iconify-icon {
  font-size: 1.1rem;
}

.search-card-query {
  padding: var(--space-md) var(--space-lg) 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-style: italic;
}

.search-card-answer {
  padding: var(--space-sm) var(--space-lg) var(--space-md);
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-primary);
}

.search-card-list {
  list-style: none;
  padding: 0 var(--space-lg) var(--space-lg);
  margin: 0;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.search-card-item {
  margin-bottom: var(--space-sm);
}

.search-card-item:last-child {
  margin-bottom: 0;
}

.search-card-link {
  display: block;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  border: 1px solid transparent;
  text-decoration: none;
  color: inherit;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.search-card-link:hover {
  background: var(--surface-2);
  border-color: rgba(0, 217, 255, 0.2);
  box-shadow: 0 0 12px rgba(0, 217, 255, 0.08);
}

.search-card-link-title {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--accent-primary);
  margin-bottom: 2px;
}

.search-card-link-snippet {
  display: block;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--text-secondary);
}

.search-card-error {
  padding: var(--space-lg);
  font-size: 0.9rem;
  color: var(--error);
}

/* Enter/leave animation */
.card-pop-enter-active,
.card-pop-leave-active {
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

.card-pop-enter-from,
.card-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

.card-pop-enter-to,
.card-pop-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
