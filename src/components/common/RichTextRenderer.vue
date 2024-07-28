<template>
  <!-- eslint-disable vue/no-v-html -->
  <div ref="contentContainer" v-html="renderedHtml"></div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import mermaid from "mermaid";

import { useFormatter } from "src/composables/iris";
const { renderKatex } = useFormatter();

const props = defineProps({
  htmlContent: {
    type: String,
    required: true,
  },
});

let renderedHtml = ref();
mermaid.initialize({ startOnLoad: true, theme: "forest", });

const contentContainer = ref(null);
const render = async () => {
  renderedHtml.value = renderKatex(props.htmlContent);
  nextTick(async () => {
    await mermaid.run({
      querySelector: "mermaid, .language-mermaid",
    });
  });
};

onMounted(render);
watch(() => props.htmlContent, render);
</script>

<style scoped>
.content-container {
  overflow: auto;
}
</style>
