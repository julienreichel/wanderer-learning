<template>
  <!-- eslint-disable vue/no-v-html -->
  <div id="graph" v-html="graphHtml"></div>
</template>

<script setup>
import { ref, watch } from "vue";
import { instance } from "@viz-js/viz";

// Props
const props = defineProps({
  dot: {
    type: String,
    required: true,
  },
  engine: {
    type: String,
    required: true,
    default: "dot",
  },
});

// Reactive data
const graphHtml = ref("");

// Method to render the graph
const renderGraph = async (dot, engine) => {
  const viz = await instance();
  try {
    const html = await viz.renderSVGElement(dot, { engine });
    graphHtml.value = html.outerHTML;
  } catch (e) {
    console.error(e);
  }
};

// Watch for changes in the dot prop and re-render the graph
watch(
  () => [props.dot, props.engine],
  ([newDot, newEngine]) => {
    console.log("Rendering graph with engine:", newEngine);
    renderGraph(newDot, newEngine);
  },
  { immediate: true },
);
</script>

<style>
#graph {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  height: 100%;
}
</style>
