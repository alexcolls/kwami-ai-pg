<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { EmailMessage } from '@/stores/email';
import { useEmailStore } from '@/stores/email';

const props = defineProps<{ message: EmailMessage }>();
const emit = defineEmits<{ (e: 'select', id: string): void }>();
const { t } = useI18n();
const emailStore = useEmailStore();

const categoryMeta = computed(() => {
  const map: Record<string, { icon: string; color: string }> = {
    travel:        { icon: 'ph:airplane-duotone',       color: '#3b82f6' },
    bills:         { icon: 'ph:receipt-duotone',         color: '#f59e0b' },
    events:        { icon: 'ph:calendar-check-duotone',  color: '#8b5cf6' },
    newsletters:   { icon: 'ph:newspaper-duotone',       color: '#6366f1' },
    personal:      { icon: 'ph:user-circle-duotone',     color: '#22c55e' },
    notifications: { icon: 'ph:bell-ringing-duotone',    color: '#ef4444' },
    shopping:      { icon: 'ph:shopping-bag-duotone',    color: '#ec4899' },
    work:          { icon: 'ph:briefcase-duotone',       color: '#0ea5e9' },
    uncategorized: { icon: 'ph:envelope-duotone',        color: '#94a3b8' },
  };
  return map[props.message.category] ?? map.uncategorized;
});

const senderName = computed(() => {
  const addr = props.message.from_address;
  const nameMatch = addr.match(/^"?([^"<]+)"?\s*</);
  if (nameMatch) return nameMatch[1].trim();
  return addr.split('@')[0];
});

const timeAgo = computed(() => {
  const now = Date.now();
  const then = new Date(props.message.received_at).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('email.time.now');
  if (mins < 60) return t('email.time.minutesAgo', { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('email.time.hoursAgo', { n: hours });
  const days = Math.floor(hours / 24);
  return t('email.time.daysAgo', { n: days });
});

const cardData = computed(() => props.message.action_card_data as Record<string, string>);

function toggleStar(e: Event) {
  e.stopPropagation();
  emailStore.toggleStar(props.message.id);
}
</script>

<template>
  <article
    class="action-card"
    :class="{ unread: !message.is_read }"
    @click="emit('select', message.id)"
  >
    <div class="card-header">
      <div class="category-badge" :style="{ '--cat-color': categoryMeta.color }">
        <iconify-icon :icon="categoryMeta.icon" class="category-icon"></iconify-icon>
      </div>
      <span class="time">{{ timeAgo }}</span>
      <button class="star-btn" :class="{ starred: message.is_starred }" @click="toggleStar">
        <iconify-icon :icon="message.is_starred ? 'ph:star-fill' : 'ph:star'"></iconify-icon>
      </button>
    </div>

    <div class="card-body">
      <div class="sender">{{ senderName }}</div>
      <div class="subject" :class="{ bold: !message.is_read }">{{ message.subject || t('email.inbox.noSubject') }}</div>

      <!-- Category-specific card data -->
      <div v-if="message.category === 'travel' && cardData.travel_date" class="card-meta">
        <iconify-icon icon="ph:calendar-duotone"></iconify-icon>
        <span>{{ cardData.travel_date }}</span>
      </div>

      <div v-else-if="message.category === 'bills' && cardData.amount" class="card-meta bill-meta">
        <span class="bill-amount">${{ cardData.amount }}</span>
        <span v-if="cardData.due_date" class="bill-due">{{ t('email.card.dueBy') }} {{ cardData.due_date }}</span>
      </div>

      <div v-else-if="message.category === 'events' && cardData.event_date" class="card-meta">
        <iconify-icon icon="ph:calendar-check-duotone"></iconify-icon>
        <span>{{ cardData.event_date }}</span>
      </div>

      <div v-else-if="message.category === 'shopping' && cardData.summary" class="card-meta">
        <iconify-icon icon="ph:package-duotone"></iconify-icon>
        <span>{{ cardData.summary }}</span>
      </div>

      <div v-else class="card-snippet">
        {{ message.body_text.slice(0, 100) }}{{ message.body_text.length > 100 ? '...' : '' }}
      </div>
    </div>

    <div v-if="!message.is_read" class="unread-dot"></div>
  </article>
</template>

<style scoped>
.action-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  background: var(--surface-1);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  overflow: hidden;
}

.action-card:hover {
  background: var(--surface-2);
  border-color: var(--surface-4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-card.unread {
  border-left: 3px solid var(--accent-primary);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--cat-color) 15%, transparent);
}

.category-icon {
  font-size: 16px;
  color: var(--cat-color);
}

.time {
  flex: 1;
  font-size: 10px;
  color: var(--text-muted);
  text-align: right;
}

.star-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 14px;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) ease;
}

.star-btn:hover {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.star-btn.starred {
  color: #f59e0b;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sender {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subject {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subject.bold {
  font-weight: 600;
  color: var(--text-primary);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted);
}

.card-meta iconify-icon {
  font-size: 14px;
  color: var(--accent-primary);
}

.bill-meta {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.bill-amount {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.bill-due {
  font-size: 11px;
  color: var(--text-muted);
}

.card-snippet {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 2px;
}

.unread-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-primary);
}
</style>
