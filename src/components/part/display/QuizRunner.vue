<template>
  <q-card class="q-pt-sm" v-if="question">
    <q-card-section>
      <q-linear-progress :value="progress" class="q-mt-md" />
    </q-card-section>
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
        v-model="question.response"
        :disable="question.validated"
      />
    </q-card-section>
    <q-card-section
      v-if="question.type === 'shorttext'"
      class="q-gutter-sm q-pl-lg"
    >
      <q-input
        clearable
        dense
        v-model="question.response"
        :readonly="question.validated"
      >
        <template v-slot:before v-if="question.validated">
          <q-icon :name="options.icon" :color="options.color" class="q-px-sm" />
        </template>
      </q-input>
    </q-card-section>
    <q-card-section
      v-if="
        question.validated &&
        question.explanations &&
        question.explanations !== ''
      "
      class="q-pa-md"
    >
      <q-banner class="bg-primary text-white">
        <div v-html="question.explanations"></div>
      </q-banner>
    </q-card-section>
    <q-card-actions class="">
      <q-btn
        square
        v-if="step === 0"
        size="sm"
        icon="close"
        @click="$emit('finished', [])"
      />
      <q-btn
        square
        v-else
        size="sm"
        icon="arrow_back"
        @click="step--"
      />
      <q-space />
      <q-btn
        square
        size="sm"
        icon="arrow_forward"
        @click="nextCliked"
      />
    </q-card-actions>
  </q-card>
  <q-card class="q-pt-sm" v-else>
    <q-list>
      <q-item v-for="q in activeQuestions" :key="q.id">
        <q-item-section>
          <q-item-label>
            <q-icon
              :name="q.valid ? 'check' : 'close'"
              :color="q.valid ? 'positive' : 'negative'"
            />
            {{ q.text }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            square
            size="sm"
            icon="arrow_forward"
            @click="step = activeQuestions.indexOf(q)"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <q-card-actions>
      <q-space />
      <q-btn
        square
        size="sm"
        icon="check"
        @click="$emit('finished', activeQuestions)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  questions: { type: Array },
  max: { type: Number, default: 5 },
  adaptative: { type: Boolean, default: false },
  examMode: { type: Boolean, default: false },
});
const emit = defineEmits(["finished", "results"]);
import { useIris } from "src/composables/iris";
const { t } = useIris();

const levels = [
  "novice",
  "beginner",
  "intermediate",
  "advanced",
  "expert",
];

let step = ref(0);
let realMax = computed(() => props.max || props.questions.length);
let questionsPerLevels = {};
let activeQuestions = ref([]);
let previousQuestions = [];
let getActiveQuestions = () => {
  console.log("getActiveQuestions", previousQuestions.length, realMax.value);
  if (previousQuestions.length === realMax.value) {
    return previousQuestions;
  }
  // pick the questions to display
  if (!props.adaptative || realMax.value === props.questions.length) {
    let q = [...props.questions];
    return q.sort(() => Math.random() - 0.5).slice(0, realMax.value);
  }

  if (props.examMode) {
    // create the final quiz
    let q = [];
    let i = 0;
    while (q.length < realMax.value) {
      const keys = Object.keys(questionsPerLevels);
      let level = keys[i % keys.length];
      if (questionsPerLevels[level].length){
        q.push(questionsPerLevels[level].pop());
      }
      i++;
    }
    return q;
  }
  // we update the question that have not been validated, depending on what the
  // user has answered, if the user sucess rate for a difficulty and all the ones bellow
  // is under 60% of sucess rate, we show question of the lover difficulty
  // if this is above 80% we show question of the next difficulty
  // if we do not know, we use difficulty=2
  // then we add one extra question to the quiz

  // compute the suces rate per level
  let acc = [0,1,2,3,4].map(() => ({total: 0, valid: 0}));
  let difficulties = previousQuestions.reduce((acc, q) => {
    if (!q.validated) return acc;

    acc[q.difficulty-1].total++;
    if (q.valid) acc[q.difficulty-1].valid++;
    return acc;
  }, acc);

  // acculate the lover levels
  for (let i = 0; i < 4; i++) {
    difficulties[i+1].total += difficulties[i].total;
    difficulties[i+1].valid += difficulties[i].valid;
  }
  // find the difficulty to use for the next question
  console.log("difficulties", difficulties);
  // start with beginner level
  if (difficulties[1].total < 3){
    let level = levels[1];
    if (questionsPerLevels[level]?.length){
      console.log("inital level", level);
      previousQuestions.push(questionsPerLevels[level].pop());
      return previousQuestions;
    }
    let j = 0;
    while (j < 5){
      let level = levels[j];
      if (questionsPerLevels[level]?.length){
        console.log("inital level", level);
        previousQuestions.push(questionsPerLevels[level].pop());
        return previousQuestions;
      }
      j++;
    }
  }

  for (let i = 0; i < 5; i++) {
    const rate = difficulties[i].valid / difficulties[i].total;
    if (rate < 0.6) {
      let level = levels[Math.max(1, i - 1)];
      if (questionsPerLevels[level]?.length){
        console.log("going down level", level);
        previousQuestions.push(questionsPerLevels[level].pop());
        return previousQuestions;
      }
    }
    if (rate < 0.80) {
      let j = i;
      // we get question from this level, or lower, if there are any
      while (j >= 0){
        let level = levels[j];
        if (questionsPerLevels[level]?.length){
          console.log("keeping level", level);
          previousQuestions.push(questionsPerLevels[level].pop());
          return previousQuestions;
        }
        j--;
      }
    }
  }
  // we get question from the expert level, or lower, if there are any
  let j = 4;
  while (j >= 0){
    let level = levels[j];
    if (questionsPerLevels[level]?.length){
      console.log("going up level", level);
      previousQuestions.push(questionsPerLevels[level].pop());
      return previousQuestions;
    }
    j--;
  }
  // this case cannot happen we have scanned all the question
  console.log("no more questions");
  return previousQuestions;
};

