<template>
  <q-card>
    <q-card-section horizontal v-if="part.type === 'text'">
      <rich-text-editing :class="textSizeClass" v-model="part.text">
      </rich-text-editing>
      <q-card-section
        v-if="part.url && !uploadingFile"
        :class="imageSizeClass"
        class="q-pa-none"
      >
        <q-img class="col" fit="scale-down" :src="part.url" />

        <q-card-actions>
          <q-btn-toggle
            v-model="imageSize"
            size="sm"
            toggle-color="primary"
            :options="[
              { label: '2|4', value: 8 },
              { label: '3|3', value: 6 },
              { label: '4|2', value: 4 },
            ]"
          />
          <q-btn size="sm" icon="edit" @click="uploadingFile = true" />
          <q-btn size="sm" icon="delete" @click="removeImage()" />
        </q-card-actions>
      </q-card-section>
      <file-uploader v-else @uploaded="uploaded" />
    </q-card-section>
    <div class="row" v-if="part.type === 'img'">
      <file-uploader class="col-6" @uploaded="uploaded"/>
      <q-img class="col" :ratio="16 / 9" fit="scale-down" :src="part.url" />
    </div>
    <div class="row q-pa-md" v-if="part.type === 'video'">
      <q-input
        class="col-8"
        v-model="part.src"
        :label="$t('parts.form.add.video')"
      />
      <div class="col-4">
        <q-video :ratio="16 / 9" :src="part.src" />
      </div>
    </div>
    <div class="row q-pa-md" v-if="part.type === 'iframe'">
      <q-input
        class="col-8"
        v-model="part.src"
        :label="$t('parts.form.add.iframe')"
      />
      <div class="col-4">
        <div class="iframe-16-9">
          <iframe :title="part.text" :src="part.src"></iframe>
        </div>
      </div>
    </div>
    <question-editing v-if="part.type === 'quiz'" v-model="part.questions[0]" />
  </q-card>
</template>

<script setup>
import { ref, inject, computed, watch } from "vue";

import RichTextEditing from "../common/RichTextEditing.vue";
import QuestionEditing from "./QuestionEditing.vue";
import FileUploader from "../common/FileUploader.vue";

const { storage: storageService, lectureStep: lectureStepService } =
  inject("services");

const part = defineModel();

const imageSize = ref(
  Number(lectureStepService.getOption(part.value, "imageSize")) || 4,
);
const textSizeClass = computed(() =>
  part.value.url && !uploadingFile.value
    ? "col-" + (12 - imageSize.value)
    : "col-10",
);
const imageSizeClass = computed(() =>
  part.value.url && !uploadingFile.value ? "col-" + imageSize.value : "col-2",
);
const uploadingFile = ref(false);

watch(imageSize, (value) => {
  lectureStepService.setOption(part.value, "imageSize", value);
});

watch(
  () => part.value.options,
  () => {
    imageSize.value = Number(
      lectureStepService.getOption(part.value, "imageSize") || 4,
    );
  },
);

const removeImage = () => {
  if (part.value.url && !part.value.url.startsWith("http")) {
    storageService.removeImg(part.value.url);
  }
  part.value.url = null;
  part.value.src = null;
};

const uploaded = async (files) => {
  console.log(files);
  const file = files[0];
  removeImage();

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
