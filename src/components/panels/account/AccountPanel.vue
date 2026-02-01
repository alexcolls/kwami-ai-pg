<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const authStore = useAuthStore();

// Computed properties
const userEmail = computed(() => authStore.userEmail || 'Unknown');
const userId = computed(() => authStore.userId || 'Unknown');
const userInitials = computed(() => {
  const email = authStore.userEmail;
  if (!email) return '??';
  return email.slice(0, 2).toUpperCase();
});

// Actions
async function handleLogout() {
  await authStore.signOut();
}
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:user-circle-duotone" class="panel-icon"></iconify-icon>
      <h2>Account</h2>
    </div>

    <div class="panel-body">
      <!-- User Profile Card -->
      <PanelSection title="Profile">
        <div class="profile-card">
          <div class="avatar">
            <span class="avatar-initials">{{ userInitials }}</span>
          </div>
          <div class="profile-info">
            <span class="profile-email">{{ userEmail }}</span>
            <span class="profile-status">
              <span class="status-dot"></span>
              Signed in
            </span>
          </div>
        </div>
        <div class="user-id">
          <span class="user-id-label">ID</span>
          <span class="user-id-value" :title="userId">{{ userId }}</span>
        </div>
      </PanelSection>

      <!-- Sign Out -->
      <PanelSection title="Actions">
        <div class="action-buttons">
          <BaseButton
            variant="danger"
            icon="ph:sign-out-duotone"
            block
            @click="handleLogout"
          >
            Sign Out
          </BaseButton>
        </div>
      </PanelSection>
    </div>
  </div>
</template>

<style scoped>
/* Profile Card */
.profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--surface-1);
  border-radius: var(--radius-lg);
}

.avatar {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.avatar-initials {
  font-size: 18px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.profile-email {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

/* User ID */
.user-id {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  margin-top: 10px;
  background: var(--surface-1);
  border-radius: var(--radius-md);
  min-height: 36px;
}

.user-id-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  flex-shrink: 0;
  line-height: 1;
}

.user-id-value {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent-primary);
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: opacity 0.2s ease;
  line-height: 1;
}

.user-id-value:hover {
  opacity: 0.8;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
