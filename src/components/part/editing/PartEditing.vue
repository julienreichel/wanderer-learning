<template>
  <q-card>
    <text-editing
      v-if="part.type === 'text'"
      v-model="part"
      :lecture-id="lectureId"
    />
    <img-editing
      v-if="part.type === 'img'"
      v-model="part"
      :lecture-id="lectureId"
    />
    <video-editing v-if="part.type === 'video'" v-model="part" />
    <iframe-editing v-if="part.type === 'iframe'" v-model="part" />
    <drawing-editing v-if="part.type === 'drawing'" v-model="part" :index="index"/>
    <graph-editing v-if="part.type === 'graph'" v-model="part" />
  </q-card>
</template>

<script setup>
import TextEditing from "./parts/TextEditing.vue";
import ImgEditing from "./parts/ImageEditing.vue";
import VideoEditing from "./parts/VideoEditing.vue";
import IframeEditing from "./parts/IFrameEditing.vue";
import DrawingEditing from "./parts/DrawingEditing.vue";
import GraphEditing from "./parts/GraphEditing.vue";

const part = defineModel({ type: Object });

defineProps({
  lectureId: { type: String, required: true },
  index: { type: Number, default: 0 },
});
</script>
