<template>
  <apexchart
    :width="width"
    :height="height"
    :options="{ ...chartOptions, xaxis: { ...chartOptions.xaxis, categories } }"
    :series="[{ name: 'Usage', data }]"
  ></apexchart>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  serie: { type: Array, required: true },
  width: { type: Number, default: 200 },
  height: { type: Number, default: 200 },
});

const data = computed(() => {
  return props.serie.map(({ value }) => value);
});

const categories = computed(() => {
  return props.serie.map(({ key }) => key);
});

const chartOptions = ref({
  chart: {
    type: "bar",
    toolbar: {
      show: false,
    },
  },
  legend: {
    show: false,
  },
  yaxis: {
    show: false,
  },
  xaxis: {
    labels: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      dataLabels: {
        position: "top",
      },
    },
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
