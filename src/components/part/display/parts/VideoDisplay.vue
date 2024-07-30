<template>
  <q-video :ratio="16 / 9" :src="part.src" />
</template>

<script setup>
defineProps({
  part: { type: Object, required: true },
});
</script>
