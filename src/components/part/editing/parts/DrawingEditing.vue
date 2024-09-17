<template>
  <q-card-section style="height: 80vh">
    <escalidraw-wrapper
      :initial-data="data"
      @change="(elements, appState, files) => changed(elements, files)"
    />
  </q-card-section>
  <q-card-actions>
    <q-space />
    <q-btn
      size="sm"
      icon="switch_access_shortcut_add"
      @click="wizardVisible = true"
    />
  </q-card-actions>
  <drawing-generation-dialog
    v-model="wizardVisible"
    :parts="parts"
    :index="index"
    @drawing="applyDrawing"
  />
</template>

<script setup>
import { ref, watch } from "vue";
import EscalidrawWrapper from "src/components/common/EscalidrawWrapper.vue";
import DrawingGenerationDialog from "src/components/part/editing/DrawingGenerationDialog.vue";

const props = defineProps({
  index: { type: Number, default: 0 },
  parts: { type: Array, required: true },
});

const part = defineModel({ type: Object });

const data = ref();
watch(
  () => props.index,
  () => {
    data.value = JSON.parse(part.value.src || "{}");
  },
  { immediate: true },
);

const changed = (elements, files) => {
  part.value.src = JSON.stringify({ elements, files });
};

let wizardVisible = ref(false);
const applyDrawing = ({ elements, files }) => {
  data.value = { elements, files };
};
</script>
