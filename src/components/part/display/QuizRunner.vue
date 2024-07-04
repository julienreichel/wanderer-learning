<template>
  <q-card class="q-pt-sm" v-if="question" style="min-height: 500px; display: flex; flex-direction: column;">
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
        v-model="newResponse"
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
        v-model="newResponse"
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
        v-if="progress > 0"
        size="sm"
        icon="arrow_back"
        @click="step--"
      />
      <q-space />
      <q-btn
        square
        size="sm"
        icon="arrow_forward"
        @click="question.validated ? step++ : validateAnswers()"
      />
    </q-card-actions>
  </q-card>
  <q-card class="q-pt-sm" v-else>
    <q-list>
      <q-item v-for="q in activeQuestions" :key="q.id">
        <q-item-section>
          <q-item-label>
            <q-icon
              :name="q.response.valid ? 'check' : 'close'"
              :color="q.response.valid ? 'positive' : 'negative'"
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
        icon="close"
        @click="$emit('finished', activeQuestions)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  questions: { type: Array },
  max: { type: Number, default: 10 },
  adaptative: { type: Boolean, default: false },
  examMode: { type: Boolean, default: false },
});
const emit = defineEmits(["finished"]);
import { useIris } from "src/composables/iris";
const { router, t } = useIris();

let step = ref(0);
let realMax = computed(() => props.max || props.questions.length);
const progress = computed(() => step.value / realMax.value);
let activeQuestions = computed(() => {
  console.log("activeQuestions");
  // randomize the orderof the answers
  props.questions.forEach((question) => {
    question.answers.forEach((answer) => {
      answer.order = Math.random();
    });
  });
  let q = [...props.questions];
  if (!props.adaptative) {
    return q.sort(() => Math.random() - 0.5).slice(0, realMax.value);
  }
  // TODO: implement adaptative mode
  return q.sort(() => Math.random() - 0.5);
});
const question = computed(() => activeQuestions.value[step.value]);
let newResponse = ref(null);
watch(
  question,
  (question) => {
    if (!question) return;
    if (question.validated) {
      newResponse.value = question.response.value;
    } else {
      newResponse.value = question.type === "checkbox" ? [] : undefined;
    }
  },
  { immediate: true },
);

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
        icon: question.response.valid ? "check" : "close",
        color: question.response.valid ? "positive" : "negative",
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
    valid = question.value.answers[newResponse.value]?.valid;
  }
  if (question.value.type === "checkbox") {
    valid = true;
    question.value.answers.forEach((answer, idx2) => {
      const found =
        newResponse.value.find((value) => value === idx2) !== undefined;
      if (found && !answer.valid) valid = false;
      if (!found && answer.valid) valid = false;
    });
  }
  if (question.value.type === "shorttext") {
    valid = false;
    question.value.answers.forEach((answer) => {
      if (newResponse.value?.toLowerCase() === answer.text.toLowerCase()) {
        valid = answer.valid;
      }
    });
  }
  question.value.response = {
    value: newResponse.value,
    valid,
    points: valid ? 10 : 0,
  };
};
</script>
