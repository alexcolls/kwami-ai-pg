<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useKwami } from '@/composables/useKwami';
import type { VoicePipelineConfig, VoicePipelineMetrics } from 'kwami-ai';

const { kwami } = useKwami();

// State
const config = reactive({
  vad: 'SILERO',
  stt: { provider: 'DEEPGRAM', model: 'NOVA-3' },
  llm: { provider: 'OPENAI', model: 'GPT-4.1-MINI' },
  tts: { provider: 'OPENAI', model: 'TTS-1', voice: '—' },
  enhancements: { turnDetection: true, noiseCancellation: true },
});

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

// Helpers
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

function updateConfig(newConfig?: VoicePipelineConfig) {
  if (!newConfig && kwami.value) {
    newConfig = kwami.value.agent.getConfig().livekit?.voice;
  }
  if (!newConfig) return;

  config.vad = newConfig.vad?.provider?.toUpperCase() || 'SILERO';
  config.stt.provider = newConfig.stt?.provider?.toUpperCase() || 'DEEPGRAM';
  config.stt.model = newConfig.stt?.model?.toUpperCase() || 'NOVA-3';
  config.llm.provider = newConfig.llm?.provider?.toUpperCase() || 'OPENAI';
  config.llm.model = newConfig.llm?.model?.toUpperCase() || 'GPT-4.1-MINI';
  config.tts.provider = newConfig.tts?.provider?.toUpperCase() || 'OPENAI';
  config.tts.model = newConfig.tts?.model?.toUpperCase() || 'TTS-1';
  config.tts.voice = newConfig.tts?.voice?.substring(0, 8) || '—';
  config.enhancements.turnDetection = newConfig.enhancements?.turnDetection?.enabled ?? true;
  config.enhancements.noiseCancellation =
    newConfig.enhancements?.noiseCancellation?.enabled ?? true;
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

function exportMetrics() {
  const data = {
    timestamp: new Date().toISOString(),
    config: config,
    latency: latency,
    stats: stats,
    history: latencyHistory.value,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kwami-metrics-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Events
const onConnected = () => {
  isLive.value = true;
  resetMetrics();
};
const onDisconnected = () => {
  isLive.value = false;
};
const onMetrics = (e: Event) => updateMetrics((e as CustomEvent).detail);
const onConfigChanged = () => updateConfig();

onMounted(() => {
  if (kwami.value) {
    updateConfig();
    isLive.value = kwami.value.isConnected();
  }
  window.addEventListener('kwami:connected', onConnected);
  window.addEventListener('kwami:disconnected', onDisconnected);
  window.addEventListener('kwami:metrics', onMetrics);
  window.addEventListener('kwami:voiceConfigChanged', onConfigChanged);
  window.addEventListener('kwami:enhancementsChanged', onConfigChanged);
});

onUnmounted(() => {
  window.removeEventListener('kwami:connected', onConnected);
  window.removeEventListener('kwami:disconnected', onDisconnected);
  window.removeEventListener('kwami:metrics', onMetrics);
  window.removeEventListener('kwami:voiceConfigChanged', onConfigChanged);
  window.removeEventListener('kwami:enhancementsChanged', onConfigChanged);
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:chart-line-duotone" class="panel-icon"></iconify-icon>
      <h2>Metrics</h2>
      <span class="status-pill" :class="{ active: isLive }">
        <span class="pulse-dot"></span>
        {{ isLive ? 'Live' : 'Waiting' }}
      </span>
    </div>

    <div class="panel-body">
      <!-- Config -->
      <section class="panel-section">
        <h3><iconify-icon icon="ph:gear-duotone"></iconify-icon> Agent Configuration</h3>
        <div class="config-summary">
          <div class="config-row">
            <span class="label">VAD</span> <span class="val">{{ config.vad }}</span>
          </div>
          <div class="config-row">
            <span class="label">STT</span> <span class="val">{{ config.stt.provider }}</span>
          </div>
          <div class="config-row sub">
            <span class="label">Model</span> <span class="val normal">{{ config.stt.model }}</span>
          </div>
          <div class="config-row">
            <span class="label">LLM</span> <span class="val">{{ config.llm.provider }}</span>
          </div>
          <div class="config-row sub">
            <span class="label">Model</span> <span class="val normal">{{ config.llm.model }}</span>
          </div>
          <div class="config-row">
            <span class="label">TTS</span> <span class="val">{{ config.tts.provider }}</span>
          </div>
          <div class="config-row sub">
            <span class="label">Model</span> <span class="val normal">{{ config.tts.model }}</span>
          </div>
          <div class="config-row sub">
            <span class="label">Voice</span> <span class="val normal">{{ config.tts.voice }}</span>
          </div>
        </div>
      </section>

      <!-- Enhancements -->
      <section class="panel-section">
        <h3><iconify-icon icon="ph:sliders-duotone"></iconify-icon> Enhancements</h3>
        <div class="config-summary">
          <div class="config-row">
            <span class="label">Turn Detection</span>
            <span class="val" :class="config.enhancements.turnDetection ? 'ok' : 'no'">{{
              config.enhancements.turnDetection ? 'TRUE' : 'FALSE'
            }}</span>
          </div>
          <div class="config-row">
            <span class="label">Noise Cancellation</span>
            <span class="val" :class="config.enhancements.noiseCancellation ? 'ok' : 'no'">{{
              config.enhancements.noiseCancellation ? 'TRUE' : 'FALSE'
            }}</span>
          </div>
        </div>
      </section>

      <!-- Latency -->
      <section class="panel-section">
        <h3><iconify-icon icon="ph:timer-duotone"></iconify-icon> Latency</h3>
        <div class="latency-grid">
          <div class="lat-item">
            <span>STT</span> <b>{{ latency.stt }}</b>
          </div>
          <div class="lat-item">
            <span>EOT</span> <b>{{ latency.eot }}</b>
          </div>
          <div class="lat-item">
            <span>LLM</span> <b>{{ latency.llm }}</b>
          </div>
          <div class="lat-item">
            <span>TTS</span> <b>{{ latency.tts }}</b>
          </div>
          <div class="lat-item overall">
            <span>Overall</span> <b>{{ latency.overall }}</b>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="panel-section">
        <h3><iconify-icon icon="ph:activity-duotone"></iconify-icon> Session Stats</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <b>{{ stats.turns }}</b> <span>Turns</span>
          </div>
          <div class="stat-item">
            <b>{{ stats.interruptions }}</b> <span>Interruptions</span>
          </div>
          <div class="stat-item">
            <b>{{ stats.agentTime }}</b> <span>Agent Time</span>
          </div>
          <div class="stat-item">
            <b>{{ stats.userTime }}</b> <span>User Time</span>
          </div>
        </div>
      </section>

      <!-- Chart Placeholder (Simple history bars) -->
      <section class="panel-section">
        <h3><iconify-icon icon="ph:chart-bar-duotone"></iconify-icon> Latency History</h3>
        <div class="chart-container">
          <div v-if="latencyHistory.length === 0" class="chart-empty">No data yet</div>
          <div v-else class="chart-bars">
            <div
              v-for="(val, i) in latencyHistory"
              :key="i"
              class="chart-bar"
              :style="{ height: Math.min(100, (val / 5000) * 100) + '%' }"
            ></div>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <section class="panel-section">
        <div class="action-buttons">
          <button class="action-btn" @click="resetMetrics">
            <iconify-icon icon="ph:arrow-counter-clockwise-duotone"></iconify-icon> Reset
          </button>
          <button class="action-btn" @click="exportMetrics">
            <iconify-icon icon="ph:export-duotone"></iconify-icon> Export
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  padding: 2px 8px;
  background: var(--surface-2);
  border-radius: 12px;
  color: var(--text-tertiary);
}
.status-pill.active {
  color: var(--accent-success);
  background: rgba(var(--accent-success-rgb), 0.1);
}
.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.config-summary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  background: var(--surface-1);
  padding: 8px;
  border-radius: 6px;
}
.config-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  align-items: center;
}
.config-row.sub {
  padding-left: 12px;
  opacity: 0.8;
}
.label {
  color: var(--text-tertiary);
  font-weight: 500;
}
.val {
  color: var(--accent-secondary);
  font-weight: 600;
  font-family: monospace;
}
.val.normal {
  color: var(--text-secondary);
  font-weight: 400;
}
.val.ok {
  color: var(--accent-success);
}
.val.no {
  color: var(--text-tertiary);
}

.latency-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.lat-item {
  background: var(--surface-2);
  padding: 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.lat-item span {
  font-size: 9px;
  color: var(--text-tertiary);
  text-transform: uppercase;
}
.lat-item b {
  font-size: 14px;
  font-weight: 600;
  font-family: monospace;
  color: var(--text-primary);
}
.lat-item.overall {
  grid-column: span 2;
  background: var(--surface-3);
  border: 1px solid var(--glass-border);
}
.lat-item.overall b {
  color: var(--accent-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.stat-item {
  background: var(--surface-2);
  padding: 8px;
  border-radius: 6px;
  text-align: center;
}
.stat-item b {
  display: block;
  font-size: 14px;
  font-weight: 600;
}
.stat-item span {
  font-size: 10px;
  color: var(--text-tertiary);
}

.chart-container {
  height: 80px;
  background: var(--surface-1);
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  padding: 4px;
  gap: 2px;
}
.chart-empty {
  width: 100%;
  text-align: center;
  align-self: center;
  font-size: 11px;
  color: var(--text-tertiary);
}
.chart-bars {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: flex-end;
  gap: 2px;
}
.chart-bar {
  flex: 1;
  background: var(--accent-primary);
  opacity: 0.6;
  min-height: 2px;
  transition: height 0.3s;
  border-radius: 2px 2px 0 0;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.action-btn {
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
}
.action-btn:hover {
  background: var(--surface-3);
}
</style>
