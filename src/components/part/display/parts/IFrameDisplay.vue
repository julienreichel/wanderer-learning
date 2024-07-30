<template>
  <q-card-section v-if="part.type === 'iframe'" class="q-pa-none">
    <div class="iframe-16-9">
      <iframe :title="part.text" :src="part.src" class="full-width"></iframe>
    </div>
  </q-card-section>
</template>

<script setup>
defineProps({
  part: { type: Object, required: true },
});
</script>

<style scoped>
.iframe-16-9 {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
}
.iframe-16-9 iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0; /* no border */
}
</style>
