<template>
  <q-page class="flex q-pa-md">
    <q-card class="q-pa-md full-width">
      <q-card-section class="full-height">
        <ExcalidrawComponent
          :initial-data="excalidrawData"
          class="full-height"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import ExcalidrawComponent from "src/components/charts/EscalidrawEditor.vue";

// Reactive data
const excalidrawData = ref("");

</script>

