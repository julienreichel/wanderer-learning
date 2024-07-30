<template>
  <q-img
    :ratio="16 / 9"
    fit="scale-down"
    :src="part.url"
  />
</template>

<script setup>
defineProps({
  part: { type: Object, required: true },
});
</script>
