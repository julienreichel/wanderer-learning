<template>
  <q-card>
    <text-editing v-if="part.type === 'text'" v-model="part" :lecture-id="lectureId" />
    <image-editing v-if="part.type === 'img'" v-model="part" :lecture-dd="lectureId" />
    <video-editing v-if="part.type === 'video'" v-model="part"/>
    <i-frame-editing v-if="part.type === 'iframe'" v-model="part"/>
    <question-editing v-if="part.type === 'quiz'" v-model="part.questions[0]" />
  </q-card>
</template>

<script setup>

import TextEditing from './parts/TextEditing.vue';
import ImageEditing from './parts/ImageEditing.vue';
import VideoEditing from './parts/VideoEditing.vue';
import IFrameEditing from './parts/IFrameEditing.vue';
import QuestionEditing from './QuestionEditing.vue';

const part = defineModel({ type: Object });
part.value.options = part.value.options || {};
part.value.options.imageSize = part.value.options.imageSize || "4";

defineProps({
  lectureId: { type: String, required: true },
});
</script>
