<template>
  <div ref="mermaidContainer"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import mermaid from 'mermaid';

const props = defineProps({
  chart: {
    type: String,
    required: true
  }
});

const mermaidContainer = ref(null);

const renderMermaid = () => {
  mermaid.initialize({ startOnLoad: true });
  mermaid.render('mermaidChart', props.chart, (svgCode) => {
    mermaidContainer.value.innerHTML = svgCode;
  });
};

onMounted(renderMermaid);
watch(() => props.chart, renderMermaid);
</script>

<style scoped>
.mermaid-container {
  overflow: auto;
}
</style>
