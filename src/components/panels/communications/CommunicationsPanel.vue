<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import { panelIcons } from '@/constants/panel-icons';
import { useWorkspaceStore } from '@/stores/workspace';
import { useCommunicationsStore } from '@/stores/communications';
import {
  configureWhatsappChannel,
  fetchKwamiCommunications,
  purchaseKwamiNumber,
  searchKwamiNumbers,
  sendWhatsappMessage,
  startOutboundCall,
  type ChannelRecord,
  type KwamiCommunicationsSnapshot,
  type NumberSearchResult,
} from '@/composables/useCommunicationsApi';

const workspaceStore = useWorkspaceStore();
const communicationsStore = useCommunicationsStore();

const loading = ref(false);
const searching = ref(false);
const purchasing = ref(false);
const calling = ref(false);
const sending = ref(false);
const snapshot = ref<KwamiCommunicationsSnapshot | null>(null);
const searchResults = ref<NumberSearchResult[]>([]);
const error = ref('');
const statusMessage = ref('');
const whatsappSender = ref('');

const activeKwamiId = computed(() => workspaceStore.activeWorkspaceId);
const activeKwamiName = computed(() => workspaceStore.getActiveWorkspace()?.name || 'Kwami');

const voiceChannels = computed(() =>
  (snapshot.value?.channels || []).filter((channel) => channel.kind === 'voice_phone'),
);
const whatsappChannels = computed(() =>
  (snapshot.value?.channels || []).filter((channel) => channel.kind === 'whatsapp'),
);
const recentCalls = computed(() => snapshot.value?.events.calls || []);
const recentMessages = computed(() => snapshot.value?.events.messages || []);

const selectedVoiceChannel = computed<ChannelRecord | null>(() => {
  const channels = voiceChannels.value;
  if (channels.length === 0) return null;
  const preferred = communicationsStore.preferredVoiceChannelId;
  return channels.find((channel) => channel.id === preferred) || channels[0] || null;
});

const selectedWhatsappChannel = computed<ChannelRecord | null>(() => {
  const channels = whatsappChannels.value;
  if (channels.length === 0) return null;
  const preferred = communicationsStore.preferredWhatsappChannelId;
  return channels.find((channel) => channel.id === preferred) || channels[0] || null;
});

watch(selectedVoiceChannel, (channel) => {
  communicationsStore.preferredVoiceChannelId = channel?.id || null;
});

watch(selectedWhatsappChannel, (channel) => {
  communicationsStore.preferredWhatsappChannelId = channel?.id || null;
  whatsappSender.value = channel?.provider_sender || '';
});

watch(
  activeKwamiId,
  (kwamiId) => {
    if (kwamiId) void loadCommunications(kwamiId);
  },
  { immediate: true },
);

