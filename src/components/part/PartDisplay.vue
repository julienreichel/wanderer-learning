<template>
  <q-card>
    <div class="q-pa-md" v-if="part.type === 'text'" v-html="part.text"></div>
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
  </q-card>
</template>

<script setup>
import QuestionsDisplay from "src/components/part/QuestionsDisplay.vue";

const props = defineProps({
  part: { type: Object, required: true },
  responses: { type: Array, default: () => [] },
});

const emit = defineEmits(["results"]);

const submitResults = (results) => {
  //forward the results to the parent component
  emit("results", results);
};
</script>
