<script setup lang="ts">
import { ref, computed } from 'vue';
import { useKwamiActions } from '@/composables/useKwamiActions';
import KwamiSelector from '@/components/sidebar/KwamiSelector.vue';
import NewKwamiModal from '@/components/sidebar/NewKwamiModal.vue';
import EditKwamiModal from '@/components/sidebar/EditKwamiModal.vue';
import DeleteKwamiConfirm from '@/components/sidebar/DeleteKwamiConfirm.vue';

const kwamiActions = useKwamiActions();
const kwamiSelectorRef = ref<InstanceType<typeof KwamiSelector> | null>(null);

const showNewKwamiModal = computed(() => kwamiActions.showNewKwamiModal.value);
const showEditKwamiModal = computed(() => kwamiActions.showEditKwamiModal.value);
const showDeleteConfirm = computed(() => kwamiActions.showDeleteConfirm.value);
const editKwami = computed(() => kwamiActions.editKwami.value);
const deleteKwamiName = computed(() => kwamiActions.deleteKwamiName.value);
const activeWorkspaceColors = computed(() => kwamiActions.activeWorkspace.value?.colors);

async function onNewConfirm(payload: {
  name: string;
  randomize: boolean;
  colors: { x: string; y: string; z: string };
}) {
  await kwamiActions.onNewConfirm(payload);
  kwamiSelectorRef.value?.scrollListToBottom();
}
</script>

<template>
  <KwamiSelector
    ref="kwamiSelectorRef"
    @add-click="kwamiActions.openAdd"
    @edit-click="kwamiActions.openEdit"
  />

  <NewKwamiModal
    :open="showNewKwamiModal"
    :initial-colors="activeWorkspaceColors"
    @close="kwamiActions.closeNew"
    @confirm="onNewConfirm"
  />

  <EditKwamiModal
    :open="showEditKwamiModal"
    :kwami="editKwami"
    @close="kwamiActions.closeEdit"
    @save="kwamiActions.onEditSave"
    @delete="kwamiActions.openDeleteFromEdit"
  />

  <DeleteKwamiConfirm
    :open="showDeleteConfirm"
    :kwami-name="deleteKwamiName"
    @confirm="kwamiActions.onDeleteConfirm"
    @cancel="kwamiActions.closeDelete"
  />
</template>
