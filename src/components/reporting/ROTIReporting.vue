<template>
  <q-icon size="lg" color="primary" :name="icon">
    <q-tooltip anchor="center right" self="center middle">{{ roti }}</q-tooltip>
  </q-icon>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  roti: { type: Number, default: 3 },
});

const icon = computed(() => {
  if (props.roti < 1.5) return "sentiment_very_dissatisfied";
  if (props.roti < 2.5) return "sentiment_dissatisfied";
  if (props.roti < 3.5) return "sentiment_neutral";
  if (props.roti < 4.5) return "sentiment_satisfied";
  return "sentiment_very_satisfied";
});
</script>
