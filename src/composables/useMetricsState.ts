import { ref, reactive } from 'vue';
import type { VoicePipelineMetrics } from 'kwami-ai';

// Singleton state — survives component unmount
const latency = reactive({
  stt: '—',
  eot: '—',
  llm: '—',
  tts: '—',
  overall: '—',
});

const stats = reactive({
  turns: 0,
  interruptions: 0,
  agentTime: '0s',
  userTime: '0s',
});

const isLive = ref(false);
const latencyHistory = ref<number[]>([]);
const MAX_HISTORY = 10;

let listenersAttached = false;

function formatMs(ms: number | undefined): string {
  if (ms === undefined || ms === null) return '—';
  return `${Math.round(ms)}MS`;
}

function formatSeconds(ms: number): string {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${secs % 60}s`;
}

function updateMetrics(metrics: VoicePipelineMetrics) {
  latency.stt = formatMs(metrics.latency.stt);
  latency.eot = formatMs(metrics.latency.endOfTurn);
  latency.llm = formatMs(metrics.latency.llm);
  latency.tts = formatMs(metrics.latency.tts);
  latency.overall = formatMs(metrics.latency.overall);

  stats.turns = metrics.turnsCompleted;
  stats.interruptions = metrics.interruptions;
  stats.agentTime = formatSeconds(metrics.agentSpeakingTime);
  stats.userTime = formatSeconds(metrics.userSpeakingTime);

  if (metrics.latency.overall !== undefined) {
    latencyHistory.value.push(metrics.latency.overall);
    if (latencyHistory.value.length > MAX_HISTORY) latencyHistory.value.shift();
  }
}

function resetMetrics() {
  latencyHistory.value = [];
  latency.stt = latency.eot = latency.llm = latency.tts = latency.overall = '—';
  stats.turns = stats.interruptions = 0;
  stats.agentTime = stats.userTime = '0s';
}

// Global event listeners — attach once, never detach
function attachGlobalListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  window.addEventListener('kwami:connected', () => {
    isLive.value = true;
    resetMetrics();
  });

  window.addEventListener('kwami:disconnected', () => {
    isLive.value = false;
  });

  window.addEventListener('kwami:metrics', (e: Event) => {
    updateMetrics((e as CustomEvent).detail);
  });
}

export function useMetricsState() {
  attachGlobalListeners();

  return {
    latency,
    stats,
    isLive,
    latencyHistory,
    MAX_HISTORY,
    resetMetrics,
    formatMs,
    formatSeconds,
  };
}
