<template>
  <q-card-section horizontal>
    <rich-text-editing
      v-model="part.text"
      :class="textSizeClass"
    ></rich-text-editing>
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
</template>

<script setup>
import { ref, computed, inject } from "vue";
import RichTextEditing from "src/components/common/RichTextEditing.vue";
import FileUploader from "src/components/common/FileUploader.vue";

defineProps({
  lectureId: { type: String, required: true },
});

const { storage: storageService } = inject("services");

const part = defineModel({ type: Object });
part.value.options = part.value.options || {};
part.value.options.imageSize = part.value.options.imageSize || "4";

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
