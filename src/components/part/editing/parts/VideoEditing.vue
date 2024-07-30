<template>
  <q-card-section class="row q-pa-md">
    <div class="col-8 q-gutter-sm">
      <q-input v-model="part.text" outlined autogrow :label="$t('parts.form.description')" />
      <q-input v-model="part.src" outlined class="col-8" :label="$t('parts.form.add.video')" />
    </div>
    <div class="col-4">
      <q-video :ratio="16 / 9" :src="part.src" />
    </div>
  </q-card-section>
</template>

<script setup>
import { watch } from "vue";
const part = defineModel({ type: Object });

watch(
  () => part.value.src,
  () => {
    // if the src is "<iframe..." we extract the url part and drop the rest
    if (part.value.src && part.value.src.startsWith("<iframe")) {
      const src = part.value.src.match(/src="([^"]*)"/);
      part.value.src = src ? src[1] : "";
    }
    // for youtube videos we extract the video id and build the embed url
    if (
      part.value.src &&
      part.value.src.includes("youtube.com") &&
      !part.value.src.includes("embed")
    ) {
      const videoId = part.value.src.match(/v=([^&]*)/);
      part.value.src = videoId
        ? `https://www.youtube.com/embed/${videoId[1]}`
        : "";
    }
  },
);
</script>
