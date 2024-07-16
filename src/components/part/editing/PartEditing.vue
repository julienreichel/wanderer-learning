<template>
  <q-card>
    <q-card-section v-if="part.type === 'text'" horizontal>
      <rich-text-editing v-model="part.text" :class="textSizeClass">
      </rich-text-editing>
      <q-card-section
        v-if="part.url && !uploadingFile"
        :class="imageSizeClass"
        class="q-pa-none"
      >
        <q-img class="col" fit="scale-down" :src="part.url" />

        <q-card-actions>
          <q-btn-toggle
            v-model="part.options.imageSize"
            size="sm"
            toggle-color="primary"
            :options="[
              { label: '2|4', value: '8' },
              { label: '3|3', value: '6' },
              { label: '4|2', value: '4' },
            ]"
          />
          <q-btn size="sm" icon="edit" @click="uploadingFile = true" />
          <q-btn size="sm" icon="delete" @click="removeImage()" />
        </q-card-actions>
      </q-card-section>
      <file-uploader v-else :prefix="lectureId" @uploaded="uploaded" />
    </q-card-section>
    <q-card-section v-if="part.type === 'img'" class="row">
      <div class="col-6 q-gutter-sm">
        <q-input
          v-model="part.text"
          outlined
          autogrow
          :label="$t('parts.form.description')"
        />
        <div class="col-12">
          <file-uploader
            class="full-width full-height"
            :prefix="lectureId"
            @uploaded="uploaded"
          />
        </div>
      </div>
      <q-img class="col" :ratio="16 / 9" fit="scale-down" :src="part.url" />
    </q-card-section>
    <q-card-section
      v-if="part.type === 'video'"
      class="row q-pa-md q-col-gutter-sm"
    >
      <div class="col-8 q-gutter-sm">
        <q-input
          v-model="part.text"
          outlined
          autogrow
          :label="$t('parts.form.description')"
        />
        <q-input
          v-model="part.src"
          outlined
          class="col-8"
          :label="$t('parts.form.add.video')"
        />
      </div>
      <div class="col-4">
        <q-video :ratio="16 / 9" :src="part.src" />
      </div>
    </q-card-section>
    <q-card-section
      v-if="part.type === 'iframe'"
      class="row q-pa-md q-col-gutter-sm"
    >
      <div class="col-8 q-gutter-sm">
        <q-input
          v-model="part.text"
          outlined
          autogrow
          :label="$t('parts.form.description')"
        />
        <q-input
          v-model="part.src"
          outlined
          class="col-8"
          :label="$t('parts.form.add.iframe')"
        />
      </div>
      <div class="col-4">
        <div class="iframe-16-9">
          <iframe :title="part.text" :src="part.src"></iframe>
        </div>
      </div>
    </q-card-section>
    <question-editing v-if="part.type === 'quiz'" v-model="part.questions[0]" />
  </q-card>
</template>

<script setup>
import { ref, inject, computed, watch } from "vue";

import RichTextEditing from "../../common/RichTextEditing.vue";
import QuestionEditing from "./QuestionEditing.vue";
import FileUploader from "../../common/FileUploader.vue";

const { storage: storageService } = inject("services");

const part = defineModel({ type: Object });
part.value.options = part.value.options || {};
part.value.options.imageSize = part.value.options.imageSize || "4";

defineProps({
  lectureId: { type: String, required: true },
});

const textSizeClass = computed(() =>
  part.value.url && !uploadingFile.value
    ? "col-" + (12 - Number(part.value.options.imageSize))
    : "col-10",
);
const imageSizeClass = computed(() =>
  part.value.url && !uploadingFile.value
    ? "col-" + part.value.options.imageSize
    : "col-2",
);
const uploadingFile = ref(false);

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
const removeImage = () => {
  if (part.value.src && !part.value.src.startsWith("http")) {
    storageService.removeImg(part.value.src);
  }
  part.value.url = null;
  part.value.src = null;
};

const uploaded = async (files) => {
  const file = files[0];
  removeImage();
  // remove the extension from the name
  const name = file.name.replace(/\.[^.]+$/, "");
  part.value.text = part.value.text ? part.value.text : name;
  part.value.src = file?.path;
  part.value.url = file?.url;
};
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
