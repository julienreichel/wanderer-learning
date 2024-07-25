<template>
  <!-- eslint-disable vue/no-v-html -->
  <div id="graph" v-html="graphHtml"></div>
</template>

<script setup>
import { ref, watch } from "vue";
import Viz from "viz.js";
import { Module, render } from "viz.js/full.render.js";

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
  const viz = new Viz({ Module, render });
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
