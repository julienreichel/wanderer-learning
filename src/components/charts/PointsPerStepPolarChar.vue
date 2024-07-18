<template>
  <apexchart
    :width="size"
    :height="size"
    :options="{ ...chartOptions, labels }"
    :series="series"
  ></apexchart>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  labels: { type: Array, required: true },
  series: { type: Array, required: true },
  size: { type: Number, default: 150 },
});

const chartOptions = ref({
  chart: {
    type: "polarArea",
    parentHeightOffset: 0,
  },
  legend: {
    show: false,
  },
  yaxis: {
    show: false,
  },
  plotOptions: {
    polarArea: {
      rings: {
        strokeWidth: 0,
      },
      spokes: {
        strokeWidth: 0,
      },
    },
  },
  stroke: {
    width: 1,
    colors: undefined,
  },
  theme: {
    monochrome: {
      enabled: true,
      color: "#1976D2",
      shadeTo: "light",
      shadeIntensity: 0.6,
    },
  },
});
</script>