const getQuestionsPerLevels = () => {
  let questionsPerLevels = props.questions.reduce((acc, q) => {
    const level = q.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(q);
    return acc;
  }, {});
  console.log("questionsPerLevels", questionsPerLevels);

  // randomize the order of the questions in the levels
  questionsPerLevels = Object.keys(questionsPerLevels).reduce((acc, level) => {
    acc[level] = questionsPerLevels[level].sort(() => Math.random() - 0.5);
    return acc;
  }, {});
  return questionsPerLevels;
};

watch(
  () => props.questions,
  () => {

    props.questions.forEach((question) => {
      question.answers.forEach((answer) => {
        answer.order = answer.order || Math.random();
      });
      question.response =
        question.response || (question.type === "checkbox" ? [] : undefined);
      question.time = question.time || 0;
      question.level = question.level || "intermediate";
      question.difficulty = question.difficulty || levels.indexOf(question.level) + 1 || 3;
      if (!question.explanations && question.type === "shorttext") {
        question.explanations =
          t("quiz.question.valid_answers") +
          " '" +
          question.answers
            .filter((a) => a.valid)
            .map((a) => a.text)
            .join("', '") +
          "'";
      }
    });
    step.value = 0;

    questionsPerLevels = getQuestionsPerLevels();
    activeQuestions.value = getActiveQuestions();
  },
  { immediate: true },
);

const hasResults = computed(() =>
  activeQuestions.value.every((q) => q.validated),
);
watch(hasResults, (hasResults) => {
  if (hasResults) {
    emit("results", activeQuestions.value);
  }
});

const progress = computed(() =>
  hasResults.value ? 1 : step.value / realMax.value,
);

let timeStart = new Date();
const question = computed(() => activeQuestions.value[step.value]);
watch(question, (newQuestion, oldQuestion) => {
  const timeEnd = new Date();
  if (oldQuestion) {
    oldQuestion.time += Math.round((timeEnd - timeStart) / 1000);
  }
  timeStart = timeEnd;
});

const getOptions = (question) => {
  if (!question) return {};
  if (question.type === "radio" || question.type === "checkbox") {
    const options = question.answers.map((answer, index) => ({
      order: answer.order,
      label: answer.text,
      value: index,
      color: question.validated
        ? answer.valid
          ? "positive"
          : "negative"
        : undefined,
    }));
    // randomize order of options
    options.sort((a, b) => a.order - b.order);
    return options;
  } else {
    if (question.validated) {
      return {
        icon: question.valid ? "check" : "close",
        color: question.valid ? "positive" : "negative",
      };
    }
    return {};
  }
};
const options = computed(() => getOptions(question.value));

const nextCliked = () => {

  if (question.value.validated) {
    if (hasResults.value) {
      step.value = activeQuestions.value.length;
    } else {
      step.value++;
    }
  } else {
    if (props.examMode) {
      step.value++;
      if (step.value === activeQuestions.value.length) {
        activeQuestions.value.forEach((question) => {
          validateAnswers(question);
        });
      }
    } else {
      validateAnswers(question.value);
    }
  }
  if (activeQuestions.value.length <= step.value + 1) {
    // we are building question dynamically
    activeQuestions.value = getActiveQuestions();
  }
};
const validateAnswers = (question) => {
  question.validated = true;
  let valid = false;

  if (question.type === "radio") {
    valid = question.answers[question.response]?.valid;
  }
  if (question.type === "checkbox") {
    valid = true;
    question.answers.forEach((answer, idx2) => {
      const found =
        question.response.find((value) => value === idx2) !== undefined;
      if (found && !answer.valid) valid = false;
      if (!found && answer.valid) valid = false;
    });
  }
  if (question.type === "shorttext") {
    valid = false;
    question.answers.forEach((answer) => {
      if (
        question.response?.toLowerCase() === answer.text.toLowerCase()
      ) {
        valid = answer.valid;
      }
    });
  }
  question.valid = valid;
  question.points = valid ? 10 : 0;

  if (valid) {
    step.value++;
  }
};
</script>
