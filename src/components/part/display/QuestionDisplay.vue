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
  <q-card-section v-if="question.type === 'feedback'">
    <q-input
      v-if="feedbackType === 'text'"
      clearable
      v-model="newResponse"
      :readonly="validated"
    >
    </q-input>
    <div v-else-if="feedbackType === 'roti'">
      <q-icon
        v-for="index in 5"
        :key="index"
        size="xl"
        :name="icons[feedbackType][index - 1]"
        color="primary"
        :style="{
          opacity: index === newResponse || index === mouseOver ? 1 : 0.4,
          scale: index === mouseOver ? 1.3 : 1,
        }"
        @mouseover="!validated ? (mouseOver = index) : null"
        @mouseout="mouseOver = false"
        @click="!validated ? (newResponse = index) : null"
      >
        <q-tooltip>{{ question.answers?.[index - 1].text }}</q-tooltip>
      </q-icon>
    </div>
    <q-rating
      v-else
      v-model="newResponse"
      :readonly="validated"
      size="xl"
      color="primary"
      :icon="icons[feedbackType]"
      :icon-selected="iconsSelected[feedbackType]"
      :color-selected="colorSelected[feedbackType]"
    >
      <template #tip-1 v-if="question.answers?.[0]">
        <q-tooltip>{{ question.answers[0].text }}</q-tooltip>
      </template>
      <template #tip-2 v-if="question.answers?.[1]">
        <q-tooltip>{{ question.answers[1].text }}</q-tooltip>
      </template>
      <template #tip-3 v-if="question.answers?.[2]">
        <q-tooltip>{{ question.answers[2].text }}</q-tooltip>
      </template>
      <template #tip-4 v-if="question.answers?.[3]">
        <q-tooltip>{{ question.answers[3].text }}</q-tooltip>
      </template>
      <template #tip-5 v-if="question.answers?.[4]">
        <q-tooltip>{{ question.answers[4].text }}</q-tooltip>
      </template>
    </q-rating>
  </q-card-section>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  question: { type: Object },
  response: { type: [Object] },
});

const emit = defineEmits(["result"]);

const feedbackType = computed(
  () =>
    props.question.options?.find((option) => option.name === "feedbackType")
      ?.value,
);
const icons = {
  difficulty: "speed",
  roti: [
    "sentiment_very_dissatisfied",
    "sentiment_dissatisfied",
    "sentiment_neutral",
    "sentiment_satisfied",
    "sentiment_satisfied_alt",
  ],
  stars: "star_border",
};
const iconsSelected = {
  stars: "star",
};
const colorSelected = {
  difficulty: ["lime", "light-green", "green", "teal", "purple"],
};

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
