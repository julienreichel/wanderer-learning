<template>
  <q-card-section style="height: 80vh">
    <escalidraw-wrapper
      :initial-data="data"
      @change="
        (elements, appState, files) => changed(elements, appState, files)
      "
    />
  </q-card-section>
</template>

<script setup>
import { ref, watch } from "vue";
import EscalidrawWrapper from "src/components/common/EscalidrawWrapper.vue";

const props = defineProps({
  index: { type: Number, default: 0 },
});

const part = defineModel({ type: Object });

const data = ref();
watch(() => props.index, () => {
  data.value = JSON.parse(part.value.src || "{}");
}, { immediate: true });

const changed = (elements) => {
  part.value.src = JSON.stringify({ elements });
};
</script>
