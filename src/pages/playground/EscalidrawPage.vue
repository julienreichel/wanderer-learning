<template>
  <q-page class="row q-pa-md">
    <q-card class="q-pa-md col-3">
      <q-card-section>
        <q-select
          v-model="selectedOption"
          :options="options"
          label="Select an option"
          dense
          borderless
          emit-value
          map-options
          options-dense
          style="min-width: 150px"
        />
        <json-editor v-model="jsonText" v-bind="editorOptions"></json-editor>
        <q-btn
          label="Apply Changes"
          color="primary"
          class="q-mt-md"
          @click="applyChanges"
        />
      </q-card-section>
    </q-card>
    <q-card class="q-pa-md col-9">
      <q-card-section class="full-height">
        <escalidraw-wrapper
          :initial-data="excalidrawData"
          @change="
            (elements, appState, files) => changed(elements, appState, files)
          "
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import JsonEditor from "json-editor-vue";
import EscalidrawWrapper from "src/components/common/EscalidrawWrapper.vue";

import { ref, watch, inject } from "vue";

const { excalidraw: excalidrawService } = inject("services");

import { useIris } from "src/composables/iris";
const { $q } = useIris();
// Reactive data
const data = $q.localStorage.getItem("excalidraw");
const excalidrawData = ref(data || null);

const selectedOption = ref(null);
const options = ref([
  { label: "Bulleyes", value: "bullsEyes" },
  { label: "Podium", value: "podium" },
  { label: "Timeline", value: "timeline" },
  { label: "Pyramid", value: "pyramid" },
  { label: "Matrix", value: "matrix" },
  { label: "Funnel", value: "funnel" },
  { label: "Cycle", value: "cycle" },
  { label: "Pillars", value: "pillars" },
]);

watch(selectedOption, (value) => {
  if (value === "bullsEyes" || value === "timeline" || value === "pyramid" || value === "funnel" || value === "cycle") {
    jsonText.value = {
      text: ['1st', '2nd', '3rd', '4th', '5th'],
    }
  }

  if (value === "podium" || value === "pillars") {
    jsonText.value = {
      text: ['1st', '2nd', '3rd'],
    }
  }

  if (value === "pillars") {
    jsonText.value.roof = "Roof";
    jsonText.value.base = "Base";
  }

  if (value === "matrix") {
    jsonText.value = {
      text: ['NW', 'NE', 'SW', 'SE'],
      axis: { x :['West', 'East'], y: ['North', 'South']},
    }
  }

});
const jsonText = ref({});
const editorOptions = ref({
  mode: "tree", // or 'tree', 'view'
  mainMenuBar: false,
  navigationBar: false,
  statusBar: false,
  onChange: () => {
    changed.value = true;
  },
  onRenderLineNumbers: () => {
    console.log("Line numbers rendered");
  },
});

const applyChanges = () => {
  let elements = [];
  elements = excalidrawService[selectedOption.value](jsonText.value);

  excalidrawData.value = { elements };
  // Logic to apply changes
  console.log("Changes applied:", elements);
};

const changed = (elements, appState, files) => {
  $q.localStorage.set("excalidraw", { elements, files });
};
</script>
