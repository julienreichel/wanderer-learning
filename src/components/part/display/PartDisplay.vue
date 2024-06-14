<template>
  <q-card>
    <q-card-section horizontal class="q-pa-md" v-if="part.type === 'text'">
      <div :class="textSizeClass" v-html="part.text"></div>
      <q-img
        v-if="part.url"
        :class="imageSizeClass"
        fit="scale-down"
        :src="part.url"
      />
    </q-card-section>
    <q-img
      v-if="part.type === 'img'"
      :ratio="16 / 9"
      fit="scale-down"
      :src="part.url"
    />
    <q-video v-if="part.type === 'video'" :ratio="16 / 9" :src="part.src" />
    <questions-display
      v-if="part.type === 'quiz'"
      :questions="part.questions"
      :responses="responses"
      @results="submitResults"
    />
    <q-card-section v-if="part.type === 'iframe'" class="q-pa-none">
      <div class="iframe-16-9">
        <iframe :title="part.text" :src="part.src" class="full-width"></iframe>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import QuestionsDisplay from "./QuestionsDisplay.vue";

import { computed, inject, ref, watch } from "vue";
const { lectureStep: lectureStepService } = inject("services");

const props = defineProps({
  part: { type: Object, required: true },
  responses: { type: Array, default: () => [] },
});

const emit = defineEmits(["results"]);

const imageSize = ref(
  Number(lectureStepService.getOption(props.part, "imageSize")) || 4,
);
const textSizeClass = computed(() =>
  props.part.url ? "col-" + (12 - imageSize.value) : "col-12",
);
const imageSizeClass = computed(() =>
  props.part.url ? "col-" + imageSize.value : "col-0",
);
watch(
  () => props.part.options,
  () => {
    imageSize.value = Number(
      lectureStepService.getOption(props.part, "imageSize") || 4,
    );
  },
);

const submitResults = (results) => {
  //forward the results to the parent component
  emit("results", results);
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
  width: 100%;
  height: 100%;
  border: 0; /* no border */
}
</style>
