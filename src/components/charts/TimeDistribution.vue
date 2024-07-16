<template>
  <apexchart
    :style="{ marginRight: '-16px' }"
    :width="size"
    :height="size"
    :options="chartOptions"
    :series="serie"
  ></apexchart>
</template>

<script setup>
import { ref } from "vue";
import { useIris } from "src/composables/iris";
const { t } = useIris();

const chartOptions = ref({
  chart: {
    type: "pie",
  },
  labels: [
    t("reporting.graphs.time_distribution.labels.too_short"),
    t("reporting.graphs.time_distribution.labels.good_time"),
    t("reporting.graphs.time_distribution.labels.long_time"),
    t("reporting.graphs.time_distribution.labels.too_long"),
  ],
  colors: ["#F2C037", "#1976D2", "#26A69A", "#C10015"],
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    pie: {
      dataLabels: {
        offset: -5,
      },
    },
  },
});
</script>
