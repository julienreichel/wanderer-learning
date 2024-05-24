<template>
  <q-card class="q-pt-sm" v-if="parts.length > 1">
    <q-card-section class="q-pt-sm q-px-sm q-col-gutter-sm row">
      <NavigationCard
        :step="step"
        :showPrevious="step !== 0"
        @stepChange="step = $event"
      />
      <PartCard
        v-for="part in previewParts"
        :key="part.id"
        :part="part"
        :step="parts.indexOf(part)"
        :hasQuizAnswer="hasQuizAnswer(part)"
        :active="step == parts.indexOf(part)"
        :maxStep="parts.length"
        @stepChange="step = $event"
      />
      <NavigationCard
        :step="step"
        :hasNext="hasNext"
        :hasAnsweredAllQuizzes="hasAnsweredAllQuizzes"
        @stepChange="step = $event"
        @finish="finish"
      />
    </q-card-section>
  </q-card>
  <PartDisplay
    v-if="part"
    :part="part"
    :responses="responses"
    @results="processResults"
  />
</template>

<script setup>
import NavigationCard from "../common/NavigationCard.vue";
import PartCard from "../common/PartCard.vue";
import PartDisplay from "./PartDisplay.vue";

import { ref, computed, watch } from "vue";

const props = defineProps({
  parts: { type: Array },
  stepIdx: { type: String },
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
  router.push({ params: { stepIdx: newStep.toString() } });
});

const quizLeft = ref(props.parts.filter((part) => part.type === "quiz").length);
const processResults = ({ responses }) => {
  quizLeft.value--;
  const index = step.value;
  reportings.value[index].responses = responses;
};

const part = computed(() => props.parts[step.value]);
const responses = computed(() => {
  return reportings.value[step.value]?.responses;
});

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

const hasQuizAnswer = (part) => {
  const idx = props.parts.indexOf(part);
  return part.type === "quiz" && reportings.value[idx]?.responses;
};
const finish = (finished = true) => {
  updateTimings(step.value);
  emit("finished", { finished, reportings: reportings.value });
};
</script>
