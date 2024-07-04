<template>
  <q-dialog v-model="popupVisible">
    <quiz-runner style="width: 60%; min-width: 350px; max-width: 800px" :questions="questions" :max="max" @finished="popupVisible = false"/>
  </q-dialog>
</template>

<script setup>
import QuizRunner from "./QuizRunner.vue";

const props = defineProps({
  questions: { type: Array },
  max: { type: Number, default: 3 },
  adaptative: { type: Boolean, default: false },
  examMode: { type: Boolean, default: false },
});

const popupVisible = defineModel();

</script>
