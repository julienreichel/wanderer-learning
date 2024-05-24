<template>
  <q-card v-for="(question, index) in questions" :key="index">
    <question-display
      ref="questionRefs"
      :question="question"
      :response="responses && responses[index]"
      @result="processResult"
      />
  </q-card>
  <q-card>
    <q-card-actions v-if="!validate">
      <q-space />
      <q-btn square size="sm" icon="done" @click="validateAnswers" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import QuestionDisplay from 'src/components/part/display/QuestionDisplay.vue';

const props = defineProps({
  questions: { type: Array },
  responses: { type: Array },
});
const emit = defineEmits(['results', 'finished']);

const validate = ref(props.responses?.length > 0);
watch(() => props.responses, (value) => {
  validate.value = value?.length > 0;
});

const questionRefs = ref([]);
const validateAnswers = () => {
  questionRefs.value.forEach((ref) => ref.validateAnswers());
};

let resultCount = 0;
let responsesStats = props.questions.map(() => null);
watch(() => props.questions, (questions) => {
  resultCount = 0;
  responsesStats = questions.map(() => null);
});
const processResult = ({ question, response, valid, points }) => {
  const index = props.questions.indexOf(question);

  const feedbackType = question.options?.find(option => option.name === 'feedbackType')?.value;
  const type = question.type;
  responsesStats[index] = {questionId: question.id, response, valid, points, feedbackType, type};

  resultCount++;

  if (resultCount === props.questions.length){
    emit('results', {questions: props.questions, responses: responsesStats});
    resultCount = 0;
  }
};
</script>
