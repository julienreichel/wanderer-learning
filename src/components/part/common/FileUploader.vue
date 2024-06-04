<template>
  <amplify-uploader
    ref="uploaderRef"
    accept=".jpg, image/*"
    :filename="(file) => uid() + '.' + file.name.split('.').pop()"
    @uploaded="uploaded"
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
</template>

<script setup>
import AmplifyUploader from "../../utils/AmplifyUploader.js";

import { ref } from "vue";

import { useIris } from "src/composables/iris";
const { uid } = useIris();

const emit = defineEmits(["uploaded"]);

const uploaderRef = ref(null);
const uploaded = async (msg) => {
  const files = msg.files;
  emit("uploaded", files);

  const uploader = uploaderRef.value;
  if (uploader) {
    uploader.removeUploadedFiles();
  }
};
</script>

<style lang="scss">
.q-uploader__list {
  padding: 0px;
}
</style>
