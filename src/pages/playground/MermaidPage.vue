<template>
  <q-page class="flex q-pa-md">
    <q-splitter v-model="splitterModel" class="full-width full-height">
      <template #before>
        <q-card class="q-pa-md">
          <q-card-section>
            <q-input
              v-model="mermaidContent"
              type="textarea"
              rows="20"
              label="Mermaid Code Input"
              debounce="500"
              outlined
              dense
            />
          </q-card-section>
        </q-card>
      </template>
      <template #after>
        <q-card class="q-pa-md full-height">
          <q-card-section class="full-height">
            <Mermaid :mermaid-code="mermaidContent" class="full-height" />
          </q-card-section>
        </q-card>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import Mermaid from 'src/components/charts/MermaidChart.vue';

// Reactive data
const mermaidContent = ref(`
  mindmap
  root((Emotions))
    Anger
      Annoyance
      Frustration
      Hostility
      Rage
    Fear
      Anxiety
      Nervousness
      Terror
      Worry
    Sadness
      Disappointment
      Misery
      Regret
      Sorrow
    Enjoyment
      Amusement
      Contentment
      Joy
      Pride
    Disgust
      Contempt
      Disapproval
      Loathing
      Revulsion
`);

// Splitter model
const splitterModel = ref(50);
</script>

<style scoped>
#mermaidContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  height: 100%;
}
</style>
