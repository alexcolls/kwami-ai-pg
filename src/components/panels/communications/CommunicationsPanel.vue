<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import PanelHeaderControls from '@/components/ui/PanelHeaderControls.vue';
import { panelIcons } from '@/constants/panel-icons';
import { useWorkspaceStore } from '@/stores/workspace';
import { useCommunicationsStore } from '@/stores/communications';
import {
  configureWhatsappChannel,
  fetchKwamiCommunications,
  purchaseKwamiNumber,
  releaseKwamiPhone,
  searchKwamiNumbers,
  sendWhatsappMessage,
  startOutboundCall,
  startTwilioDirectTestCall,
  type ChannelRecord,
  type KwamiCommunicationsSnapshot,
  type NumberSearchResult,
} from '@/composables/useCommunicationsApi';

const workspaceStore = useWorkspaceStore();
const communicationsStore = useCommunicationsStore();

const loading = ref(false);
const searching = ref(false);
const purchasing = ref(false);
const releasing = ref(false);
const showReleaseConfirm = ref(false);
const callingTwilioDirect = ref(false);
const callingWithAgent = ref(false);
const sending = ref(false);
const snapshot = ref<KwamiCommunicationsSnapshot | null>(null);
const suggestedNumber = ref<NumberSearchResult | null>(null);
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
    const results = await searchKwamiNumbers(activeKwamiId.value, {
      countryCode: communicationsStore.numberSearch.countryCode || 'US',
      limit: 20,
    });
    if (!results.length) {
      suggestedNumber.value = null;
      statusMessage.value = '';
      error.value = `No numbers are currently available for ${communicationsStore.numberSearch.countryCode || 'US'}.`;
      return;
    }

    // Pick a random suggestion to keep "create number" quick and simple.
    const index = Math.floor(Math.random() * results.length);
    suggestedNumber.value = results[index] || results[0];
    statusMessage.value = `Found a number for ${communicationsStore.numberSearch.countryCode || 'US'}.`;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    searching.value = false;
  }
}

async function refreshSuggestedNumber() {
  const previous = suggestedNumber.value?.phoneNumber;
  await searchNumbers();
  if (suggestedNumber.value && previous && suggestedNumber.value.phoneNumber === previous) {
    statusMessage.value = 'Refreshed search. Twilio returned the same top candidate; refresh again for another try.';
  }
}

