<template>
  <q-card-section style="height: 80vh;">
      <escalidraw-wrapper
        :initial-data="data"
        @change="
          (elements, appState, files) => changed(elements, appState, files)
        "
      />
  </q-card-section>
</template>

<script setup>
import { computed } from "vue";
import EscalidrawWrapper from "src/components/common/EscalidrawWrapper.vue";

const part = defineModel({ type: Object });

const data = computed(() => JSON.parse(part.value.src || "{}"));

const changed = (elements, appState) => {
  console.log("changed", appState);
  part.value.src = JSON.stringify({ elements });
};

</script>
