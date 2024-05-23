<template>
  <q-card v-for="(question, index) in quiz" :key="index">
    <question-editing v-if="activeQuestion === index" v-model="quiz[index]" />
    <question-editing-preview v-else :question="question" @selected="activeQuestion = index"/>
    <q-card-actions>
      <q-space />
      <q-btn
        v-if="index > 0"
        size="sm"
        icon="arrow_upward"
        @click="moveUpQuestion({ index, question })"
      />
      <q-btn
        v-if="index < quiz.length - 1"
        size="sm"
        icon="arrow_downward"
        @click="moveDownQuestion({ index, question })"
      />
      <q-btn
        size="sm"
        icon="content_copy"
        @click="copyQuestion({ index, question })"
      />
      <q-btn
        size="sm"
        icon="delete"
        @click="removeQuestion({ index, question })"
      />
    </q-card-actions>
  </q-card>
  <q-card>
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
    </q-card-actions>
  </q-card>
</template>

<script setup>
import QuestionEditing from "src/components/part/QuestionEditing.vue";
import QuestionEditingPreview from "src/components/part/QuestionEditingPreview.vue";

import { ref, watch } from 'vue';

import { useIris } from "src/composables/iris";
const { uid } = useIris();

const quiz = defineModel();
if (!quiz.value) {
  quiz.value = [];
}

const activeQuestion = ref(0);
watch(quiz, (value) => {
  activeQuestion.value = Math.min(activeQuestion.value, value.length - 1);
});

const removeQuestion = ({ index }) => {
  return quiz.value.splice(index, 1)[0];
};

const copyQuestion = ({ index }) => {
  const src = quiz.value[index];
  const copy = JSON.parse(JSON.stringify(src));
  copy.id = uid();
  quiz.value.splice(index, 0, copy);
  activeQuestion.value = index;
};

const moveUpQuestion = ({ index }) => {
  const question = removeQuestion({ index });
  quiz.value.splice(index - 1, 0, question);

  if (activeQuestion.value === index ) {
    console.log("move up");
    activeQuestion.value = activeQuestion.value - 1;
  } else if (activeQuestion.value === index - 1 ) {
    activeQuestion.value = activeQuestion.value + 1;
  }
};

const moveDownQuestion = ({ index }) => {
  const question = removeQuestion({ index });
  quiz.value.splice(index + 1, 0, question);

  if (activeQuestion.value === index ) {
    activeQuestion.value = activeQuestion.value + 1;
  } else if (activeQuestion.value === index + 1 ) {
    activeQuestion.value = activeQuestion.value - 1;
  }
};

const addQuestion = (type) => {
  quiz.value.push({
    id: uid(),
    type,
    text: "",
    answers: [],
    options: [],
  });
};
</script>
