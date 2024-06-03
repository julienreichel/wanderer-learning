<template>
  <q-card>
    <rich-text-editing v-if="part.type === 'text'" v-model="part.text">
    </rich-text-editing>
    <div class="row" v-if="part.type === 'img'">
      <amplify-uploader
        ref="uploaderRef"
        class="col-8"
        accept=".jpg, image/*"
        :filename="(file) => uid() + '.' + file.name.split('.').pop()"
        @uploaded="uploaded"
      >
        <template v-slot:header="scope">
          <div class="row no-wrap items-center q-pa-sm q-gutter-sm">
            <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
            <q-btn
              v-if="scope.canAddFiles"
              type="a"
              icon="add_box"
              @click="scope.pickFiles"
              round
              dense
              flat
            >
              <q-uploader-add-trigger />
              <q-tooltip>Pick Files</q-tooltip>
            </q-btn>
            <q-btn
              v-if="scope.canUpload"
              icon="cloud_upload"
              @click="scope.upload"
              round
              dense
              flat
            >
            </q-btn>
          </div>
        </template>
      </amplify-uploader>
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
import { ref, inject } from "vue";

import RichTextEditing from "../common/RichTextEditing.vue";
import QuestionEditing from "./QuestionEditing.vue";

import AmplifyUploader from "../../utils/AmplifyUploader.js";

import { useIris } from "src/composables/iris";
const { uid } = useIris();
const { storage: storageService } = inject("services");

const part = defineModel();

const uploaderRef = ref(null);
const uploaded = async (msg) => {
  const file = msg.files[0];
  if (part.value.src && !part.value.src.startsWith("http")) {
    storageService.removeImg(part.value.src);
  }
  part.value.src = file?.path;
  part.value.url = file?.url;

  const uploader = uploaderRef.value;
  if (uploader) {
    uploader.removeUploadedFiles();
  }
};
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
  width: 400%;
  height: 400%;
  border: 0; /* no border */
  transform: scale(0.25);
  transform-origin: 0 0;
}
</style>
