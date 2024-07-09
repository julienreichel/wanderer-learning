<template>
  <q-card :flat="flat">
    <q-card-section horizontal class="q-pa-md" v-if="part.type === 'text'">
      <div class="row full-width">
        <q-img
          v-if="part.url"
          class="lt-md col-12"
          fit="scale-down"
          :src="part.url"
        />
        <div ref="content" :class="textSizeClass" v-html="renderedText"></div>
        <q-img
          v-if="part.url"
          class="gt-sm"
          :class="imageSizeClass"
          fit="scale-down"
          :src="part.url"
        />
      </div>
    </q-card-section>
    <q-img
      v-if="part.type === 'img'"
      :ratio="16 / 9"
      fit="scale-down"
      :src="part.url"
    />
    <q-video v-if="part.type === 'video'" :ratio="16 / 9" :src="part.src" />
    <quiz-runner
      v-if="part.type === 'quiz'"
      :questions="part.questions"
      :max="Number(part.options.nbQuestions) || 0"
      @results="submitResults"
      @finished="
        hasNext
          ? $emit('nextStep')
          : hasAnsweredAllQuizzes
            ? $emit('finish')
            : null
      "
      adaptative
      :next-actions-icon="
        hasNext ? 'chevron_right' : hasAnsweredAllQuizzes ? 'check' : null
      "
      :prev-actions-icon="null"
      :exam-mode="Boolean(part.options.examMode)"
    />
    <q-card-section v-if="part.type === 'iframe'" class="q-pa-none">
      <div class="iframe-16-9">
        <iframe :title="part.text" :src="part.src" class="full-width"></iframe>
      </div>
    </q-card-section>
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
import katex from 'katex';
import 'katex/dist/katex.min.css';

import { computed, inject, ref, watch } from "vue";

import { useIris } from "src/composables/iris";
const { $q } = useIris();

const { lectureStep: lectureStepService } = inject("services");


const props = defineProps({
  part: { type: Object, required: true },
  hasNext: { type: Boolean, default: false },
  hasAnsweredAllQuizzes: { type: Boolean, default: false },
  flat: { type: Boolean, default: false },
});

const emit = defineEmits(["results", "nextStep", "finish"]);

// Function to render LaTeX to HTML using KaTeX
function renderLatexString(latexString) {
  try {
    return katex.renderToString(latexString, {
      throwOnError: false,
    });
  } catch (error) {
    console.error('Error rendering LaTeX string:', error);
    return latexString; // Return original string if there's an error
  }
}

const renderedText = computed(() => {
  // Replace display equations
  let text = props.part.text.replace(/\\\[(.*?)\\\]/gs, (match, p1) => {
    console.log('display', match, p1);
    return renderLatexString(p1.trim());
  });

  // Replace inline equations
  text = text.replace(/\\\((.*?)\\\)/gs, (match, p1) => {
    console.log('inline', match, p1);
    return renderLatexString(p1.trim());
  });

  return text;
});

const imageSize = ref(Number(props.part.options.imageSize) || 4);
watch(
  () => props.part.options,
  () => {
    imageSize.value = Number(props.part.options.imageSize || 4);
  },
);

const textSizeClass = computed(() =>
  props.part.url && $q.screen.gt.sm ? "col-" + (12 - imageSize.value) : "col-12",
);
const imageSizeClass = computed(() =>
  props.part.url ? "col-" + imageSize.value : "col-0",
);

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
