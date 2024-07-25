<template>
  <!-- eslint-disable vue/no-v-html -->
  <code ref="mermaidContainer" class="mermaid" v-html="diagramHtml"></code>
</template>

<script setup>
import { ref, watch } from "vue";
import mermaid from "mermaid";

// Props
const props = defineProps({
  mermaidCode: {
    type: String,
    required: true,
  },
});

// Reactive data
const diagramHtml = ref("");
const mermaidContainer = ref(null);

mermaid.initialize({
  startOnLoad: true,
  theme: "forest",
});

// Method to render the diagram
const renderDiagram = async (code) => {
  try {
    const type = mermaid.detectType(code);
    console.log(type); // 'sequence'
  } catch (error) {
    console.error(error);
    return;
  }
  const { svg } = await mermaid.render("theGraph", code);
  diagramHtml.value = svg;
  /*
  diagramHtml.value = code;
  nextTick(async () => {
    console.log("Rendering mermaid diagram");
    await mermaid.run({
      querySelector: ".mermaid",
    });
  });
  */
};

// Watch for changes in the mermaidCode prop and re-render the diagram
watch(
  () => props.mermaidCode,
  (newVal) => {
    renderDiagram(newVal);
  },
  { immediate: true },
);

</script>

<style scoped>
#mermaidContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  height: 100%;
}
</style>
