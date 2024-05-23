<template>
  <q-card class="q-pt-sm">
    <q-card-section class="q-pt-sm q-px-sm q-col-gutter-sm row">
      <div class="col-1">
        <q-card
          v-if="step !== 0"
          class="row justify-center items-center full-height"
          clickable
          @click="step --"
          flat
        >
        <q-icon  name="chevron_left" size="xl" />
        </q-card>
      </div>
      <div v-for="part in previewParts" :key="part.id" class="col-2">
        <q-card
          class="full-height"
          clickable
          @click="step = parts.indexOf(part)"
          :class="{ 'custom-highlight': step == parts.indexOf(part) }"
          flat
          bordered
        >
          <q-card-section v-if="part.type === 'text'">
            <q-item-label v-for="idx in 4" :key="idx">
              <q-skeleton type="text" animation="none" />
            </q-item-label>
          </q-card-section>
          <q-img
            v-if="part.type === 'img'"
            :ratio="16 / 9"
            fit="scale-down"
            :src="part.url"
          />
          <q-card-section v-if="part.type === 'quiz'" class="row justify-center items-center full-height">
            <q-icon v-if="!hasQuizAnswer(part)" name="assignment" size="xl" />
            <q-icon v-else name="assignment_turned_in" size="xl" />
          </q-card-section>
          <q-card-section v-if="part.type === 'video'" class="row justify-center items-center full-height">
            <q-icon  name="play_circle" size="xl" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-1">
        <q-card
        v-if="hasNext || hasAnsweredAllQuizzes"
          class="row justify-center items-center full-height"
          clickable
          @click="hasNext ? step ++ : finish(true)"
          flat
        >
        <q-icon v-if="hasNext" name="chevron_right" size="xl" />
        <q-icon v-else-if="hasAnsweredAllQuizzes" name="check" size="xl" />
        </q-card>
      </div>
    </q-card-section>
  </q-card>
  <q-card v-if="part">
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
      :responses="reponses"
      @results="processResults"
    />
  </q-card>

</template>

<script setup>
import QuestionsDisplay from "src/components/part/QuestionsDisplay.vue";
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
const reponses = computed(() => {
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

<style type="text/scss" scoped>
.custom-highlight {
  border-color: var(--q-primary);
}
.skeleton-row {
  display: flex;
  align-items: center;
}
.skeleton-checkbox {
  width: 12px;
  height: 12px;
  margin-right: 8px; /* Spacing between the checkbox and text */
}
.skeleton-text {
  width: 80%;
}
</style>
