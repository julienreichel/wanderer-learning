<template>
  <q-card
    v-for="(question, index) in quiz.questions"
    :key="index"
    @click="activeQuestion = index"
    :class="{ 'q-card-hover': activeQuestion !== index }"
  >
    <question-editing
      v-if="activeQuestion === index"
      v-model="quiz.questions[index]"
    />
    <q-card-actions>
      <question-editing-preview
        v-if="activeQuestion !== index"
        :question="question"
        @selected="activeQuestion = index"
      />
      <q-space />
      <q-btn
        v-if="activeQuestion === index"
        size="sm"
        icon="unfold_less"
        @click.stop="activeQuestion = undefined"
      />
      <q-btn
        v-if="index > 0"
        size="sm"
        icon="arrow_upward"
        @click.stop="moveUpQuestion({ index, question })"
      />
      <q-btn
        v-if="index < quiz.questions.length - 1"
        size="sm"
        icon="arrow_downward"
        @click.stop="moveDownQuestion({ index, question })"
      />
      <q-btn
        size="sm"
        icon="content_copy"
        @click.stop="copyQuestion({ index, question })"
      />
      <q-btn
        size="sm"
        icon="delete"
        @click.stop="removeQuestion({ index, question })"
      />
    </q-card-actions>
  </q-card>
  <q-card>
    <q-card-section>
      <div class="row q-gutter-sm">
        <q-item class="col col-md-3">
          <q-item-section avatar>
            <q-icon name="assignment" />
          </q-item-section>
          <q-item-section>
            <q-toggle
              v-model="examMode"
              :label="$t('quiz.question.exam_mode')"
            />
          </q-item-section>
        </q-item>
        <q-item class="col col-md-3">
          <q-item-section avatar>
            <q-icon name="help_center" />
          </q-item-section>
          <q-item-section>
            <q-slider
              snap
              label
              switch-label-side
              v-model="nbQuestions"
              :label-value="
                nbQuestions +
                ' ' +
                $t('quiz.question.nb_questions', nbQuestions)
              "
              :min="1"
              :inner-max="nbMaxQuestions"
              :max="20"
            />
          </q-item-section>
        </q-item>
      </div>
    </q-card-section>
    <q-card-actions>
      <q-space />
      <q-btn
        size="sm"
        icon="add"
        icon-right="short_text"
        @click="addQuestion('shorttext')"
      />
      <q-btn
        size="sm"
        icon="add"
        icon-right="radio_button_checked"
        @click="addQuestion('radio')"
      />
      <q-btn
        size="sm"
        icon="add"
        icon-right="check_box"
        @click="addQuestion('checkbox')"
      />
      <q-btn
        size="sm"
        icon="add"
        icon-right="rate_review"
        @click="addQuestion('feedback')"
      />
      <q-btn
        size="sm"
        icon="switch_access_shortcut_add"
        @click="wizardVisible = true"
      />
    </q-card-actions>
  </q-card>
  <question-generation-dialog
    v-model="wizardVisible"
    :parts="parts"
    @questions="applyQuestions"
  />
</template>

<script setup>
import QuestionEditing from "src/components/part/editing/QuestionEditing.vue";
import QuestionEditingPreview from "src/components/part/editing/QuestionEditingPreview.vue";
import QuestionGenerationDialog from "src/components/part/editing/QuestionGenerationDialog.vue";

import { computed, ref, watch, inject } from "vue";

import { useIris } from "src/composables/iris";
const { uid } = useIris();

const props = defineProps({
  parts: { type: Array },
});

let quiz = defineModel();
if (!quiz.value) {
  quiz.value = {
    questions: [],
  };
}

let activeQuestion = ref(0);
watch(
  () => quiz.value.questions,
  (value) => {
    activeQuestion.value = value.length > 1 ? undefined : 0;
  },
);

let nbQuestions = ref(Number(quiz.value.options.nbQuestions) || 5);
watch(nbQuestions, (value) => {
  quiz.value.options.nbQuestions = "" + value;
});
let nbMaxQuestions = computed(() =>
  Math.min(Math.floor(quiz.value.questions.length), 20),
);

let examMode = ref(quiz.value.options.examMode === "true");
watch(examMode, (value) => {
  quiz.value.options.examMode = value;
});

const removeQuestion = ({ index }) => {
  return quiz.value.questions.splice(index, 1)[0];
};

const copyQuestion = ({ index }) => {
  const src = quiz.value.questions[index];
  const copy = JSON.parse(JSON.stringify(src));
  copy.id = uid();
  quiz.value.questions.splice(index, 0, copy);
  activeQuestion.value = index;
};

const moveUpQuestion = ({ index }) => {
  const question = removeQuestion({ index });
  quiz.value.questions.splice(index - 1, 0, question);

  if (activeQuestion.value === index) {
    activeQuestion.value = activeQuestion.value - 1;
  } else if (activeQuestion.value === index - 1) {
    activeQuestion.value = activeQuestion.value + 1;
  }
};

const moveDownQuestion = ({ index }) => {
  const question = removeQuestion({ index });
  quiz.value.questions.splice(index + 1, 0, question);

  if (activeQuestion.value === index) {
    activeQuestion.value = activeQuestion.value + 1;
  } else if (activeQuestion.value === index + 1) {
    activeQuestion.value = activeQuestion.value - 1;
  }
};

const addQuestion = (type) => {
  quiz.value.questions.push({
    id: uid(),
    type,
    text: "",
    answers: [],
    options: [],
  });
};

let wizardVisible = ref(false);
const applyQuestions = async ({ questions }) => {
  if (
    quiz.value.questions.length == 1 &&
    !quiz.value.questions[0].answers.length
  ) {
    quiz.value.questions = questions;
  } else {
    quiz.value.questions.push(...questions);
  }
};
</script>
