<template>
  <q-card v-if="parts.length > 1" class="q-pt-sm">
    <q-card-section class="q-pt-sm q-px-sm q-col-gutter-sm row">
      <NavigationCard
        :step="step"
        :show-previous="step !== 0"
        @step-change="step = $event"
      />
      <PartCard
        v-for="previewPart in previewParts"
        :key="previewPart.id"
        :part="previewPart"
        :step="parts.indexOf(previewPart)"
        :has-quiz-answer="hasQuizAnswer(previewPart)"
        :active="step == parts.indexOf(previewPart)"
        :max-step="parts.length"
        @step-change="step = $event"
      />
      <div
        v-for="(fillerCard, index) in fillerCards"
        :key="index"
        class="col"
      ></div>
      <NavigationCard
        :step="step"
        :has-next="hasNext"
        :has-answered-all-quizzes="hasAnsweredAllQuizzes"
        @step-change="step = $event"
        @finish="finish"
      />
    </q-card-section>
  </q-card>
  <PartDisplay
    v-if="part"
    :part="part"
    :has-next="hasNext && hasAnsweredCurrentQuizz"
    :has-answered-all-quizzes="hasAnsweredAllQuizzes"
    :answered-questions="answeredQuestions"
    @results="processResults"
    @next-step="step++"
    @finish="finish"
  />
</template>

<script setup>
import NavigationCard from "../common/NavigationCard.vue";
import PartCard from "../common/PartCard.vue";
import PartDisplay from "./PartDisplay.vue";

import { ref, computed, watch } from "vue";

const props = defineProps({
  parts: { type: Array, required: true },
  stepIdx: { type: String, default: "0" },
  udpdateRoute: { type: Boolean, default: false },
  previousReports: { type: Array, default: () => [] },
  answeredQuestions: { type: Array, default: () => [] },
});
const emit = defineEmits(["finished", "updated"]);
import { useIris } from "src/composables/iris";
const { router } = useIris();

const step = ref(Number(props.stepIdx) || 0);

let timeStart = new Date();
let reportings = ref(props.previousReports.length ? props.previousReports : props.parts.map(() => ({ time: 0 })));

const updateTimings = (index) => {
  if (reportings.value.length <= index) return;

  const timeEnd = new Date();
  reportings.value[index].time += Math.round((timeEnd - timeStart) / 1000);
  timeStart = timeEnd;

  emit("updated", {
    reportings: reportings.value,
    responses: quizResponses.value.flat().filter(Boolean),
  });
};

watch(step, (newStep, oldStep) => {
  updateTimings(oldStep);
  if (props.udpdateRoute) {
    router.push({ params: { stepIdx: newStep.toString() } });
  }
});

const initQuizResponses = () => {
  const responses = props.parts.map(() => []);
  if (props.answeredQuestions?.length) {
    props.answeredQuestions.forEach((response) => {
      // find the index of the parts containing the reponse.questionId
      const index = props.parts.findIndex((part) =>
        part.type === "quiz" && part.questions.some((q) => q.id === response.questionId),
      );
      if (index !== -1) {
        responses[index].push(response);
      }
    });
  }
  return responses;

}

let quizResponses = ref(initQuizResponses());

const processResults = ({ responses }) => {
  const index = step.value;
  quizResponses.value[index] = responses;

  emit("updated", {
    reportings: reportings.value,
    responses: quizResponses.value.flat().filter(Boolean),
  });
};

const part = computed(() => props.parts[step.value]);

const previewParts = computed(() => {
  const toDisplay = 5;
  if (props.parts.length < toDisplay) return props.parts;

  const start = Math.min(
    Math.max(0, step.value - Math.floor(toDisplay / 2)),
    props.parts.length - toDisplay,
  );
  return props.parts.slice(start, start + toDisplay);
});
const fillerCards = computed(() => {
  return Array.from({ length: 5 - previewParts.value.length });
});

const hasNext = computed(() => step.value < props.parts.length - 1);

const hasQuizAnswer = (part) => {
  const idx = props.parts.indexOf(part);
  return (
    part.type !== "quiz" ||
    quizResponses.value[idx]?.length === part.options.nbQuestions
  );
};
const hasAnsweredAllQuizzes = computed(() =>
  props.parts.every(hasQuizAnswer),
);
const hasAnsweredCurrentQuizz = computed(() =>
  hasQuizAnswer(props.parts[step.value]),
);

const finish = (finished = true) => {
  updateTimings(step.value);
  emit("finished", {
    finished,
    reportings: reportings.value,
    responses: quizResponses.value.flat().filter(Boolean),
  });
};
</script>
