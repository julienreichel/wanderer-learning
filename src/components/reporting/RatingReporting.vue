<template>
  <q-rating
    :model-value="stars"
    size="xs"
    color="primary"
    icon="star_border"
    icon-selected="star"
    icon-half="star_half"
    readonly
  >
  </q-rating>
  <q-tooltip anchor="center right" self="center middle">{{ stars }}</q-tooltip>
</template>

<script setup>
const props = defineProps({
  stars: { type: Number },
});
</script>
