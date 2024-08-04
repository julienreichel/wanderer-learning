<template>
  <q-card-section>
    <q-card class="q-pa-md full-height">
      <q-card-section class="full-height">
        <FunctionPlotter :function-string="part.src" />
      </q-card-section>
    </q-card>
  </q-card-section>
</template>

<script setup>
import FunctionPlotter from "src/components/charts/FunctionPlotterChart.vue";
defineProps({
  part: { type: Object, required: true },
});
</script>
