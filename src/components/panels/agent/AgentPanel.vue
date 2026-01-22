<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useKwami } from '@/composables/useKwami';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';

const { kwami, isConnected } = useKwami();

// Form State - defaults from .env
const livekitUrl = ref(import.meta.env.VITE_LIVEKIT_URL || '');
const livekitTokenEndpoint = ref(import.meta.env.VITE_LIVEKIT_TOKEN_ENDPOINT || '');
const roomName = ref('kwami-playground');
const userId = ref('playground_user');

// Session State
const sessionStartTime = ref<number | null>(null);
const sessionDuration = ref('0:00');
let durationInterval: ReturnType<typeof setInterval> | null = null;

// Computed Status
const statusLabel = computed(() => (isConnected.value ? 'Connected' : 'Not Connected'));
const statusDetail = computed(() =>
  isConnected.value ? 'Voice pipeline active' : 'Configure and connect to start',
);
const connectionBadgeClass = computed(() =>
  isConnected.value ? 'connection-badge connected' : 'connection-badge disconnected',
);
const statusIcon = computed(() =>
  isConnected.value ? 'ph:plugs-connected-duotone' : 'ph:plug-duotone',
);

// Actions
function updateDuration() {
  if (!sessionStartTime.value) return;
  const elapsed = Math.floor((Date.now() - sessionStartTime.value) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  sessionDuration.value = `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function handleConnect() {
  if (!livekitUrl.value) {
    alert('Please configure LiveKit Server URL');
    return;
  }

  if (!livekitTokenEndpoint.value) {
    alert('Please provide Token Endpoint URL');
    return;
  }

  const livekitConfig = {
    url: livekitUrl.value,
    roomName: roomName.value,
    tokenEndpoint: livekitTokenEndpoint.value,
  };

  try {
    if (kwami.value) {
      kwami.value.agent.updateConfig({ livekit: livekitConfig });
      await kwami.value.connect(userId.value, {
        onUserTranscript: (text) => console.log('User:', text),
        onAgentResponse: (text) => console.log('Agent:', text),
        onError: (err) => console.error('Error:', err),
      });

      isConnected.value = true;
      sessionStartTime.value = Date.now();
      durationInterval = setInterval(updateDuration, 1000);
    }
  } catch (err: unknown) {
    alert(`Connection failed: ${(err as Error).message}`);
    isConnected.value = false;
  }
}

async function handleDisconnect() {
  try {
    if (kwami.value) {
      await kwami.value.disconnect();
      isConnected.value = false;
      if (durationInterval) {
        clearInterval(durationInterval);
        durationInterval = null;
      }
      sessionStartTime.value = null;
      sessionDuration.value = '0:00';
    }
  } catch (err: unknown) {
    console.error('Disconnect error:', err);
  }
}

onMounted(() => {
  if (kwami.value) {
    const config = kwami.value.agent.getConfig();
    if (config.livekit?.url) livekitUrl.value = config.livekit.url;
    if (config.livekit?.tokenEndpoint) livekitTokenEndpoint.value = config.livekit.tokenEndpoint;
  }
});

onUnmounted(() => {
  if (durationInterval) clearInterval(durationInterval);
});
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:robot-duotone" class="panel-icon"></iconify-icon>
      <h2>Connection</h2>
      <span :class="connectionBadgeClass">
        <span class="badge-dot"></span>
        {{ isConnected ? 'Connected' : 'Disconnected' }}
      </span>
    </div>

    <div class="panel-body">
      <!-- Connection Status -->
      <PanelSection title="LiveKit Connection">
        <div class="connection-status-card">
          <div class="status-icon">
            <iconify-icon :icon="statusIcon"></iconify-icon>
          </div>
          <div class="status-info">
            <span class="status-label">{{ statusLabel }}</span>
            <span class="status-detail">{{ statusDetail }}</span>
          </div>
        </div>
      </PanelSection>

      <!-- Connection Config -->
      <PanelSection title="Server Configuration" icon="ph:sliders-duotone">
        <div class="config-form">
          <BaseInput
            label="Server URL"
            v-model="livekitUrl"
            icon="ph:link-duotone"
            placeholder="wss://your-server.livekit.cloud"
          />
          <BaseInput
            label="Room Name"
            v-model="roomName"
            icon="ph:door-duotone"
            placeholder="kwami-room"
          />
        </div>
      </PanelSection>

      <!-- Token Endpoint -->
      <PanelSection title="Authentication" icon="ph:key-duotone">
        <BaseInput
          label="Token Endpoint URL"
          v-model="livekitTokenEndpoint"
          icon="ph:globe-duotone"
          placeholder="http://localhost:8080/token"
        />
      </PanelSection>

      <!-- User ID -->
      <PanelSection title="User Identity">
        <BaseInput
          label="User ID"
          v-model="userId"
          icon="ph:identification-card-duotone"
          placeholder="user_123"
        />
      </PanelSection>

      <!-- Actions -->
      <PanelSection title="Session Control">
        <div class="action-buttons">
          <div class="row" style="display: flex; gap: 8px">
            <BaseButton
              variant="primary"
              icon="ph:play-duotone"
              block
              :disabled="isConnected"
              @click="handleConnect"
              >Connect</BaseButton
            >
            <BaseButton
              variant="danger"
              icon="ph:stop-duotone"
              block
              :disabled="!isConnected"
              @click="handleDisconnect"
              >Disconnect</BaseButton
            >
          </div>
        </div>
      </PanelSection>

      <!-- Session Info -->
      <PanelSection v-if="isConnected" title="Session Info">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Room</span>
            <span class="info-value">{{ roomName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">User</span>
            <span class="info-value">{{ userId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Duration</span>
            <span class="info-value">{{ sessionDuration }}</span>
          </div>
        </div>
      </PanelSection>
    </div>
  </div>
</template>

<style scoped>
/* Connection Status Card */
.connection-status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--surface-1);
  border-radius: 12px;
}

.status-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border-radius: 10px;
  font-size: 20px;
  color: var(--text-secondary);
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.status-detail {
  font-size: 11px;
  color: var(--text-muted);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: var(--surface-1);
  border-radius: 10px;
  text-align: center;
}

.info-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.info-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-primary);
  font-family: 'JetBrains Mono', monospace;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
