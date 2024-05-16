<template>
  <q-card-section v-if="stepsSummary" class="q-pa-sm text-right">
    <q-circular-progress
      show-value
      size="xl"
      color="primary"
      :max="steps.length"
      :value="stepsSummary.length"
    >
      {{ stepsSummary.length }}/{{ steps.length }}
    </q-circular-progress>
    <br />
    <q-badge :label="totalTime" />
    <points-per-step-polar-chart :labels="chartLabel" :series="chartSerie" />
  </q-card-section>
</template>

<script setup>
import PointsPerStepPolarChart from 'src/components/charts/PointsPerStepPolarChar.vue';
import { computed, inject } from 'vue';
const { stepReporting: reportingService } = inject('services');

const props = defineProps({
  stepsSummary: { type: Object },
  steps: { type: Array },
});

const chartLabel = computed(() => {
  return props.steps.map((step) => step.title);
});

const chartSerie = computed(() => {
  if (!props.stepsSummary?.length) return [];

  const stepsSerie = props.steps.map((step) =>
    reportingService.computePointsPerStep(step, props.stepsSummary)
  );
  return stepsSerie.map(
    ({ averagePoints }) => Math.round(averagePoints * 10) / 10
  );
});

const totalTime = computed(() => {
  if (!props.stepsSummary?.length) return;
  const times = props.stepsSummary.map((item) => {
    return item.reportings.reduce(
      (acc, reporting) => acc + reporting.time,
      0
    );
  });
  const totalTime = times.reduce((acc, item) => acc + item, 0);
  if (totalTime < 60) {
    return totalTime + ' sec';
  } else {
    return Math.round(totalTime / 60) + ' min';
  }
});
</script>
