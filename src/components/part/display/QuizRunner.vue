<template>
  <q-card v-if="question" class="q-pt-sm">
    <q-card-section v-if="title" class="q-pb-none">
      <div class="text-h5 text-center">{{ title }}</div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-linear-progress :value="progress" class="q-mt-md" size="lg" />
    </q-card-section>
    <q-card-section>
      <q-card square>
        <q-card-section v-if="question.text">
          <rich-text-renderer class="text-h6" :html-content="question.text" />
        </q-card-section>
        <q-separator inset />
        <q-card-section
          v-if="question.type === 'radio' || question.type === 'checkbox'"
          class="q-gutter-sm"
        >
          <q-option-group
            v-model="question.response"
            :options="options"
            :type="question.type"
            :disable="question.validated"
          >
            <template #label="opt">
              <!-- eslint-disable vue/no-v-html -->
              <span v-html="renderKatex(opt.label, true)"></span>
            </template>
          </q-option-group>
        </q-card-section>
        <q-card-section
          v-if="question.type === 'shorttext'"
          class="q-gutter-sm q-pl-lg"
        >
          <q-input
            v-model="question.response"
            clearable
            dense
            :readonly="question.validated"
          >
            <template v-if="question.validated" #before>
              <q-icon
                :name="options.icon"
                :color="options.color"
                class="q-px-sm"
              />
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
          <q-banner v-if="question.explanations" class="bg-positive">
            <rich-text-renderer :html-content="question.explanations" />
          </q-banner>
        </q-card-section>
        <feedback-question-display
          v-if="question.type === 'feedback'"
          v-model="question.response"
          :question="question"
        />
      </q-card>
    </q-card-section>
    <q-card-actions class="q-px-none q-py-lg">
      <q-btn
        v-if="step === 0 && prevActionsIcon"
        square
        size="md"
        :icon="prevActionsIcon"
        @click="$emit('finished', [])"
      />
      <q-btn
        v-if="step > 0 && !hasResults"
        square
        size="md"
        icon="chevron_left"
        @click="step--"
      />
      <q-space />
      <q-btn
        square
        size="md"
        icon="chevron_right"
        :color="hasAnswer ? 'primary' : undefined"
        padding="sm 64px"
        @click="nextCliked"
      />
    </q-card-actions>
  </q-card>
  <q-card v-else class="q-pt-sm">
    <q-card-section v-if="title" class="q-pb-none">
      <div class="text-h5 text-center">{{ title }}</div>
    </q-card-section>
    <q-card-section>
      <q-card square>
        <q-card-section v-if="correctQuestions.length">
          <div class="text-h6 text-center">{{ $t("quiz.well_done") }}</div>
        </q-card-section>
        <q-list class="q-pa-md q-gutter-sm">
          <q-item
            v-for="q in correctQuestions"
            :key="q.id"
            class="bg-positive"
            clickable
            @click="step = activeQuestions.indexOf(q)"
          >
            <q-item-section avatar>
              <q-icon name="task_alt" />
            </q-item-section>
            <!-- eslint-disable vue/no-v-html -->
            <q-item-section class="text-ellipsis">
              <div v-html="renderKatex(q.text)"></div>
            </q-item-section>
            <q-item-section side> {{ q.points }} / 5 </q-item-section>
          </q-item>
        </q-list>
        <q-card-section v-if="wrongQuestions.length">
          <div class="text-h6 text-center">{{ $t("quiz.lets_review") }}</div>
        </q-card-section>
        <q-list class="q-pa-md q-gutter-sm">
          <q-item
            v-for="q in wrongQuestions"
            :key="q.id"
            class="bg-negative"
            clickable
            @click="step = activeQuestions.indexOf(q)"
          >
            <q-item-section avatar>
              <q-icon name="highlight_off" />
            </q-item-section>
            <!-- eslint-disable vue/no-v-html -->
            <q-item-section class="text-ellipsis">
              <div v-html="renderKatex(q.text)"></div>
            </q-item-section>
            <q-item-section side> {{ q.points }} / 5 </q-item-section>
          </q-item>
        </q-list>
        <q-card-section v-if="feedbacks.length">
          <div class="text-h6 text-center">{{ $t("quiz.thank_you") }}</div>
        </q-card-section>
        <q-list class="q-pa-md q-gutter-sm">
          <q-item
            v-for="q in feedbacks"
            :key="q.id"
            clickable
            @click="step = activeQuestions.indexOf(q)"
          >
            <q-item-section avatar>
              <q-icon :name="getFeedbackIcon(q)" />
            </q-item-section>
            <q-item-section class="text-ellipsis">
              {{ q.text }}
            </q-item-section>
            <q-item-section side> {{ q.response }} / 5 </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-card-section>
    <q-card-actions v-if="nextActionsIcon" class="q-px-none q-py-lg">
      <q-space />
      <q-btn
        square
        size="md"
        :icon="nextActionsIcon"
        color="primary"
        padding="sm 64px"
        @click="$emit('finished', activeQuestions)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import FeedbackQuestionDisplay from "./FeedbackQuestionDisplay.vue";
