<template>
  <apexchart
    :width="width"
    :height="height"
    :options="{ ...chartOptions, xaxis: { ...chartOptions.xaxis, categories } }"
    :series="series"
  ></apexchart>
</template>

<script setup>
import { computed, ref } from "vue";

import { useIris } from "src/composables/iris";
const { t } = useIris();

const props = defineProps({
  serie: { type: Array, required: true },
  width: { type: Number, default: 200 },
  height: { type: Number, default: 200 },
});

const series = computed(() => {
  const series = [
    "novice",
    "beginner",
    "intermediate",
    "advanced",
  ].map((level) => ({ name: t(`course.levels.${level}`), data: [] }));

  props.serie.forEach(({ value }) =>
    series.forEach((serie, idx) =>
      serie.data.push(
        value.difficulties[idx].total
          ? Math.round(
              (value.difficulties[idx].points / value.difficulties[idx].total) *
                10,
            ) / 10
          : undefined,
      ),
    ),
  );
  return series;
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
  dataLabels: {
    enabled: false,
  },
  theme: {
    monochrome: {
      enabled: true,
      color: "#1976D2",
      shadeTo: "dark",
      shadeIntensity: 0.6,
    },
  },
});
</script>
