<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useKwami } from '@/composables/useKwami';
import { useAuthStore } from '@/stores/auth';
import { useWorkspaceStore } from '@/stores/workspace';
import { useKwamiConfigSync } from '@/composables/useKwamiConfigSync';
import { useToast } from 'vue-toastification';
import RecordControl from './RecordControl.vue';

const { isConnected, connect, disconnect } = useKwami();
const authStore = useAuthStore();
const workspaceStore = useWorkspaceStore();
const { saveCurrentConfig, revertCurrentConfig } = useKwamiConfigSync();
const toast = useToast();
const { t } = useI18n();

// Loading state
const isLoading = ref(false);
const isSavingConfig = ref(false);
const saveActionsOpen = ref(false);

// Session duration
const sessionStartTime = ref<number | null>(null);
const sessionDuration = ref('0:00');
let durationInterval: ReturnType<typeof setInterval> | null = null;

// Computed
const buttonIcon = computed(() => {
  if (isLoading.value) return 'ph:circle-notch-bold';
  return isConnected.value ? 'ph:stop-fill' : 'ph:play-fill';
});

const buttonTitle = computed(() => {
  if (isLoading.value) return t('controlBar.connecting');
  return isConnected.value ? t('controlBar.endConversation') : t('controlBar.startConversation');
});

const hasUnsavedChanges = computed(() => workspaceStore.hasActiveUnsavedConfig);
const saveButtonTitle = computed(() => {
  if (!authStore.userId) return t('controlBar.saveLocally');
  return t('controlBar.reviewUnsaved');
});