import RichTextRenderer from "src/components/common/RichTextRenderer.vue";

import { ref, computed, watch } from "vue";

import { useIris, useFormatter } from "src/composables/iris";
const { t } = useIris();
const { renderKatex } = useFormatter();

const props = defineProps({
  questions: { type: Array, default: () => [] },
  max: { type: Number, default: 0 },
  adaptative: { type: Boolean, default: false },
  examMode: { type: Boolean, default: false },
  nextActionsIcon: { type: String, default: "check" },
  prevActionsIcon: { type: String, default: "close" },
  title: { type: String, default: null },
});
const emit = defineEmits(["finished", "results", "feedback"]);

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
const getFeedbackIcon = (question) => {
  const feedbackType = question.options?.feedbackType;
  return Array.isArray(icons[feedbackType])
    ? icons[feedbackType][question.response - 1]
    : icons[feedbackType];
};

const levels = ["novice", "beginner", "intermediate", "advanced", "expert"];

let step = ref(0);
let realMax = computed(() => props.max || props.questions.length);
let questionsPerLevels = {};
let activeQuestions = ref([]);
let previousQuestions = [];
let getActiveQuestions = () => {
  if (!previousQuestions.length) {
    // check if there are some questions that have been validated, and add them tot he list
    props.questions.forEach((question) => {
      if (question.validated) {
        previousQuestions.push(question);
      }
    });
    if (previousQuestions.length >= realMax.value) {
      step.value = realMax.value;
    }
  }

  if (previousQuestions.length >= realMax.value) {
    return previousQuestions;
  }
  // pick the questions to display
  if (!props.adaptative || realMax.value === props.questions.length) {
    let q = [...props.questions];
    previousQuestions = q
      .sort((a, b) => a.order - b.order)
      .slice(0, realMax.value);
    return previousQuestions;
  }

  if (props.examMode) {
    // create the final quiz
    let q = [];
    let i = 0;
    while (q.length < realMax.value) {
      const keys = Object.keys(questionsPerLevels);
      let level = keys[i % keys.length];
      if (questionsPerLevels[level].length) {
        q.push(questionsPerLevels[level].pop());
      }
      i++;
    }
    previousQuestions = q;
    return previousQuestions;
  }
  // we update the question that have not been validated, depending on what the
  // user has answered, if the user sucess rate for a difficulty and all the ones bellow
  // is under 60% of sucess rate, we show question of the lover difficulty
  // if this is above 80% we show question of the next difficulty
  // if we do not know, we use difficulty=2
  // then we add one extra question to the quiz

  // compute the suces rate per level
  let acc = [0, 1, 2, 3, 4].map(() => ({ total: 0, valid: 0 }));
  let validatedQuestions = [];
  let difficulties = previousQuestions.reduce((acc, q) => {
    if (!q.validated) return acc;
    validatedQuestions.push(q);
    acc[q.difficulty - 1].total++;
    if (q.valid) acc[q.difficulty - 1].valid++;
    return acc;
  }, acc);

  /// acculate the lover levels failurs
  for (let i = 0; i < 4; i++) {
    const failure = difficulties[i].total - difficulties[i].valid;
    difficulties[i + 1].total += failure;
  }
  // accumulate higher level sucess
  for (let i = 4; i > 0; i--) {
    difficulties[i - 1].total += difficulties[i].valid;
    difficulties[i - 1].valid += difficulties[i].valid;
  }
  // find the difficulty to use for the next question
  console.log("difficulties", difficulties);
  // start with beginner level
  if (difficulties[1].total < 3) {
    let level = levels[1];
    if (questionsPerLevels[level]?.length) {
      console.log("inital level", level);
      previousQuestions.push(questionsPerLevels[level].pop());
      return previousQuestions;
    }
    let j = 0;
    while (j < 5) {
      let level = levels[j];
      if (questionsPerLevels[level]?.length) {
        console.log("inital level", level);
        previousQuestions.push(questionsPerLevels[level].pop());
        return previousQuestions;
      }
      j++;
    }
  }
  // If the user failed twice in a row for the same level, we go down one level
  validatedQuestions = validatedQuestions.reverse();
  if (
    validatedQuestions.length > 2 &&
    validatedQuestions[0].difficulty > 1 &&
    validatedQuestions[0].difficulty === validatedQuestions[1].difficulty &&
    !validatedQuestions[0].valid &&
    !validatedQuestions[1].valid
  ) {
    let level = levels[validatedQuestions[0].difficulty - 2];
    // no loop here, if there are no easier question, then we keep the current level
    if (questionsPerLevels[level]?.length) {
      console.log("down level", level);
      previousQuestions.push(questionsPerLevels[level].pop());
      return previousQuestions;
    }
  }

  for (let i = 0; i < 5; i++) {
    const rate = difficulties[i].total
      ? difficulties[i].valid / difficulties[i].total
      : 0;
    if (rate < 0.75) {
      let j = i;
      // we get question from this level, or lower, if there are any
      while (j >= 0) {
        let level = levels[j];
        if (questionsPerLevels[level]?.length) {
          console.log("getting level", level);
          previousQuestions.push(questionsPerLevels[level].pop());
          return previousQuestions;
        }
        j--;
      }
    }
  }
  // we get question from the expert level, or lower, if there aren't any
  let j = 4;
  while (j >= 0) {
    let level = levels[j];
    if (questionsPerLevels[level]?.length) {
      console.log("highest level", level);
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

  // randomize the order of the questions in the levels
  questionsPerLevels = Object.keys(questionsPerLevels).reduce((acc, level) => {
    acc[level] = questionsPerLevels[level].sort((a, b) => a.order - b.order);
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
        question.response === undefined
          ? question.type === "checkbox"
            ? []
            : question.type === "feedback"
              ? NaN
              : undefined
          : question.response;
      question.time = question.time || 0;
      question.level = question.level || "intermediate";
      question.order = question.order || Math.random();
      question.difficulty =
        question.difficulty || levels.indexOf(question.level) + 1 || 3;
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
    previousQuestions = [];
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
    console.log("results", activeQuestions.value);
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
const hasAnswer = computed(() => question.value.response !== undefined);

const getOptions = (question) => {
  if (!question) return {};
  if (question.type === "radio" || question.type === "checkbox") {
    const options = question.answers.map((answer, index) => ({
      order: answer.order,
      label: answer.text,
      value: index,
      checkedIcon: question.type === "radio" ? "task_alt" : undefined,
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
      if (question.response?.toLowerCase() === answer.text.toLowerCase()) {
        valid = answer.valid;
      }
    });
  }
  if (question.type === "feedback") {
    valid = true;
  }
  question.valid = valid;
  question.points = valid ? 5 : 0;

  if (valid) {
    step.value++;
  }
};

const correctQuestions = computed(() =>
  activeQuestions.value.filter((q) => q.valid && q.type !== "feedback"),
);

const wrongQuestions = computed(() =>
  activeQuestions.value.filter((q) => !q.valid && q.type !== "feedback"),
);

const feedbacks = computed(() =>
  activeQuestions.value.filter((q) => q.type === "feedback"),
);
</script>
