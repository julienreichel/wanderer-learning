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
});
const emit = defineEmits(["finished"]);
import { useIris } from "src/composables/iris";
const { router } = useIris();

const step = ref(Number(props.stepIdx) || 0);

let timeStart = new Date();
let reportings = ref(props.parts.map(() => ({ time: 0 })));
const updateTimings = (index) => {
  if (reportings.value.length <= index) return;

  const timeEnd = new Date();
  reportings.value[index].time += Math.round((timeEnd - timeStart) / 1000);
  timeStart = timeEnd;
};

watch(step, (newStep, oldStep) => {
  updateTimings(oldStep);
  if (props.udpdateRoute) {
    router.push({ params: { stepIdx: newStep.toString() } });
  }
});

const quizLeft = ref(props.parts.filter((part) => part.type === "quiz").length);
const processResults = ({ responses }) => {
  const index = step.value;
  if (!reportings.value[index].responses) {
    quizLeft.value--;
  }
  reportings.value[index].responses = responses;
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

const hasNext = computed(() => step.value < props.parts.length - 1);
const hasAnsweredAllQuizzes = computed(() => quizLeft.value === 0);
const hasAnsweredCurrentQuizz = computed(
  () =>
    props.parts[step.value].type !== "quiz" ||
    Boolean(reportings.value[step.value].responses),
);

const hasQuizAnswer = (part) => {
  const idx = props.parts.indexOf(part);
  return part.type === "quiz" && Boolean(reportings.value[idx]?.responses);
};
const finish = (finished = true) => {
  updateTimings(step.value);
  emit("finished", { finished, reportings: reportings.value });
};
</script>