// Actions
function updateDuration() {
  if (!sessionStartTime.value) return;
  const elapsed = Math.floor((Date.now() - sessionStartTime.value) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  sessionDuration.value = `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function handleToggle() {
  if (isLoading.value) return;
  
  isLoading.value = true;
  try {
    if (isConnected.value) {
      await disconnect();
      if (durationInterval) {
        clearInterval(durationInterval);
        durationInterval = null;
      }
      sessionStartTime.value = null;
      sessionDuration.value = '0:00';
    } else {
      await connect();
      sessionStartTime.value = Date.now();
      durationInterval = setInterval(updateDuration, 1000);
    }
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    isLoading.value = false;
  }
}

async function handleSaveConfig() {
  if (isSavingConfig.value) return;

  isSavingConfig.value = true;
  try {
    const saved = await saveCurrentConfig();
    if (saved) {
      saveActionsOpen.value = false;
      toast.success(authStore.userId ? t('controlBar.savedRemote') : t('controlBar.savedLocal'));
    } else {
      toast.error(t('controlBar.saveError'));
    }
  } catch (err) {
    console.error('Failed to save kwami config:', err);
    toast.error(t('controlBar.saveError'));
  } finally {
    isSavingConfig.value = false;
  }
}

function handleUndoConfig() {
  revertCurrentConfig();
  saveActionsOpen.value = false;
  toast.info(t('controlBar.discarded'));
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (saveActionsOpen.value && !target.closest('.save-config-wrap')) {
    saveActionsOpen.value = false;
  }
}

// Watch for external disconnection
watch(isConnected, (connected) => {
  if (!connected && durationInterval) {
    clearInterval(durationInterval);
    durationInterval = null;
    sessionStartTime.value = null;
    sessionDuration.value = '0:00';
  }
});

watch(hasUnsavedChanges, (nextValue) => {
  if (!nextValue) {
    saveActionsOpen.value = false;
  }
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  if (durationInterval) clearInterval(durationInterval);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="control-bar">
    <!-- Record control -->
    <RecordControl />

    <transition name="save-chip">
      <div v-if="hasUnsavedChanges" class="save-config-wrap" :class="{ open: saveActionsOpen }">
        <button
          class="save-config-btn"
          :class="{ active: saveActionsOpen }"
          :title="saveButtonTitle"
          @click.stop="saveActionsOpen = !saveActionsOpen"
        >
          <iconify-icon icon="ph:floppy-disk-bold"></iconify-icon>
          <span>{{ t('controlBar.unsaved') }}</span>
        </button>

        <transition name="save-actions">
          <div v-if="saveActionsOpen" class="save-config-actions">
            <button
              class="save-action primary"
              :disabled="isSavingConfig"
              @click.stop="handleSaveConfig"
            >
              <iconify-icon :icon="isSavingConfig ? 'ph:circle-notch-bold' : 'ph:check-bold'" :class="{ spin: isSavingConfig }"></iconify-icon>
              <span>{{ isSavingConfig ? t('controlBar.saving') : t('controlBar.save') }}</span>
            </button>
            <button
              class="save-action secondary"
              :disabled="isSavingConfig"
              @click.stop="handleUndoConfig"
            >
              <iconify-icon icon="ph:arrow-counter-clockwise-bold"></iconify-icon>
              <span>{{ t('controlBar.undo') }}</span>
            </button>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Duration badge (only when connected) -->
    <transition name="fade">
      <span v-if="isConnected" class="duration-badge">
        {{ sessionDuration }}
      </span>
    </transition>

    <!-- Main control button -->
    <button
      class="control-btn"
      :class="{ connected: isConnected, loading: isLoading }"
      :disabled="isLoading"
      :title="buttonTitle"
      @click="handleToggle"
    >
      <iconify-icon :icon="buttonIcon" :class="{ spin: isLoading }"></iconify-icon>
    </button>
  </div>
</template>

<style scoped>
.control-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-config-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.save-config-btn,
.save-action {
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  font-family: inherit;
  transition: all var(--duration-fast) var(--ease-out);
}

.save-config-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 40px;
  border-radius: 999px;
  cursor: pointer;
  background: color-mix(in srgb, var(--accent-primary) 12%, var(--glass-bg));
  color: var(--text-primary);
  box-shadow: 0 0 18px color-mix(in srgb, var(--accent-primary) 18%, transparent);
}

.save-config-btn:hover,
.save-config-btn.active {
  border-color: color-mix(in srgb, var(--accent-primary) 28%, var(--glass-border));
  background: color-mix(in srgb, var(--accent-primary) 18%, var(--glass-bg));
}

.save-config-btn iconify-icon {
  font-size: 16px;
  color: var(--accent-primary);
}

.save-config-btn span {
  font-size: 12px;
  font-weight: 600;
}

.save-config-actions {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  display: flex;
  gap: 8px;
  padding: 8px;
  border-radius: calc(var(--radius-lg) + 2px);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.save-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.save-action.primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-color: transparent;
  color: white;
}

.save-action.secondary {
  background: var(--surface-2);
  color: var(--text-secondary);
}

.save-action:hover:not(:disabled) {
  transform: translateY(-1px);
}

.save-action.secondary:hover:not(:disabled) {
  background: var(--surface-3);
  color: var(--text-primary);
}

.save-action:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* Duration Badge */
.duration-badge {
  font-size: 11px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
  padding: 6px 10px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 20px;
}

/* Main Button */
.control-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  /* Default state (disconnected) - accent glow */
  background: linear-gradient(135deg, var(--accent-primary) 0%, #0099cc 100%);
  box-shadow: 
    0 4px 20px rgba(0, 217, 255, 0.4),
    0 0 0 0 rgba(0, 217, 255, 0);
}

.control-btn iconify-icon {
  font-size: 22px;
  color: white;
  transition: transform 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 
    0 6px 28px rgba(0, 217, 255, 0.5),
    0 0 0 4px rgba(0, 217, 255, 0.15);
}

.control-btn:active:not(:disabled) {
  transform: scale(0.95);
}

/* Connected state - red/stop */
.control-btn.connected {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 
    0 4px 20px rgba(239, 68, 68, 0.4),
    0 0 0 0 rgba(239, 68, 68, 0);
}

.control-btn.connected:hover:not(:disabled) {
  box-shadow: 
    0 6px 28px rgba(239, 68, 68, 0.5),
    0 0 0 4px rgba(239, 68, 68, 0.15);
}

/* Loading state */
.control-btn.loading {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  box-shadow: 0 4px 16px rgba(100, 116, 139, 0.3);
  cursor: wait;
}

.control-btn:disabled {
  cursor: wait;
}

/* Spinning icon */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

.save-chip-enter-active,
.save-chip-leave-active,
.save-actions-enter-active,
.save-actions-leave-active {
  transition: opacity 0.18s ease, transform 0.18s var(--ease-out);
}

.save-chip-enter-from,
.save-chip-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

.save-actions-enter-from,
.save-actions-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
