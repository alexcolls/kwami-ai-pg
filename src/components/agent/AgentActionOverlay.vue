<script setup lang="ts">
import { computed } from 'vue';
import { useAgentActionState } from '@/composables/useAgentActionState';

const {
  state,
  lastAction,
  lastDetail,
  pendingConfirmation,
  confirmPending,
  cancelPending,
} = useAgentActionState();

const isVisible = computed(() => {
  return state.value !== 'idle' || !!lastAction.value || !!pendingConfirmation.value;
});

const stateLabel = computed(() => {
  switch (state.value) {
    case 'listening':
      return 'Listening';
    case 'thinking':
      return 'Thinking';
    case 'speaking':
      return 'Speaking';
    case 'acting':
      return 'Acting';
    case 'confirming':
      return 'Awaiting confirmation';
    case 'error':
      return 'Needs attention';
    default:
      return 'Idle';
  }
});

const stateIcon = computed(() => {
  switch (state.value) {
    case 'listening':
      return 'ph:microphone-duotone';
    case 'thinking':
      return 'ph:brain-duotone';
    case 'speaking':
      return 'ph:speaker-high-duotone';
    case 'acting':
      return 'ph:cursor-click-duotone';
    case 'confirming':
      return 'ph:question-duotone';
    case 'error':
      return 'ph:warning-circle-duotone';
    default:
      return 'ph:circle-duotone';
  }
});
</script>

<template>
  <div v-if="isVisible" class="agent-overlay">
    <div class="agent-overlay-card" :class="`state-${state}`">
      <div class="agent-overlay-header">
        <div class="state-chip">
          <iconify-icon :icon="stateIcon"></iconify-icon>
          <span>{{ stateLabel }}</span>
        </div>
      </div>

      <div v-if="pendingConfirmation" class="confirmation-block">
        <p class="confirmation-title">{{ pendingConfirmation.title }}</p>
        <p class="confirmation-message">{{ pendingConfirmation.message }}</p>
        <div class="confirmation-actions">
          <button class="confirm-btn" @click="confirmPending()">
            {{ pendingConfirmation.confirmLabel }}
          </button>
          <button class="cancel-btn" @click="cancelPending()">
            {{ pendingConfirmation.cancelLabel }}
          </button>
        </div>
      </div>

      <div v-else-if="lastAction" class="action-block">
        <p class="action-label">Last action</p>
        <p class="action-title">{{ lastAction }}</p>
        <p v-if="lastDetail" class="action-detail">{{ lastDetail }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agent-overlay {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 140;
  pointer-events: none;
}

.agent-overlay-card {
  min-width: 280px;
  max-width: min(560px, calc(100vw - 48px));
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(10, 14, 24, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  pointer-events: auto;
}

.agent-overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.state-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.action-block,
.confirmation-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-label {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
}

.action-title,
.confirmation-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.action-detail,
.confirmation-message {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-secondary);
}

.confirmation-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.confirmation-actions button {
  border: none;
  border-radius: 10px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.confirmation-actions button:hover {
  transform: translateY(-1px);
}

.confirm-btn {
  background: var(--accent-primary);
  color: #fff;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.state-listening .state-chip {
  color: var(--accent-secondary);
}

.state-thinking .state-chip,
.state-acting .state-chip {
  color: var(--accent-primary);
}

.state-speaking .state-chip {
  color: #8cd8ff;
}

.state-confirming .state-chip {
  color: #ffd166;
}

.state-error .state-chip {
  color: #ff7a7a;
}
</style>
