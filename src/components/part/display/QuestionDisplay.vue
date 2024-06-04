<template>
  <q-card-section>
    <div class="text-h5">{{ question.text }}</div>
  </q-card-section>
  <q-card-section
    v-if="question.type === 'radio' || question.type === 'checkbox'"
    class="q-gutter-sm"
  >
    <q-option-group
      :options="options"
      :type="question.type"
      v-model="newResponse"
      :disable="validated"
    />
  </q-card-section>
  <q-card-section v-if="question.type === 'shorttext'" class="q-gutter-sm">
    <q-input
      clearable
      v-model="newResponse"
      :label="validated ? '' : 'The answer'"
      :readonly="validated"
      :color="options.color"
    >
      <template v-slot:append v-if="validated">
        <q-icon :name="options.icon" :color="options.color" />
      </template>
    </q-input>
  </q-card-section>
  <q-card-section
    v-if="validated && question.explanations && question.explanations !== ''"
    class="q-pa-md"
  >
    <div v-html="question.explanations"></div>
  </q-card-section>
  <q-card-section
    v-else-if="validated && question.type === 'shorttext'"
    class="q-pa-md"
  >
    <div>{{ $t('quiz.question.valid_answers') + '\'' + question.answers.filter(a => a.valid).map(a => a.text).join('\', \'') + '\'' }}</div>
  </q-card-section>
  <feedback-question-display
    v-if="question.type === 'feedback'"
    v-model="newResponse"
    :question="question"
    @feedback="$emit('feedback', $event)"
    />
</template>

<script setup>
import FeedbackQuestionDisplay from "./FeedbackQuestionDisplay.vue";

import { computed, ref, watch } from "vue";

const props = defineProps({
  question: { type: Object },
  response: { type: [Object] },
});

const emit = defineEmits(["result", "feedback"]);

const mouseOver = ref(false);

const getOptions = (question) => {
  if (question.type === "radio" || question.type === "checkbox") {
    const options = question.answers.map((answer, index) => ({
      label: answer.text,
      value: index,
    }));
    // randomize order of options
    options.sort(() => Math.random() - 0.5);
    return options;
  } else {
    return {};
  }
};

const options = ref(getOptions(props.question));
const validated = ref(false);

const highlightAnswers = (valid) => {
  if (props.question.type === "radio" || props.question.type === "checkbox") {
    options.value.forEach((element) => {
      element.color = props.question.answers[element.value].valid
        ? "green"
        : "red";
      element.keepColor = true;
    });
  }
  if (props.question.type === "shorttext") {
    options.value.icon = valid ? "check" : "clear";
    options.value.color = valid ? "green" : "red";
  }
};

const feedbackType = computed(
  () =>
    props.question.options?.find((option) => option.name === "feedbackType")
      ?.value,
);

const getResponse = () => {
  if (!props.response) {
    return props.question.type === "checkbox"
      ? []
      : props.question.type === "feedback" && feedbackType.value !== "text"
        ? NaN
        : undefined;
  }
  validated.value = true;
  highlightAnswers(props.response.valid);
  return props.question.type === "checkbox"
    ? props.response.response.split(",").map(Number)
    : props.response.response;
};

const newResponse = ref(getResponse());

watch(
  () => props.question,
  () => {
    options.value = getOptions(props.question);
    newResponse.value = getResponse();
    validated.value = false;
  },
);

watch(
  () => props.response,
  () => {
    newResponse.value = getResponse();
  },
);

const validateAnswers = () => {
  validated.value = true;
  let valid = false;
  let responseAsString;

  if (props.question.type === "radio") {
    valid = props.question.answers[newResponse.value]?.valid;
    responseAsString = newResponse.value;
  }
  if (props.question.type === "checkbox") {
    valid = true;
    props.question.answers.forEach((answer, idx2) => {
      const found =
        newResponse.value.find((value) => value === idx2) !== undefined;
      if (found && !answer.valid) valid = false;
      if (!found && answer.valid) valid = false;
    });
    responseAsString = newResponse.value.join(",");
  }
  if (props.question.type === "shorttext") {
    valid = false;
    props.question.answers.forEach((answer) => {
      if (newResponse.value?.toLowerCase() === answer.text.toLowerCase()) {
        valid = answer.valid;
      }
    });
    responseAsString = newResponse.value;
  }
  if (props.question.type === "feedback") {
    valid = true;
    responseAsString = newResponse.value;
  }

  emit("result", {
    question: props.question,
    response: responseAsString,
    valid,
    points: valid ? 10 : 0,
  });

  highlightAnswers(valid);
};
defineExpose({ validateAnswers });
</script>
