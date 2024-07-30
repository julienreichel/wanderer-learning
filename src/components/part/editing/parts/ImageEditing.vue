<template>
  <q-card-section class="row">
    <div class="col-6 q-gutter-sm">
      <q-input v-model="part.text" outlined autogrow :label="$t('parts.form.description')" />
      <div class="col-12">
        <file-uploader class="full-width full-height" :prefix="lectureId" @uploaded="uploaded" />
      </div>
    </div>
    <q-img class="col" :ratio="16 / 9" fit="scale-down" :src="part.url" />
  </q-card-section>
</template>

<script setup>
import { inject } from "vue";
import FileUploader from "src/components/common/FileUploader.vue";

defineProps({
  lectureId: { type: String, required: true },
});

const { storage: storageService } = inject("services");

const part = defineModel({ type: Object });

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
  const name = file.name.replace(/\.[^.]+$/, "");
  part.value.text = part.value.text ? part.value.text : name;
  part.value.src = file?.path;
  part.value.url = file?.url;
};
</script>
