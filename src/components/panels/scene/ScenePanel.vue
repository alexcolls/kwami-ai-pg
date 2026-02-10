<script setup lang="ts">
import BasePanel from '@/components/ui/BasePanel.vue';
import { panelIcons } from '@/constants/panel-icons';
import SceneBackground from './SceneBackground.vue';

// Scene background logic is now handled by useSceneBackground composable
// which is initialized in App.vue when Kwami starts.
// This panel is just a UI wrapper for the SceneBackground component.
</script>

<template>
  <BasePanel :icon="panelIcons.scene" title="Scene">
    <SceneBackground />
  </BasePanel>
</template>
