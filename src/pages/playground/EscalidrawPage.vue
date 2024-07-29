<template>
  <q-page class="flex q-pa-md">
    <q-card class="q-pa-md full-width">
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
import { ref } from "vue";
import EscalidrawWrapper from "src/components/common/EscalidrawWrapper.vue";

import { useIris } from "src/composables/iris";
const { $q } = useIris();
// Reactive data
const data = $q.localStorage.getItem("excalidraw");
const excalidrawData = ref(data || null);

const changed = (elements, appState, files) => {
  $q.localStorage.set("excalidraw", { elements, files });
};
</script>