async function loadCommunications(kwamiId: string) {
  loading.value = true;
  error.value = '';
  try {
    snapshot.value = await fetchKwamiCommunications(kwamiId);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

async function searchNumbers() {
  if (!activeKwamiId.value) return;
  searching.value = true;
  error.value = '';
  statusMessage.value = '';
  try {
    searchResults.value = await searchKwamiNumbers(activeKwamiId.value, {
      countryCode: communicationsStore.numberSearch.countryCode || 'US',
      areaCode: communicationsStore.numberSearch.areaCode || undefined,
      contains: communicationsStore.numberSearch.contains || undefined,
      limit: 8,
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    searching.value = false;
  }
}

async function buyNumber(phoneNumber: string) {
  if (!activeKwamiId.value) return;
  purchasing.value = true;
  error.value = '';
  try {
    await purchaseKwamiNumber({
      kwamiId: activeKwamiId.value,
      phoneNumber,
      displayName: `${activeKwamiName.value} Line`,
      countryCode: communicationsStore.numberSearch.countryCode || 'US',
    });
    statusMessage.value = `Purchased ${phoneNumber} for ${activeKwamiName.value}.`;
    await loadCommunications(activeKwamiId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    purchasing.value = false;
  }
}

async function enableWhatsappSender() {
  if (!selectedWhatsappChannel.value) return;
  error.value = '';
  statusMessage.value = '';
  try {
    await configureWhatsappChannel({
      channelId: selectedWhatsappChannel.value.id,
      status: 'active',
      providerSender: whatsappSender.value || selectedWhatsappChannel.value.provider_sender || undefined,
      metadata: { configuredFromPanel: true },
    });
    statusMessage.value = 'Updated WhatsApp sender configuration.';
    if (activeKwamiId.value) await loadCommunications(activeKwamiId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  }
}

async function placeCall() {
  if (!activeKwamiId.value || !communicationsStore.compose.callTarget.trim()) return;
  calling.value = true;
  error.value = '';
  statusMessage.value = '';
  try {
    await startOutboundCall({
      kwamiId: activeKwamiId.value,
      toNumber: communicationsStore.compose.callTarget.trim(),
      channelId: selectedVoiceChannel.value?.id,
      waitUntilAnswered: false,
    });
    statusMessage.value = 'Outbound call queued.';
    await loadCommunications(activeKwamiId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    calling.value = false;
  }
}

async function sendMessage() {
  if (!activeKwamiId.value || !communicationsStore.compose.messageTarget.trim()) return;
  sending.value = true;
  error.value = '';
  statusMessage.value = '';
  try {
    await sendWhatsappMessage({
      kwamiId: activeKwamiId.value,
      toNumber: communicationsStore.compose.messageTarget.trim(),
      body: communicationsStore.compose.messageBody.trim(),
      channelId: selectedWhatsappChannel.value?.id,
    });
    statusMessage.value = 'WhatsApp message sent.';
    communicationsStore.compose.messageBody = '';
    await loadCommunications(activeKwamiId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    sending.value = false;
  }
}

function refreshCurrentKwami() {
  if (activeKwamiId.value) void loadCommunications(activeKwamiId.value);
}
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon :icon="panelIcons.communications" class="panel-icon"></iconify-icon>
      <h2>Communications</h2>
    </div>

    <div class="panel-body">
      <PanelSection title="Overview" icon="ph:phone-call-duotone">
        <div class="summary-grid">
          <div class="summary-card">
            <span class="summary-label">Voice numbers</span>
            <strong>{{ voiceChannels.length }}</strong>
          </div>
          <div class="summary-card">
            <span class="summary-label">WhatsApp senders</span>
            <strong>{{ whatsappChannels.length }}</strong>
          </div>
          <div class="summary-card">
            <span class="summary-label">Latest runtime</span>
            <strong>{{ snapshot?.kwami.name || activeKwamiName }}</strong>
          </div>
        </div>
        <p v-if="statusMessage" class="status-text">{{ statusMessage }}</p>
        <p v-if="error" class="error-text">{{ error }}</p>
      </PanelSection>

      <PanelSection title="Buy Number" icon="ph:sim-card-duotone" collapsible>
        <div class="form-grid">
          <BaseInput
            v-model="communicationsStore.numberSearch.countryCode"
            label="Country"
            placeholder="US"
            mono
          />
          <BaseInput
            v-model="communicationsStore.numberSearch.areaCode"
            label="Area Code"
            placeholder="415"
            mono
          />
          <BaseInput
            v-model="communicationsStore.numberSearch.contains"
            label="Contains"
            placeholder="555"
            mono
          />
        </div>
        <div class="section-actions-row">
          <BaseButton
            variant="primary"
            :loading="searching"
            icon="ph:magnifying-glass-duotone"
            @click="searchNumbers"
          >
            Search Numbers
          </BaseButton>
          <BaseButton
            variant="secondary"
            icon="ph:arrows-clockwise-duotone"
            @click="refreshCurrentKwami"
          >
            Refresh
          </BaseButton>
        </div>
        <div v-if="searchResults.length > 0" class="result-list">
          <div v-for="result in searchResults" :key="result.phoneNumber" class="result-card">
            <div>
              <strong>{{ result.phoneNumber }}</strong>
              <p>{{ result.locality || result.region || 'Available number' }}</p>
            </div>
            <BaseButton
              variant="accent"
              size="sm"
              :loading="purchasing"
              icon="ph:shopping-cart-duotone"
              @click="buyNumber(result.phoneNumber)"
            >
              Buy
            </BaseButton>
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Phone Channel" icon="ph:phone-duotone" collapsible>
        <div v-if="selectedVoiceChannel" class="channel-card">
          <div class="channel-row">
            <span>Assigned number</span>
            <strong>{{ selectedVoiceChannel.phone_number }}</strong>
          </div>
          <div class="channel-row">
            <span>Status</span>
            <strong>{{ selectedVoiceChannel.status }}</strong>
          </div>
        </div>
        <p v-else class="muted-text">Buy a number to enable calling for this kwami.</p>
        <BaseInput
          v-model="communicationsStore.compose.callTarget"
          label="Call recipient"
          placeholder="+14155550123"
          mono
        />
        <BaseButton
          variant="primary"
          block
          icon="ph:phone-outgoing-duotone"
          :loading="calling"
          :disabled="!selectedVoiceChannel"
          @click="placeCall"
        >
          Place Call
        </BaseButton>
      </PanelSection>

      <PanelSection title="WhatsApp" icon="ph:chat-teardrop-text-duotone" collapsible>
        <div v-if="selectedWhatsappChannel" class="channel-card">
          <div class="channel-row">
            <span>Sender</span>
            <strong>{{ selectedWhatsappChannel.provider_sender || selectedWhatsappChannel.phone_number }}</strong>
          </div>
          <div class="channel-row">
            <span>Status</span>
            <strong>{{ selectedWhatsappChannel.status }}</strong>
          </div>
        </div>
        <p v-else class="muted-text">A WhatsApp sender will appear after the first number is purchased.</p>
        <BaseInput
          v-model="whatsappSender"
          label="Approved sender"
          placeholder="whatsapp:+14155550123"
          mono
        />
        <BaseButton
          variant="secondary"
          block
          icon="ph:check-circle-duotone"
          :disabled="!selectedWhatsappChannel"
          @click="enableWhatsappSender"
        >
          Mark WhatsApp Ready
        </BaseButton>
        <BaseInput
          v-model="communicationsStore.compose.messageTarget"
          label="Recipient"
          placeholder="+14155550123"
          mono
        />
        <div class="message-field">
          <label>Message</label>
          <textarea
            v-model="communicationsStore.compose.messageBody"
            placeholder="Hello from my kwami..."
          ></textarea>
        </div>
        <BaseButton
          variant="primary"
          block
          icon="ph:paper-plane-tilt-duotone"
          :loading="sending"
          :disabled="!selectedWhatsappChannel || !communicationsStore.compose.messageBody.trim()"
          @click="sendMessage"
        >
          Send WhatsApp
        </BaseButton>
      </PanelSection>

      <PanelSection title="Recent Calls" icon="ph:phone-incoming-duotone" collapsible default-collapsed>
        <div v-if="recentCalls.length === 0" class="muted-text">No call events yet.</div>
        <div v-for="call in recentCalls" :key="call.id" class="event-card">
          <strong>{{ call.to_number || call.from_number || 'Call' }}</strong>
          <span>{{ call.status }}</span>
          <small>{{ new Date(call.created_at).toLocaleString() }}</small>
        </div>
      </PanelSection>

      <PanelSection title="Recent Messages" icon="ph:chats-circle-duotone" collapsible default-collapsed>
        <div v-if="recentMessages.length === 0" class="muted-text">No message events yet.</div>
        <div v-for="message in recentMessages" :key="message.id" class="event-card">
          <strong>{{ message.to_address || message.from_address || 'Message' }}</strong>
          <span>{{ message.provider_status || 'queued' }}</span>
          <small>{{ message.body || 'No content' }}</small>
        </div>
      </PanelSection>

      <div v-if="loading" class="muted-text loading-text">Loading communications...</div>
    </div>
  </div>
</template>

<style scoped>
.summary-grid,
.form-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.summary-card,
.channel-card,
.result-card,
.event-card {
  padding: 12px;
  border-radius: 12px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-label,
.channel-row span,
.event-card span,
.message-field label {
  font-size: 11px;
  color: var(--text-muted);
}

.channel-card,
.event-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.channel-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.section-actions-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.result-list,
.event-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.result-card p,
.status-text,
.muted-text,
.error-text {
  margin: 0;
  font-size: 12px;
}

.muted-text {
  color: var(--text-muted);
}

.status-text {
  color: var(--accent-primary);
  margin-top: 12px;
}

.error-text {
  color: var(--error);
  margin-top: 8px;
}

.message-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 12px 0;
}

.message-field textarea {
  min-height: 96px;
  resize: vertical;
  padding: 12px 14px;
  background: var(--surface-1);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  font: inherit;
}

.message-field textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.loading-text {
  padding: 16px 20px;
}

@media (max-width: 860px) {
  .summary-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .section-actions-row,
  .result-card {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
