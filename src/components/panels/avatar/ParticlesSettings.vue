<script setup lang="ts">
import { useKwami } from '@/composables/useKwami';
import PanelSection from '@/components/ui/PanelSection.vue';
import BaseSlider from '@/components/ui/BaseSlider.vue';
import BaseColorPicker from '@/components/ui/BaseColorPicker.vue';
import BaseToggle from '@/components/ui/BaseToggle.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import type { ParticlesState, InteractionAction } from '@/stores/avatar';
import AudioVisualizer from '../audio/AudioVisualizer.vue';
import MicrophoneControl from '../audio/MicrophoneControl.vue';
import { watch, onMounted } from 'vue';

// Use defineModel for proper two-way binding (Vue 3.3+)
const state = defineModel<ParticlesState>('state', { required: true });
const { kwami, switchRenderer } = useKwami();

// Interaction Logic
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
      switchRenderer(renderer === 'blob' ? 'crystal' : 'blob'); // Should cycle through particles too?
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
      const particles = kwami.value.avatar.getParticles();
      if (particles) particles.triggerPulse?.(); // Assuming triggerPulse exists or will be added
      break;
    case 'moveToClick':
      // Not implemented for Particles yet
      break;
  }
}

function testAction(action: InteractionAction) {
  executeAction(action);
}

// Watchers for Interaction
watch(() => state.value.interaction, (config) => {
  const particles = kwami.value?.avatar.getParticles();
  if (!particles) return;

  // Apply click handlers - assume particles renderer has similar API or we extend it
  if ((particles as any).onClick !== undefined) {
      if (config.click.enabled && config.click.action !== 'none') {
        (particles as any).onClick = () => executeAction(config.click.action);
      } else {
        (particles as any).onClick = () => {};
      }
  }

  // Double click
  if ((particles as any).onDoubleClick !== undefined) {
      if (config.doubleClick.enabled && config.doubleClick.action !== 'none') {
        (particles as any).onDoubleClick = () => executeAction(config.doubleClick.action);
      } else {
        (particles as any).onDoubleClick = () => {};
      }
  }

  // Right click
  if ((particles as any).setRightClickCallback !== undefined) {
      if (config.rightClick.enabled && config.rightClick.action !== 'none') {
        (particles as any).setRightClickCallback(() => executeAction(config.rightClick.action));
      } else {
        (particles as any).setRightClickCallback(() => {});
      }
  }
}, { deep: true, immediate: true });

// Audio Helpers
function getParticles() {
  return kwami.value?.avatar.getParticles();
}

function getScene() {
  return kwami.value?.avatar.getScene();
}

// Watchers for Audio Effects
watch(() => state.value.audioEffects, (s) => {
  const particles = getParticles();
  if (particles) {
    particles.setAudioEffects(s);
  }
}, { deep: true, immediate: true });

// Watchers for Scene (Camera & Lighting)
watch(
  () => state.value.scene.camera.fov,
  (v) => {
    const s = getScene();
    if (s) {
      s.camera.fov = v;
      s.camera.updateProjectionMatrix();
    }
  }
);

watch(
  () => state.value.scene.camera.distance,
  (v) => {
    const s = getScene();
    if (s) {
      s.camera.position.z = v;
      s.camera.lookAt(0, 0, 0);
    }
  }
);

function updateAvatarLighting() {
  const particles = getParticles();
  if (!particles) return;
  
  // Particles might not support light positioning in the same way, but if they do:
  if (typeof (particles as any).setLightPosition === 'function') {
    const { top, bottom } = state.value.scene.lighting;
    const topWeight = top;
    const bottomWeight = bottom;
    const totalWeight = topWeight + bottomWeight + 0.01;
    
    const y = ((topWeight * 500) - (bottomWeight * 500)) / totalWeight;
    const z = ((topWeight * 2000) + (bottomWeight * 400)) / totalWeight;
    
    (particles as any).setLightPosition(0, y, z);
  }
}

function updateAvatarGlow() {
  const particles = getParticles();
  if (!particles) return;
  
  if (typeof (particles as any).setLightIntensity === 'function') {
    const ambient = state.value.scene.lighting.ambient;
    const glowIntensity = ambient * 1.25;
    (particles as any).setLightIntensity(glowIntensity);
  }
}

