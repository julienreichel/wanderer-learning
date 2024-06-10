<template>
  <q-icon size="lg" name="speed" :color="color">
    <q-tooltip anchor="center right" self="center middle">{{
      difficulty
    }}</q-tooltip>
  </q-icon>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  difficulty: { type: Number },
});

const color = computed(() => {
  if (props.difficulty <= 1.7) return "lime";
  if (props.difficulty <= 2.5) return "light-green";
  if (props.difficulty <= 3.5) return "green";
  if (props.difficulty <= 4.3) return "teal";
  return "purple";
});
</script>
