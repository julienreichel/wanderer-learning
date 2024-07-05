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
        v-if="step > 0"
        size="sm"
        icon="arrow_back"
        @click="step--"
      />
      <q-space />
      <q-btn
        square
        size="sm"
        icon="arrow_forward"
        @click="question.validated ? (hasResults ? step = activeQuestions.length : step++) : validateAnswers()"
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
const { router, t } = useIris();

let step = ref(0);
let realMax = computed(() => props.max || props.questions.length);


watch(() => props.questions, () => {
  props.questions.forEach((question) => {
    question.answers.forEach((answer) => {
      answer.order = answer.order || Math.random();
    });
    question.response = question.response || ( question.type === "checkbox" ? [] : undefined );
    question.time = question.time || 0;
  });
  step.value = 0;
}, { immediate: true });
let activeQuestions = computed(() => {
  // pick the questions to display
  let q = [...props.questions];
  if (!props.adaptative) {
    return q.sort(() => Math.random() - 0.5).slice(0, realMax.value);
  }
  // TODO: implement adaptative mode
  return q.sort(() => Math.random() - 0.5);
});
const  hasResults = computed(() => activeQuestions.value.every((q) => q.validated));
watch(hasResults, (hasResults) => {
  if (hasResults) {
    emit("results", activeQuestions.value);
  }
});

const progress = computed(() => hasResults.value ? 1 : step.value / realMax.value);

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

const validateAnswers = () => {
  question.value.validated = true;
  let valid = false;

  if (question.value.type === "radio") {
    valid = question.value.answers[question.value.response]?.valid;
  }
  if (question.value.type === "checkbox") {
    valid = true;
    question.value.answers.forEach((answer, idx2) => {
      const found =
        question.value.response.find((value) => value === idx2) !== undefined;
      if (found && !answer.valid) valid = false;
      if (!found && answer.valid) valid = false;
    });
  }
  if (question.value.type === "shorttext") {
    valid = false;
    question.value.answers.forEach((answer) => {
      if (question.value.response?.toLowerCase() === answer.text.toLowerCase()) {
        valid = answer.valid;
      }
    });
  }
  question.value.valid = valid;
  question.value.points = valid ? 10 : 0;
};


</script>
