<template>
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
  <q-card>
    <q-card-actions>
      <q-btn
        v-if="step !== 0"
        square
        size="sm"
        icon="arrow_back"
        @click="step--"
      />
      <q-space />
      <q-btn
        v-if="step < parts.length - 1"
        square
        size="sm"
        icon="arrow_forward"
        @click="step++"
      />
      <q-btn
        v-else-if="quizLeft === 0"
        square
        size="sm"
        icon="check"
        @click="finish(true)"
      />
      <q-btn
        v-else
        square
        size="sm"
        icon="close"
        @click="finish(false)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import QuestionsDisplay from 'src/components/part/QuestionsDisplay.vue';
import { ref, computed, watch } from 'vue';

const props = defineProps({
  parts: { type: Array },
  stepIdx: { type: String },
});
const emit = defineEmits(['finished']);
import { useIris } from 'src/composables/iris';
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

const quizLeft = ref(props.parts.filter((part) => part.type === 'quiz').length);
const processResults = ({ responses }) => {
  quizLeft.value--;
  const index = step.value;
  reportings.value[index].responses = responses;
};


const part = computed(() => props.parts[step.value]);
const reponses = computed(() => {
  return reportings.value[step.value]?.responses
});

const finish = (finished = true) => {
  updateTimings(step.value);
  emit('finished', { finished, reportings: reportings.value });
};
</script>
