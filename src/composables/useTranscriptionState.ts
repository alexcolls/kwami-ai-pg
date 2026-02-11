import { ref, reactive } from 'vue';

export interface TranscriptionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Singleton state — survives component unmount
const messages = ref<TranscriptionMessage[]>([]);
const interimTranscript = ref<string | null>(null);
const isConnected = ref(false);
const indicators = reactive({
  user: false,
  agent: false,
});

let listenersAttached = false;

function updateIndicators(state: 'idle' | 'listening' | 'thinking' | 'speaking') {
  indicators.user = false;
  indicators.agent = false;
  switch (state) {
    case 'listening':
      indicators.user = true;
      break;
    case 'speaking':
      indicators.agent = true;
      break;
  }
}

function addMessage(role: 'user' | 'assistant' | 'system', content: string) {
  messages.value.push({ role, content, timestamp: Date.now() });
  if (role === 'user') {
    updateIndicators('thinking');
    interimTranscript.value = null;
  } else if (role === 'assistant') {
    updateIndicators('listening');
  }
}

function clearMessages() {
  messages.value = [];
}

// Global event listeners — attach once, never detach
function attachGlobalListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  window.addEventListener('kwami:message', (e: Event) => {
    const detail = (e as CustomEvent).detail;
    addMessage(detail.role, detail.content);
  });

  window.addEventListener('kwami:connected', () => {
    isConnected.value = true;
    updateIndicators('listening');
  });

  window.addEventListener('kwami:disconnected', () => {
    isConnected.value = false;
    updateIndicators('idle');
    interimTranscript.value = null;
  });

  window.addEventListener('kwami:stateChanged', (e: Event) => {
    updateIndicators((e as CustomEvent).detail);
  });

  window.addEventListener('kwami:interim', (e: Event) => {
    interimTranscript.value = (e as CustomEvent).detail as string;
  });
}

export function useTranscriptionState() {
  attachGlobalListeners();

  return {
    messages,
    interimTranscript,
    isConnected,
    indicators,
    addMessage,
    clearMessages,
    updateIndicators,
  };
}
