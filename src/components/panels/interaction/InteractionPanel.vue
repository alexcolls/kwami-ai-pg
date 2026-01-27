<script setup lang="ts">
import { useKwami } from '@/composables/useKwami';
import { useInteractionStore, type InteractionAction } from '@/stores/interaction';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';

const { kwami, switchRenderer } = useKwami();
const interactionStore = useInteractionStore();

// Use store's reactive config directly
const state = interactionStore.config;

const actionOptions = [
  { label: 'None', value: 'none' },
  { label: 'Toggle Listening', value: 'toggleListening' },
  { label: 'Start Listening', value: 'startListening' },
  { label: 'Stop Listening', value: 'stopListening' },
  { label: 'Randomize', value: 'randomize' },
  { label: 'Switch Renderer', value: 'switchRenderer' },
  { label: 'Cycle State', value: 'cycleState' },
  { label: 'Pulse Effect', value: 'pulse' },
];

const cursorOptions = [
  { label: 'Pointer', value: 'pointer' },
  { label: 'Grab', value: 'grab' },
  { label: 'Crosshair', value: 'crosshair' },
  { label: 'Default', value: 'default' },
];

// Action handlers
function executeAction(action: InteractionAction) {
  if (!kwami.value) return;

  switch (action) {
    case 'toggleListening':
      const currentState = kwami.value.getState() || 'idle';
      if (currentState === 'listening') {
        kwami.value.setState('idle');
      } else {
        kwami.value.setState('listening');
      }
      break;
    case 'startListening':
      kwami.value.setState('listening');
      break;
    case 'stopListening':
      kwami.value.setState('idle');
      break;
    case 'randomize':
      kwami.value.avatar.randomize();
      window.dispatchEvent(new CustomEvent('kwami:randomized'));
      break;
    case 'switchRenderer':
      const renderer = kwami.value.avatar.getRendererType();
      switchRenderer(renderer === 'blob' ? 'crystal' : 'blob');
      break;
    case 'cycleState':
      const states = ['idle', 'listening', 'thinking'] as const;
      const current = kwami.value.getState() || 'idle';
      const currentIndex = states.indexOf(current as typeof states[number]);
      const nextIndex = (currentIndex + 1) % states.length;
      const nextState = states[nextIndex] || 'idle';
      kwami.value.setState(nextState);
      window.dispatchEvent(new CustomEvent('kwami:stateChanged', { detail: nextState }));
      break;
    case 'pulse':
      // Pulse effect is handled by the click touch point system
      break;
  }
}

// Test action button
function testAction(action: InteractionAction) {
  executeAction(action);
}

// Note: Interaction config is now stored in the Pinia store (interactionStore)
// and persists across panel switches and renderer changes
</script>

