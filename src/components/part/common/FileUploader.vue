<template>
  <amplify-uploader
    ref="uploaderRef"
    accept=".jpg, image/*"
    :filename="(file) => uid() + '.' + file.name.split('.').pop()"
    @uploaded="uploaded"
    @start="start"
    @finish="finish"
    @added="addFile"
    :multiple="multiple"
  >
    <template v-slot:header="scope">
      <div class="row no-wrap items-center q-pa-xs q-gutter-none">
        <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
        <q-btn
          v-if="scope.canAddFiles"
          type="a"
          icon="add_box"
          @click="scope.pickFiles"
          round
          dense
          flat
          size="sm"
        >
          <q-uploader-add-trigger />
        </q-btn>
        <div class="q-ml-xs q-mr-xs">{{ title }}</div>
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
</template>

<script setup>
import AmplifyUploader from "../../utils/AmplifyUploader.js";

import { ref } from "vue";

import { useIris } from "src/composables/iris";
const { uid } = useIris();

const props = defineProps({
  multiple: { type: Boolean, default: false },
  title: { type: String },
});
const emit = defineEmits(["uploaded"]);

const uploaderRef = ref(null);
let uploadedFiles = [];
let idx = 0;
const addFile = async (files) => {
  for (const file of files) {
    file.idx = idx++;
  }
};
const uploaded = async (msg) => {
  const files = msg.files;
  files.forEach((file) => {
    uploadedFiles[file.idx] = file;
  });

  const uploader = uploaderRef.value;
  if (uploader) {
    uploader.removeUploadedFiles();
  }
};
const start = async (msg) => {
  uploadedFiles = [];
};
const finish = async (msg) => {
  uploadedFiles = uploadedFiles.filter((file) => Boolean(file));

  emit("uploaded", uploadedFiles);
};
</script>

<style lang="scss">
.q-uploader__list {
  padding: 0px;
}
</style>
