<template>
  <q-card :flat="flat">
    <text-display v-if="part.type === 'text'" :part="part" />
    <q-img
      v-if="part.type === 'img'"
      :ratio="16 / 9"
      fit="scale-down"
      :src="part.url"
    />
    <q-video v-if="part.type === 'video'" :ratio="16 / 9" :src="part.src" />
    <iframe-display v-if="part.type === 'iframe'" :part="part" />
    <drawing-display v-if="part.type === 'drawing'" :part="part" />
    <graph-display v-if="part.type === 'graph'" :part="part" />
    <quiz-runner
      v-if="part.type === 'quiz'"
      :questions="part.questions"
      :max="Number(part.options.nbQuestions) || 0"
      adaptative
      :next-actions-icon="
        hasNext ? 'chevron_right' : hasAnsweredAllQuizzes ? 'check' : null
      "
      :prev-actions-icon="null"
      :exam-mode="Boolean(part.options.examMode)"
      @results="submitResults"
      @finished="
        hasNext
          ? $emit('nextStep')
          : hasAnsweredAllQuizzes
            ? $emit('finish')
            : null
      "
    />
    <q-card-actions
      v-if="part.type !== 'quiz' && (hasAnsweredAllQuizzes || hasNext)"
      class="q-px-none q-py-lg"
    >
      <q-space />
      <q-btn
        size="md"
        color="primary"
        padding="sm 64px"
        :icon="hasNext ? 'chevron_right' : 'check'"
        @click="hasNext ? $emit('nextStep') : $emit('finish')"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import QuizRunner from "src/components/part/display/QuizRunner.vue";
import TextDisplay from "./parts/TextDisplay.vue";
import IframeDisplay from "./parts/IFrameDisplay.vue";
import DrawingDisplay from "./parts/DrawingDisplay.vue";
import GraphDisplay from "./parts/GraphDisplay.vue";

import { inject, watch } from "vue";

const { lectureStep: lectureStepService } = inject("services");

const props = defineProps({
  part: { type: Object, required: true },
  hasNext: { type: Boolean, default: false },
  hasAnsweredAllQuizzes: { type: Boolean, default: false },
  flat: { type: Boolean, default: false },
});

const emit = defineEmits(["results", "nextStep", "finish"]);

if (!props.part.url) {
  lectureStepService.resolveUrl([props.part]);
}
watch(
  () => props.part.src,
  () => {
    if (!props.part.url) {
      lectureStepService.resolveUrl([props.part]);
    }
  },
);
const submitResults = (questions) => {
  //forward the results to the parent component
  const responses = questions.map((question) => {
    return {
      questionId: question.id,
      valid: question.valid,
      points: question.points,
      type: question.type,
      level: question.level,
      response: Array.isArray(question.response)
        ? question.response.join(",")
        : question.response,
    };
  });
  emit("results", { responses });
};
</script>
