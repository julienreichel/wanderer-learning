<template>
  <q-page class="flex q-pa-md">
    <q-splitter v-model="splitterModel" class="full-width full-height">
      <template #before>
        <q-card class="q-pa-md">
          <q-card-section>
            <q-input
              v-model="dotContent"
              type="textarea"
              rows="20"
              label="DOT Language Input"
              debounce="500"
              outlined
              dense
            />
            <q-select
              v-model="selectedEngine"
              :options="engines"
              label="Select Rendering Engine"
              outlined
              dense
              class="q-mt-md"
            />
          </q-card-section>
        </q-card>
      </template>
      <template #after>
        <q-card class="q-pa-md full-height">
          <q-card-section class="full-height">
            <Graphviz
              :dot="dotContent"
              :engine="selectedEngine.value"
              class="full-height"
            />
          </q-card-section>
        </q-card>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import Graphviz from "src/components/charts/GraphWizChart.vue";

// Reactive data
const dotContent = ref(`
  digraph Emotions {
    node [shape=box, style=filled, color=lightblue];
    rankdir=LR;
    overlap=false;

    Emotions [label="Emotions", shape=ellipse, color=lightpink, style=filled];

    // Main Categories
    Anger [label="Anger"];
    Fear [label="Fear"];
    Sadness [label="Sadness"];
    Enjoyment [label="Enjoyment"];
    Disgust [label="Disgust"];

    // Sub-categories for Anger
    Annoyance [label="Annoyance"];
    Frustration [label="Frustration"];
    Hostility [label="Hostility"];
    Rage [label="Rage"];

    // Sub-categories for Fear
    Anxiety [label="Anxiety"];
    Nervousness [label="Nervousness"];
    Terror [label="Terror"];
    Worry [label="Worry"];

    // Sub-categories for Sadness
    Disappointment [label="Disappointment"];
    Misery [label="Misery"];
    Regret [label="Regret"];
    Sorrow [label="Sorrow"];

    // Sub-categories for Enjoyment
    Amusement [label="Amusement"];
    Contentment [label="Contentment"];
    Joy [label="Joy"];
    Pride [label="Pride"];

    // Sub-categories for Disgust
    Contempt [label="Contempt"];
    Disapproval [label="Disapproval"];
    Loathing [label="Loathing"];
    Revulsion [label="Revulsion"];

    // Connections
    Emotions -> Anger;
    Emotions -> Fear;
    Emotions -> Sadness;
    Emotions -> Enjoyment;
    Emotions -> Disgust;

    Anger -> Annoyance;
    Anger -> Frustration;
    Anger -> Hostility;
    Anger -> Rage;

    Fear -> Anxiety;
    Fear -> Nervousness;
    Fear -> Terror;
    Fear -> Worry;

    Sadness -> Disappointment;
    Sadness -> Misery;
    Sadness -> Regret;
    Sadness -> Sorrow;

    Enjoyment -> Amusement;
    Enjoyment -> Contentment;
    Enjoyment -> Joy;
    Enjoyment -> Pride;

    Disgust -> Contempt;
    Disgust -> Disapproval;
    Disgust -> Loathing;
    Disgust -> Revulsion;
}
`);

// Reactive data for rendering engine
const selectedEngine = ref("dot");
const engines = ref([
  { label: "Dot", value: "dot" },
  { label: "Circo", value: "circo" },
  { label: "Neato", value: "neato" },
  { label: "Force-Directed Placement", value: "fdp" },
  { label: "Scalable Force-Directed Placement", value: "sfdp" },
  { label: "Radial Layout", value: "twopi" },
]);

// Splitter model
const splitterModel = ref(50);
</script>

<style scoped>
#graph {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  height: 100%;
}
</style>
