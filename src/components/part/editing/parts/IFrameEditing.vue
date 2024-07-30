<template>
  <q-card-section class="row q-pa-md">
    <div class="col-8 q-gutter-sm">
      <q-input v-model="part.text" outlined autogrow :label="$t('parts.form.description')" />
      <q-input v-model="part.src" outlined class="col-8" :label="$t('parts.form.add.iframe')" />
    </div>
    <div class="col-4">
      <div class="iframe-16-9">
        <iframe :title="part.text" :src="part.src"></iframe>
      </div>
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
  },
);
</script>

<style lang="scss" scoped>
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
  width: 400%;
  height: 400%;
  border: 0; /* no border */
  transform: scale(0.25);
  transform-origin: 0 0;
}
</style>
