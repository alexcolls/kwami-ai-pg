<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEmailStore } from '@/stores/email';
import BaseButton from '@/components/ui/BaseButton.vue';

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'reply', messageId: string): void;
}>();

const { t } = useI18n();
const emailStore = useEmailStore();

const message = computed(() => emailStore.selectedMessage);

const formattedDate = computed(() => {
  if (!message.value) return '';
  return new Date(message.value.received_at).toLocaleString();
});

function handleArchive() {
  if (!message.value) return;
  emailStore.archiveMessage(message.value.id);
  emit('back');
}

function handleStar() {
  if (!message.value) return;
  emailStore.toggleStar(message.value.id);
}
</script>

<template>
  <div class="email-detail" v-if="message">
    <div class="detail-header">
      <BaseButton size="sm" variant="ghost" icon="ph:arrow-left" @click="emit('back')" />
      <div class="header-actions">
        <BaseButton
          size="sm"
          variant="ghost"
          :icon="message.is_starred ? 'ph:star-fill' : 'ph:star'"
          @click="handleStar"
        />
        <BaseButton size="sm" variant="ghost" icon="ph:archive-duotone" @click="handleArchive" />
      </div>
    </div>

    <div class="detail-meta">
      <h3 class="detail-subject">{{ message.subject || t('email.inbox.noSubject') }}</h3>
      <div class="meta-row">
        <span class="meta-from">{{ message.from_address }}</span>
        <span class="meta-date">{{ formattedDate }}</span>
      </div>
      <div v-if="message.to_addresses.length" class="meta-row">
        <span class="meta-label">{{ t('email.detail.to') }}</span>
        <span class="meta-value">{{ message.to_addresses.join(', ') }}</span>
      </div>
    </div>

    <div class="detail-body">
      <div v-if="message.body_html" v-html="message.body_html" class="body-html"></div>
      <pre v-else class="body-text">{{ message.body_text }}</pre>
    </div>

    <div class="detail-actions">
      <BaseButton
        variant="accent"
        icon="ph:arrow-bend-up-left-duotone"
        @click="emit('reply', message.id)"
      >
        {{ t('email.detail.reply') }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.email-detail {
  display: flex;
  flex-direction: column;
  grid-column: 1 / -1;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid var(--glass-border);
}

.header-actions {
  display: flex;
  gap: 4px;
}

.detail-meta {
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-subject {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  flex-wrap: wrap;
}

.meta-from {
  font-weight: 500;
  color: var(--text-secondary);
}

.meta-date {
  color: var(--text-muted);
  margin-left: auto;
}

.meta-label {
  color: var(--text-muted);
  font-weight: 500;
}

.meta-value {
  color: var(--text-secondary);
  word-break: break-all;
}

.detail-body {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
  min-height: 100px;
}

.body-html {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  word-break: break-word;
}

.body-html :deep(img) {
  max-width: 100%;
  height: auto;
}

.body-html :deep(a) {
  color: var(--accent-primary);
}

.body-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  margin: 0;
}

.detail-actions {
  padding: 12px 20px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  gap: 8px;
}
</style>
