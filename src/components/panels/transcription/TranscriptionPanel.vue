<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { panelIcons } from '@/constants/panel-icons';
import { useKwami } from '@/composables/useKwami';
import { useTranscriptionState } from '@/composables/useTranscriptionState';

const { kwami } = useKwami();
const {
  messages,
  interimTranscript,
  isConnected,
  indicators,
  addMessage,
  clearMessages,
  updateIndicators,
} = useTranscriptionState();

// Local-only UI state
const inputMessage = ref('');
const conversationLog = ref<HTMLElement | null>(null);

// Helpers
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function scrollToBottom() {
  nextTick(() => {
    if (conversationLog.value) {
      conversationLog.value.scrollTop = conversationLog.value.scrollHeight;
    }
  });
}

// Scroll when messages change
watch(() => messages.value.length, () => scrollToBottom());

function clearLog() {
  clearMessages();
}

function sendMessage() {
  const text = inputMessage.value.trim();
  if (!text || !isConnected.value) return;

  kwami.value?.sendMessage(text);
  addMessage('user', text);
  inputMessage.value = '';
}

function interrupt() {
  kwami.value?.interrupt();
  addMessage('system', '🛑 Interrupted');
  updateIndicators('listening');
}

// Keyboard shortcut (panel-local since it needs panel context)
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isConnected.value) {
    interrupt();
    addMessage('system', '🛑 Interrupted (Esc)');
  }
};

onMounted(() => {
  // Sync initial connection state
  if (kwami.value) {
    isConnected.value = kwami.value.isConnected();
  }
  document.addEventListener('keydown', onKeydown);
  scrollToBottom();
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon :icon="panelIcons.transcription" class="panel-icon"></iconify-icon>
      <h2>Transcription</h2>
      <span class="message-count"
        >{{ messages.length }} message{{ messages.length !== 1 ? 's' : '' }}</span
      >
    </div>

    <div class="panel-body transcription-body">
      <!-- Real-time indicator -->
      <div class="realtime-indicator">
        <div class="indicator-row" :class="{ active: indicators.user }">
          <iconify-icon icon="ph:microphone-duotone"></iconify-icon>
          <span>Listening...</span>
          <div class="voice-wave"><span></span><span></span><span></span><span></span></div>
        </div>
        <div class="indicator-row" :class="{ active: indicators.agent }">
          <iconify-icon icon="ph:speaker-high-duotone"></iconify-icon>
          <span>Speaking...</span>
          <div class="voice-wave"><span></span><span></span><span></span><span></span></div>
        </div>
      </div>

      <!-- Interim transcript -->
      <div v-if="interimTranscript" class="interim-transcript">
        <span class="interim-label">Hearing:</span>
        <span class="interim-text">{{ interimTranscript }}</span>
      </div>

      <!-- Conversation Log -->
      <div class="conversation-log" ref="conversationLog">
        <div v-if="messages.length === 0" class="log-empty">
          <iconify-icon icon="ph:chat-circle-dots-duotone"></iconify-icon>
          <span>No messages yet</span>
          <span class="log-hint">Connect and start talking to see transcriptions</span>
        </div>

        <div v-for="(msg, index) in messages" :key="index" class="log-message" :class="msg.role">
          <div class="message-avatar">
            <iconify-icon
              :icon="
                msg.role === 'user'
                  ? 'ph:user-duotone'
                  : msg.role === 'assistant'
                    ? 'ph:robot-duotone'
                    : 'ph:info-duotone'
              "
            ></iconify-icon>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-role">{{
                msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Kwami' : 'System'
              }}</span>
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <p class="message-text">{{ msg.content }}</p>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-input-area">
        <div class="message-input-container">
          <input
            type="text"
            v-model="inputMessage"
            placeholder="Type a message..."
            :disabled="!isConnected"
            @keypress.enter="sendMessage"
          />
          <button
            class="send-btn"
            :disabled="!isConnected || !inputMessage.trim()"
            @click="sendMessage"
          >
            <iconify-icon icon="ph:paper-plane-right-duotone"></iconify-icon>
          </button>
        </div>
        <div class="input-actions">
          <button
            class="input-action-btn"
            :disabled="!isConnected"
            @click="interrupt"
            title="Interrupt (Esc)"
          >
            <iconify-icon icon="ph:hand-palm-duotone"></iconify-icon>
            Interrupt
          </button>
          <button class="input-action-btn" @click="clearLog" title="Clear log">
            <iconify-icon icon="ph:trash-duotone"></iconify-icon>
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transcription-body {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden; /* Flex container */
}

