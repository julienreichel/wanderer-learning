<template>
  <q-card-section style="height: 70vh">
    <escalidraw-wrapper
      :data="data"
      view-mode-enabled
      zen-mode-enabled
    />
  </q-card-section>
</template>

<script setup>
import { computed } from "vue";
import EscalidrawWrapper from "src/components/common/EscalidrawWrapper.vue";

const props = defineProps({
  part: { type: Object, required: true },
});

const data = computed(() => JSON.parse(props.part.src));
</script>
