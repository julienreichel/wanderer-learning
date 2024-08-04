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
mermaid.initialize({ startOnLoad: true, theme: "forest" });
// Function to decode HTML entities
function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

const contentContainer = ref(null);
const render = async () => {
  if (!props.htmlContent) {
    return;
  }
  const html = renderKatex(props.htmlContent);

  // Extract the SVG code from the string
  renderedHtml.value = html.replace(/<code class="language-svg">([\s\S]*?)<\/code>/g, (match, code) => {
    return decodeHTMLEntities(code);
  });

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