.realtime-indicator {
  padding: 12px 16px;
  background: var(--surface-1);
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  gap: 16px;
  min-height: 48px;
}

.indicator-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-tertiary);
  opacity: 0.3;
  transition: all 0.3s;
}

.indicator-row.active {
  opacity: 1;
}

/* User listening: Blue */
.indicator-row:first-child.active {
  color: var(--accent-secondary);
  background: rgba(92, 156, 255, 0.1);
}

/* Agent speaking: Purple */
.indicator-row:last-child.active {
  color: var(--accent-primary);
  background: rgba(124, 92, 255, 0.1);
}

.voice-wave {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 12px;
}

.voice-wave span {
  width: 2px;
  height: 4px;
  background: currentColor;
  border-radius: 2px;
  animation: wave 0.8s ease-in-out infinite;
}

.voice-wave span:nth-child(2) {
  animation-delay: 0.1s;
}
.voice-wave span:nth-child(3) {
  animation-delay: 0.2s;
}
.voice-wave span:nth-child(4) {
  animation-delay: 0.3s;
}

@keyframes wave {
  0%,
  100% {
    height: 4px;
  }
  50% {
    height: 12px;
  }
}

.interim-transcript {
  padding: 8px 16px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--glass-border);
  font-size: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.interim-label {
  color: var(--text-tertiary);
  font-weight: 500;
}

.interim-text {
  color: var(--text-secondary);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-log {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  gap: 8px;
  opacity: 0.5;
}

.log-empty iconify-icon {
  font-size: 32px;
}

.log-hint {
  font-size: 11px;
}

.log-message {
  display: flex;
  gap: 12px;
  max-width: 90%;
  animation: fadeIn 0.3s ease-out;
}

.log-message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.log-message.system {
  align-self: center;
  max-width: 100%;
  opacity: 0.7;
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.log-message.user .message-avatar {
  background: var(--accent-primary);
  color: #fff;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-message.user .message-content {
  align-items: flex-end;
}

.log-message.system .message-content {
  align-items: center;
}

.message-header {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.log-message.user .message-header {
  flex-direction: row-reverse;
}

.message-text {
  padding: 8px 12px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  border-top-left-radius: 2px;
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.4;
}

.log-message.user .message-text {
  background: var(--surface-2);
  border-color: var(--glass-border);
  border-radius: 12px;
  border-top-right-radius: 2px;
}

.log-message.system .message-text {
  background: transparent;
  border: 1px dashed var(--glass-border);
  padding: 4px 8px;
  font-size: 11px;
}

.message-input-area {
  padding: 16px;
  background: var(--surface-1);
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-input-container {
  display: flex;
  gap: 8px;
}

.message-input-container input {
  flex: 1;
  padding: 10px 14px;
  background: var(--surface-0);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
}

.message-input-container input:focus {
  border-color: var(--accent-primary);
  background: var(--surface-2);
}

.message-input-container input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  background: var(--surface-2);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  justify-content: space-between;
}

.input-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.input-action-btn:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text-secondary);
}

.input-action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.message-count {
  font-size: 11px;
  padding: 2px 6px;
  background: var(--surface-2);
  border-radius: 10px;
  color: var(--text-tertiary);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