async function buyNumber(phoneNumber?: string) {
  if (!activeKwamiId.value) return;
  const selected = (phoneNumber || suggestedNumber.value?.phoneNumber || '').trim();
  if (!selected) {
    error.value = 'Find a number first, then purchase it.';
    return;
  }
  purchasing.value = true;
  error.value = '';
  try {
    await purchaseKwamiNumber({
      kwamiId: activeKwamiId.value,
      phoneNumber: selected,
      displayName: `${activeKwamiName.value} Line`,
      countryCode: communicationsStore.numberSearch.countryCode || 'US',
    });
    statusMessage.value = `Assigned ${selected} to ${activeKwamiName.value}.`;
    suggestedNumber.value = null;
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

function openReleaseConfirm() {
  if (!activeKwamiId.value || !selectedVoiceChannel.value) return;
  error.value = '';
  showReleaseConfirm.value = true;
}

async function confirmReleasePhone() {
  if (!activeKwamiId.value || !selectedVoiceChannel.value) {
    showReleaseConfirm.value = false;
    return;
  }
  releasing.value = true;
  error.value = '';
  statusMessage.value = '';
  try {
    await releaseKwamiPhone({
      kwamiId: activeKwamiId.value,
      channelId: selectedVoiceChannel.value.id,
      releaseProviderResources: true,
    });
    statusMessage.value = 'Phone number released.';
    showReleaseConfirm.value = false;
    await loadCommunications(activeKwamiId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    releasing.value = false;
  }
}

async function placeTwilioDirectCall() {
  if (!activeKwamiId.value || !canPlaceOutboundCall.value) return;
  callingTwilioDirect.value = true;
  error.value = '';
  statusMessage.value = '';
  try {
    await startTwilioDirectTestCall({
      kwamiId: activeKwamiId.value,
      toNumber: communicationsStore.compose.callTarget.trim(),
      channelId: selectedVoiceChannel.value?.id,
    });
    statusMessage.value =
      'Twilio test call started (PSTN only — no LiveKit or agent). You should hear a short voice message.';
    await loadCommunications(activeKwamiId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    callingTwilioDirect.value = false;
  }
}

async function placeCallWithAgent() {
  if (!activeKwamiId.value || !canPlaceOutboundCall.value) return;
  callingWithAgent.value = true;
  error.value = '';
  statusMessage.value = '';
  try {
    await startOutboundCall({
      kwamiId: activeKwamiId.value,
      toNumber: communicationsStore.compose.callTarget.trim(),
      channelId: selectedVoiceChannel.value?.id,
      waitUntilAnswered: true,
    });
    statusMessage.value = 'Outbound call with Kwami agent queued (LiveKit + SIP).';
    await loadCommunications(activeKwamiId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    callingWithAgent.value = false;
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

const voiceInfrastructureNote = computed(() => {
  const metadata = (selectedVoiceChannel.value?.metadata || {}) as Record<string, unknown>;
  const sharedInfrastructure = (metadata.sharedInfrastructure || {}) as Record<string, unknown>;
  const notes = Array.isArray(sharedInfrastructure.notes) ? sharedInfrastructure.notes : [];
  if (notes.length > 0 && typeof notes[0] === 'string') return notes[0];
  if (selectedVoiceChannel.value?.status === 'routing_pending') {
    return 'The number has been purchased, but the shared LiveKit caller-ID sync is still pending.';
  }
  return 'Numbers bought here are synced onto shared platform trunks automatically. You do not need to pre-register each kwami number in the LiveKit dashboard.';
});

/** Stored capability from last purchase/sync — can be false even after you fix LiveKit; server is authoritative. */
const voiceOutboundCapabilityStale = computed(() => {
  const caps = selectedVoiceChannel.value?.capabilities as Record<string, unknown> | undefined;
  return Boolean(caps && caps.outbound === false);
});

const canPlaceOutboundCall = computed(
  () =>
    Boolean(selectedVoiceChannel.value && communicationsStore.compose.callTarget.trim()),
);

const anyCallInProgress = computed(() => callingTwilioDirect.value || callingWithAgent.value);
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon :icon="panelIcons.communications" class="panel-icon"></iconify-icon>
      <h2>Communications</h2>
      <PanelHeaderControls />
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
        <p class="muted-text infra-text">
          Shared trunks power the platform. Each kwami still owns its own mapped number and sender.
        </p>
        <p v-if="statusMessage" class="status-text">{{ statusMessage }}</p>
        <p v-if="error" class="error-text">{{ error }}</p>
      </PanelSection>

      <PanelSection title="Create Number" icon="ph:sim-card-duotone" collapsible>
        <p class="muted-text infra-text">
          Create a phone number for this kwami in 3 steps: choose country, find an available number, then purchase it.
        </p>
        <div class="country-grid">
          <BaseInput
            v-model="communicationsStore.numberSearch.countryCode"
            label="Country"
            placeholder="US"
            mono
          />
        </div>
        <p class="muted-text infra-text">
          Buying a number here provisions it for the active kwami and syncs it to the shared phone infrastructure automatically.
        </p>
        <div class="section-actions-row">
          <BaseButton
            variant="primary"
            :loading="searching"
            icon="ph:magnifying-glass-duotone"
            :disabled="!activeKwamiId"
            @click="searchNumbers"
          >
            Find Available Number
          </BaseButton>
          <BaseButton
            variant="secondary"
            icon="ph:shuffle-angular-duotone"
            :disabled="!activeKwamiId || !suggestedNumber"
            :loading="searching"
            @click="refreshSuggestedNumber"
          >
            Refresh Suggestion
          </BaseButton>
          <BaseButton
            variant="secondary"
            icon="ph:arrows-clockwise-duotone"
            @click="refreshCurrentKwami"
          >
            Refresh
          </BaseButton>
        </div>
        <div v-if="suggestedNumber" class="result-list">
          <div class="result-card">
            <div>
              <strong>{{ suggestedNumber.phoneNumber }}</strong>
              <p>{{ suggestedNumber.locality || suggestedNumber.region || 'Available number' }}</p>
            </div>
          </div>
        </div>
        <BaseButton
          variant="accent"
          block
          icon="ph:shopping-cart-duotone"
          :loading="purchasing"
          :disabled="!activeKwamiId || !suggestedNumber"
          @click="buyNumber()"
        >
          Purchase Suggested Number
        </BaseButton>
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
          <div class="channel-row">
            <span>Last sync: outbound</span>
            <strong>{{ voiceOutboundCapabilityStale ? 'Not recorded' : 'OK' }}</strong>
          </div>
        </div>
        <p v-if="selectedVoiceChannel && voiceOutboundCapabilityStale" class="warning-text">
          This channel was saved before outbound SIP was fully synced. You can still try Call with agent — if it fails,
          confirm <code>LIVEKIT_SIP_OUTBOUND_TRUNK_ID</code> on the API and that your Twilio number is on the LiveKit outbound trunk.
        </p>
        <p v-if="selectedVoiceChannel" class="muted-text infra-text">{{ voiceInfrastructureNote }}</p>
        <p v-else class="muted-text">Provision a number to enable calling for this kwami.</p>
        <BaseInput
          v-model="communicationsStore.compose.callTarget"
          label="Call recipient"
          placeholder="+14155550123"
          mono
        />
        <p class="muted-text infra-text">
          Test Twilio alone isolates your number, account, and geo rules. Call with agent uses LiveKit SIP and the worker.
        </p>
        <div class="section-actions-row">
          <BaseButton
            variant="secondary"
            icon="ph:lightning-duotone"
            :loading="callingTwilioDirect"
            :disabled="!canPlaceOutboundCall || anyCallInProgress"
            @click="placeTwilioDirectCall"
          >
            Test call (Twilio only)
          </BaseButton>
          <BaseButton
            variant="primary"
            icon="ph:phone-outgoing-duotone"
            :loading="callingWithAgent"
            :disabled="!canPlaceOutboundCall || anyCallInProgress"
            @click="placeCallWithAgent"
          >
            Call with agent
          </BaseButton>
        </div>
        <BaseButton
          variant="danger"
          block
          icon="ph:trash-duotone"
          :disabled="!activeKwamiId || !selectedVoiceChannel || releasing"
          @click="openReleaseConfirm"
        >
          Remove number from kwami
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
        <p v-else class="muted-text">A WhatsApp sender will appear after the first number is provisioned.</p>
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

    <ConfirmDialog
      :open="showReleaseConfirm"
      title="Remove phone number?"
      icon="ph:phone-slash-duotone"
      confirm-label="Remove and release"
      confirm-icon="ph:trash-duotone"
      confirm-variant="danger"
      cancel-label="Cancel"
      :loading="releasing"
      @confirm="confirmReleasePhone"
      @cancel="showReleaseConfirm = false"
    >
      <p>
        This removes the voice and WhatsApp channels for this kwami, updates shared LiveKit SIP trunks,
        detaches the number from your Twilio SIP trunk when configured, and releases the number in Twilio.
      </p>
      <p class="warning-text">You cannot undo this. You can provision a new number afterward.</p>
      <p v-if="selectedVoiceChannel">
        Number:
        <strong>{{ selectedVoiceChannel.phone_number }}</strong>
      </p>
    </ConfirmDialog>
  </div>
</template>

<style scoped>
.summary-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.country-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(1, minmax(0, 1fr));
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

.warning-text {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--warning);
}

.warning-text code {
  font-size: 11px;
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
  .country-grid {
    grid-template-columns: 1fr;
  }

  .section-actions-row,
  .result-card {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