watch(
  () => state.value.scene.lighting.top,
  (v) => {
    const s = getScene();
    if (s) s.lights.top.intensity = v;
    updateAvatarLighting();
  }
);

watch(
  () => state.value.scene.lighting.bottom,
  (v) => {
    const s = getScene();
    if (s) s.lights.bottom.intensity = v;
    updateAvatarLighting();
  }
);

watch(
  () => state.value.scene.lighting.ambient,
  (v) => {
    const s = getScene();
    if (s) s.lights.ambient.intensity = v;
    updateAvatarGlow();
  }
);

// Initial sync on mount
onMounted(() => {
  const s = getScene();
  if (s) {
    updateAvatarLighting();
    updateAvatarGlow();
  }
});
</script>

<template>
  <div class="particles-settings">
    
    <!-- Appearance Section -->
    <PanelSection title="Appearance" collapsible>
      <!-- Formation -->
      <div class="subsection">
        <div class="subsection-header">
          <span class="subsection-title">Formation</span>
        </div>
        <div class="formation-selector">
          <label
            v-for="form in ['sphere', 'disc', 'ring', 'cube']"
            :key="form"
            class="formation-option"
            :class="{ active: state.formation.type === form }"
          >
            <input type="radio" :value="form" v-model="state.formation.type" />
            <iconify-icon
              :icon="
                form === 'sphere'
                  ? 'ph:globe-duotone'
                  : form === 'disc'
                    ? 'ph:circle-duotone'
                    : form === 'ring'
                      ? 'ph:circle-notch-duotone'
                      : 'ph:cube-duotone'
              "
              class="formation-icon"
            ></iconify-icon>
            <span class="formation-label">{{ form.charAt(0).toUpperCase() + form.slice(1) }}</span>
          </label>
        </div>
        <div class="slider-group" style="margin-top: 12px">
          <BaseSlider
            label="Radius"
            :min="0.5"
            :max="4"
            :step="0.1"
            v-model="state.formation.radius"
          />
          <BaseSlider
            label="Noise"
            :min="0"
            :max="0.3"
            :step="0.01"
            v-model="state.formation.noise"
          />
        </div>
        <div class="density-selector" style="margin-top: 12px">
          <span class="density-label">Density:</span>
          <div class="density-options">
            <label
              v-for="density in ['uniform', 'center-heavy', 'edge-heavy']"
              :key="density"
              class="density-option"
              :class="{ active: state.formation.density === density }"
            >
              <input type="radio" :value="density" v-model="state.formation.density" />
              <span>{{ density.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Visual -->
      <div class="subsection">
        <div class="subsection-header">
          <span class="subsection-title">Colors</span>
        </div>
        <div class="row-2" style="margin-bottom: 12px">
          <BaseColorPicker label="Color" v-model="state.visual.color" />
          <BaseColorPicker label="Glow Color" v-model="state.visual.glowColor" />
        </div>
      </div>

      <div class="subsection">
        <div class="subsection-header">
          <span class="subsection-title">Properties</span>
        </div>
        <div class="slider-group">
          <BaseSlider
            label="Particle Size"
            :min="0.1"
            :max="2"
            :step="0.05"
            v-model="state.visual.particleSize"
          />
          <BaseSlider
            label="Sharpness"
            :min="0"
            :max="1"
            :step="0.05"
            v-model="state.visual.sharpness"
          />
          <BaseSlider
            label="Size Variation"
            :min="0"
            :max="1"
            :step="0.05"
            v-model="state.visual.sizeVariation"
          />
          <BaseSlider
            label="Opacity"
            :min="0.1"
            :max="1"
            :step="0.05"
            v-model="state.visual.opacity"
          />
          <BaseSlider
            label="Glow Intensity"
            :min="0"
            :max="1"
            :step="0.05"
            v-model="state.visual.glowIntensity"
          />
          <BaseSlider
            label="Brightness Var."
            :min="0"
            :max="0.5"
            :step="0.05"
            v-model="state.visual.brightnessVariation"
          />
        </div>
      </div>
    </PanelSection>

    <!-- Camera & Lighting Section -->
    <PanelSection title="Scene" collapsible>
      <div class="subsection">
        <span class="subsection-title">Camera</span>
        <div class="slider-group">
          <BaseSlider label="FOV" :min="30" :max="150" :step="1" v-model="state.scene.camera.fov" />
          <BaseSlider label="Distance" :min="2" :max="20" :step="0.5" v-model="state.scene.camera.distance" />
        </div>
      </div>
      
      <div class="subsection">
        <span class="subsection-title">Lighting</span>
        <div class="slider-group">
          <BaseSlider label="Top" :min="0" :max="2" :step="0.1" v-model="state.scene.lighting.top" />
          <BaseSlider label="Bottom" :min="0" :max="2" :step="0.1" v-model="state.scene.lighting.bottom" />
          <BaseSlider label="Ambient" :min="0" :max="2" :step="0.1" v-model="state.scene.lighting.ambient" />
        </div>
      </div>
    </PanelSection>

    <!-- Animation Section -->
    <PanelSection title="Animation" collapsible>
      <div class="toggle-row">
        <BaseToggle label="Enable Animations" v-model="state.animation.enabled" />
      </div>
      
      <template v-if="state.animation.enabled">
        <!-- Breathing -->
        <div class="anim-subsection">
          <div class="subsection-header">
            <BaseToggle label="Breathing" v-model="state.animation.breathing.enabled" />
          </div>
          <div v-if="state.animation.breathing.enabled" class="slider-group indent">
            <BaseSlider
              label="Speed"
              :min="0.1"
              :max="3"
              :step="0.1"
              v-model="state.animation.breathing.speed"
            />
            <BaseSlider
              label="Intensity"
              :min="0"
              :max="0.5"
              :step="0.01"
              v-model="state.animation.breathing.intensity"
            />
          </div>
        </div>

        <!-- Floating -->
        <div class="anim-subsection">
          <div class="subsection-header">
            <BaseToggle label="Floating" v-model="state.animation.floating.enabled" />
          </div>
          <div v-if="state.animation.floating.enabled" class="slider-group indent">
            <BaseSlider
              label="Speed"
              :min="0.1"
              :max="2"
              :step="0.05"
              v-model="state.animation.floating.speed"
            />
            <BaseSlider
              label="Amplitude"
              :min="0"
              :max="0.5"
              :step="0.01"
              v-model="state.animation.floating.amplitude"
            />
          </div>
        </div>

        <!-- Rotation -->
        <div class="anim-subsection">
          <div class="subsection-header">
            <BaseToggle label="Auto Rotation" v-model="state.animation.rotation.enabled" />
          </div>
          <div v-if="state.animation.rotation.enabled" class="slider-group indent">
            <BaseSlider
              label="Speed X"
              :min="-0.3"
              :max="0.3"
              :step="0.01"
              v-model="state.animation.rotation.speedX"
            />
            <BaseSlider
              label="Speed Y"
              :min="-0.3"
              :max="0.3"
              :step="0.01"
              v-model="state.animation.rotation.speedY"
            />
            <BaseSlider
              label="Speed Z"
              :min="-0.3"
              :max="0.3"
              :step="0.01"
              v-model="state.animation.rotation.speedZ"
            />
          </div>
        </div>

        <!-- Wave -->
        <div class="anim-subsection">
          <div class="subsection-header">
            <BaseToggle label="Wave" v-model="state.animation.wave.enabled" />
          </div>
          <div v-if="state.animation.wave.enabled" class="slider-group indent">
            <BaseSlider
              label="Speed"
              :min="0.1"
              :max="4"
              :step="0.1"
              v-model="state.animation.wave.speed"
            />
            <BaseSlider
              label="Amplitude"
              :min="0"
              :max="0.3"
              :step="0.01"
              v-model="state.animation.wave.amplitude"
            />
          </div>
        </div>

        <!-- Turbulence -->
        <div class="anim-subsection">
          <div class="subsection-header">
            <BaseToggle label="Turbulence" v-model="state.animation.turbulence.enabled" />
          </div>
          <div v-if="state.animation.turbulence.enabled" class="slider-group indent">
            <BaseSlider
              label="Intensity"
              :min="0"
              :max="0.1"
              :step="0.005"
              v-model="state.animation.turbulence.intensity"
            />
            <BaseSlider
              label="Speed"
              :min="0.1"
              :max="3"
              :step="0.1"
              v-model="state.animation.turbulence.speed"
            />
          </div>
        </div>
      </template>
      <p v-else class="hint">Enable to configure idle animations</p>
    </PanelSection>

    <!-- Interaction Section -->
    <PanelSection title="Interaction" collapsible>
      <!-- Click Actions -->
      <div class="interaction-row">
        <div class="interaction-header">
          <iconify-icon icon="ph:hand-tap-duotone"></iconify-icon>
          <span>Single Click</span>
          <BaseToggle v-model="state.interaction.click.enabled" size="sm" />
        </div>
        <div class="interaction-config" v-if="state.interaction.click.enabled">
          <BaseSelect
            label="Action"
            v-model="state.interaction.click.action"
            :options="actionOptions"
          />
          <button class="test-btn" @click="testAction(state.interaction.click.action)" title="Test Action">
            <iconify-icon icon="ph:play-fill"></iconify-icon>
          </button>
        </div>
      </div>

      <div class="interaction-row">
        <div class="interaction-header">
          <iconify-icon icon="ph:hand-duotone"></iconify-icon>
          <span>Double Click</span>
          <BaseToggle v-model="state.interaction.doubleClick.enabled" size="sm" />
        </div>
        <div class="interaction-config" v-if="state.interaction.doubleClick.enabled">
          <BaseSelect
            label="Action"
            v-model="state.interaction.doubleClick.action"
            :options="actionOptions"
          />
          <button class="test-btn" @click="testAction(state.interaction.doubleClick.action)" title="Test Action">
            <iconify-icon icon="ph:play-fill"></iconify-icon>
          </button>
        </div>
      </div>

      <div class="interaction-row">
        <div class="interaction-header">
          <iconify-icon icon="ph:mouse-right-click-duotone"></iconify-icon>
          <span>Right Click</span>
          <BaseToggle v-model="state.interaction.rightClick.enabled" size="sm" />
        </div>
        <div class="interaction-config" v-if="state.interaction.rightClick.enabled">
          <BaseSelect
            label="Action"
            v-model="state.interaction.rightClick.action"
            :options="actionOptions"
          />
          <button class="test-btn" @click="testAction(state.interaction.rightClick.action)" title="Test Action">
            <iconify-icon icon="ph:play-fill"></iconify-icon>
          </button>
        </div>
      </div>

      <!-- Hover Settings -->
      <div class="hover-settings">
        <div class="interaction-header">
            <iconify-icon icon="ph:cursor-duotone"></iconify-icon>
            <span>Hover Effects</span>
            <BaseToggle v-model="state.interaction.hover.enabled" size="sm" />
        </div>
        <div class="interaction-config" v-if="state.interaction.hover.enabled">
            <BaseToggle label="Highlight" v-model="state.interaction.hover.highlightOnHover" />
            <BaseSelect
                label="Cursor"
                v-model="state.interaction.hover.cursorStyle"
                :options="cursorOptions"
            />
        </div>
      </div>
    </PanelSection>

    <!-- Audio Reactivity Section -->
    <PanelSection title="Audio Reactivity" collapsible>
      <div class="toggle-row">
        <BaseToggle label="Enable Audio Effects" v-model="state.audioEffects.enabled" />
      </div>

      <MicrophoneControl />
      <AudioVisualizer />

      <div v-if="state.audioEffects.enabled" class="slider-group" style="margin-top: 12px">
        <BaseSlider
          label="Reactivity"
          :min="0"
          :max="3"
          :step="0.1"
          v-model="state.audioEffects.reactivity"
        />
        <BaseSlider
          label="Movement Intensity"
          :min="0"
          :max="2"
          :step="0.05"
          v-model="state.audioEffects.movementIntensity"
        />
        
        <div class="subsection-title">Frequency Response</div>
        <BaseSlider
          label="Bass Influence"
          :min="0"
          :max="2"
          :step="0.05"
          v-model="state.audioEffects.bassInfluence"
        />
        <BaseSlider
          label="Mid Influence"
          :min="0"
          :max="2"
          :step="0.05"
          v-model="state.audioEffects.midInfluence"
        />
        <BaseSlider
          label="High Influence"
          :min="0"
          :max="2"
          :step="0.05"
          v-model="state.audioEffects.highInfluence"
        />
        <BaseSlider
          label="Smoothing"
          :min="0.3"
          :max="0.95"
          :step="0.01"
          v-model="state.audioEffects.smoothing"
        />
        <div class="toggle-row">
          <BaseToggle label="Scale Pulse with Bass" v-model="state.audioEffects.scalePulse" />
        </div>
      </div>
      <p v-if="!state.audioEffects.enabled" class="hint">
        Enable to make particles react to audio input
      </p>
    </PanelSection>

    <!-- Physics Section -->
    <PanelSection title="Physics" collapsible>
      <div class="slider-group">
        <BaseSlider
          label="Return Force"
          :min="0.005"
          :max="0.15"
          :step="0.005"
          v-model="state.physics.returnForce"
        />
        <BaseSlider
          label="Damping"
          :min="0.8"
          :max="0.99"
          :step="0.01"
          v-model="state.physics.damping"
        />
        <BaseSlider
          label="Explosion Force"
          :min="1"
          :max="25"
          :step="0.5"
          v-model="state.physics.explosionForce"
        />
        <BaseSlider
          label="Explosion Radius"
          :min="0.5"
          :max="5"
          :step="0.1"
          v-model="state.physics.explosionRadius"
        />
        <BaseSlider
          label="Leader Speed"
          :min="0.005"
          :max="0.05"
          :step="0.002"
          v-model="state.physics.leaderSpeed"
        />
        <BaseSlider
          label="Follow Delay"
          :min="0.002"
          :max="0.05"
          :step="0.002"
          v-model="state.physics.followDelay"
        />
        <BaseSlider
          label="Mouse Influence"
          :min="0"
          :max="5"
          :step="0.1"
          v-model="state.physics.mouseInfluence"
        />
        <BaseSlider
          label="Mouse Repulsion"
          :min="0"
          :max="2"
          :step="0.05"
          v-model="state.physics.mouseRepulsion"
        />
      </div>
    </PanelSection>

    <!-- Transform Section -->
    <PanelSection title="Transform" collapsible>
      <div class="slider-group">
        <BaseSlider label="Scale" :min="0.5" :max="2" :step="0.05" v-model="state.scale" />
        <BaseSlider
          label="Particle Count"
          :min="1000"
          :max="15000"
          :step="500"
          v-model="state.particleCount"
        />
      </div>
      <p class="hint" style="margin-top: 8px">
        Tip: Drag canvas to rotate. Click particles to explode them.
      </p>
    </PanelSection>
  </div>
</template>

<style scoped>
.particles-settings {
  display: flex;
  flex-direction: column;
}

/* Subsection styling */
.subsection {
  margin-bottom: 16px;
}

.subsection:last-child {
  margin-bottom: 0;
}

.subsection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.subsection-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.formation-selector {
  display: flex;
  gap: 6px;
  background: var(--surface-1);
  padding: 4px;
  border-radius: 10px;
}
.formation-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  font-size: 10px;
  font-weight: 500;
}
.formation-option input {
  display: none;
}
.formation-option:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}
.formation-option.active {
  background: var(--surface-3);
  color: var(--text-primary);
  border: 1px solid var(--accent-primary);
}
.formation-icon {
  font-size: 18px;
}
.formation-label {
  text-transform: capitalize;
}

.density-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}
.density-label {
  font-size: 11px;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.density-options {
  display: flex;
  gap: 4px;
  flex: 1;
}
.density-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  background: var(--surface-1);
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: center;
}
.density-option input {
  display: none;
}
.density-option:hover {
  background: var(--surface-2);
}
.density-option.active {
  background: var(--surface-3);
  color: var(--text-primary);
  border: 1px solid var(--accent-primary);
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.slider-group.indent {
  margin-left: 8px;
  padding-left: 12px;
  border-left: 2px solid var(--surface-3);
  margin-top: 8px;
}
.row-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.toggle-row {
  margin-bottom: 4px;
}

.anim-subsection {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--surface-2);
}
.anim-subsection:first-of-type {
  margin-top: 8px;
  padding-top: 0;
  border-top: none;
}
.subsection-header {
  margin-bottom: 4px;
}

.hint {
  margin-top: 8px;
  font-size: 10px;
  color: var(--text-muted);
  font-style: italic;
}

/* Interaction Styles (copied) */
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

.hover-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}
</style>