<template>
  <div class="panel-inner">
    <div class="panel-header">
      <iconify-icon icon="ph:cursor-click-duotone" class="panel-icon"></iconify-icon>
      <h2>Interaction</h2>
    </div>

    <div class="panel-body">
      <!-- Click Actions -->
      <PanelSection title="Click Actions">
        <div class="interaction-row">
          <div class="interaction-header">
            <iconify-icon icon="ph:hand-tap-duotone"></iconify-icon>
            <span>Single Click</span>
            <BaseToggle v-model="state.click.enabled" size="sm" />
          </div>
          <div class="interaction-config" v-if="state.click.enabled">
            <BaseSelect
              label="Action"
              v-model="state.click.action"
              :options="actionOptions"
            />
            <button class="test-btn" @click="testAction(state.click.action)" title="Test Action">
              <iconify-icon icon="ph:play-fill"></iconify-icon>
            </button>
          </div>
        </div>

        <div class="interaction-row">
          <div class="interaction-header">
            <iconify-icon icon="ph:hand-duotone"></iconify-icon>
            <span>Double Click</span>
            <BaseToggle v-model="state.doubleClick.enabled" size="sm" />
          </div>
          <div class="interaction-config" v-if="state.doubleClick.enabled">
            <BaseSelect
              label="Action"
              v-model="state.doubleClick.action"
              :options="actionOptions"
            />
            <button class="test-btn" @click="testAction(state.doubleClick.action)" title="Test Action">
              <iconify-icon icon="ph:play-fill"></iconify-icon>
            </button>
          </div>
        </div>

        <div class="interaction-row">
          <div class="interaction-header">
            <iconify-icon icon="ph:mouse-right-click-duotone"></iconify-icon>
            <span>Right Click</span>
            <BaseToggle v-model="state.rightClick.enabled" size="sm" />
          </div>
          <div class="interaction-config" v-if="state.rightClick.enabled">
            <BaseSelect
              label="Action"
              v-model="state.rightClick.action"
              :options="actionOptions"
            />
            <button class="test-btn" @click="testAction(state.rightClick.action)" title="Test Action">
              <iconify-icon icon="ph:play-fill"></iconify-icon>
            </button>
          </div>
        </div>

        <div class="interaction-row">
          <div class="interaction-header">
            <iconify-icon icon="ph:mouse-duotone"></iconify-icon>
            <span>Double Right Click</span>
            <BaseToggle v-model="state.doubleRightClick.enabled" size="sm" />
          </div>
          <div class="interaction-config" v-if="state.doubleRightClick.enabled">
            <BaseSelect
              label="Action"
              v-model="state.doubleRightClick.action"
              :options="actionOptions"
            />
            <button class="test-btn" @click="testAction(state.doubleRightClick.action)" title="Test Action">
              <iconify-icon icon="ph:play-fill"></iconify-icon>
            </button>
          </div>
        </div>
      </PanelSection>

      <!-- Drag Settings -->
      <PanelSection title="Drag Behavior">
        <div class="setting-row">
          <BaseToggle label="Enable Drag" v-model="state.drag.enabled" />
        </div>
        <div v-if="state.drag.enabled" class="drag-settings">
          <BaseSlider
            label="Sensitivity"
            v-model="state.drag.sensitivity"
            :min="0.1"
            :max="3"
            :step="0.1"
          />
          <BaseToggle label="Rotate on Drag" v-model="state.drag.rotateOnDrag" />
        </div>
      </PanelSection>

      <!-- Hover Settings -->
      <PanelSection title="Hover Behavior">
        <div class="setting-row">
          <BaseToggle label="Enable Hover Effects" v-model="state.hover.enabled" />
        </div>
        <div v-if="state.hover.enabled" class="hover-settings">
          <BaseToggle label="Highlight on Hover" v-model="state.hover.highlightOnHover" />
          <BaseSelect
            label="Cursor Style"
            v-model="state.hover.cursorStyle"
            :options="cursorOptions"
          />
        </div>
      </PanelSection>

      <!-- Quick Actions -->
      <PanelSection title="Quick Actions">
        <div class="quick-actions">
          <button class="quick-action-btn" @click="testAction('toggleListening')">
            <iconify-icon icon="ph:microphone-duotone"></iconify-icon>
            <span>Toggle Listen</span>
          </button>
          <button class="quick-action-btn" @click="testAction('randomize')">
            <iconify-icon icon="ph:dice-five-duotone"></iconify-icon>
            <span>Randomize</span>
          </button>
          <button class="quick-action-btn" @click="testAction('switchRenderer')">
            <iconify-icon icon="ph:swap-duotone"></iconify-icon>
            <span>Switch Renderer</span>
          </button>
          <button class="quick-action-btn" @click="testAction('cycleState')">
            <iconify-icon icon="ph:arrows-clockwise-duotone"></iconify-icon>
            <span>Cycle State</span>
          </button>
        </div>
      </PanelSection>
    </div>
  </div>
</template>

<style scoped>
.interaction-row {
  background: var(--surface-1);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 10px;
}

.interaction-row:last-child {
  margin-bottom: 0;
}

.interaction-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.interaction-header iconify-icon {
  font-size: 18px;
  color: var(--accent-primary);
}

.interaction-header span {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.interaction-config {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--glass-border);
}

.interaction-config > :first-child {
  flex: 1;
}

.test-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--accent-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.test-btn:hover {
  background: var(--accent-glow);
  border-color: var(--accent-primary);
  transform: scale(1.05);
}

.setting-row {
  margin-bottom: 12px;
}

.drag-settings,
.hover-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  background: var(--surface-1);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.quick-action-btn:hover {
  background: var(--surface-2);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.quick-action-btn:active {
  transform: translateY(0);
}

.quick-action-btn iconify-icon {
  font-size: 24px;
  color: var(--accent-primary);
}

.quick-action-btn span {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-secondary);
}

.quick-action-btn:hover span {
  color: var(--text-primary);
}
</style>
