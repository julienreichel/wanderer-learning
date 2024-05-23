<template>
  <q-card v-for="(question, index) in quiz"
    :key="index"
    >
      <question-editing
      v-model="quiz[index]"
    />
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
    </q-card-actions>
  </q-card>
</template>

<script setup>
import QuestionEditing from 'src/components/part/QuestionEditing.vue';

import { useIris } from 'src/composables/iris';
const { uid } = useIris();

const quiz = defineModel();
if (!quiz.value) {
  quiz.value = [];
}

const removeQuestion = ({ index }) => {
  return quiz.value.splice(index, 1)[0];
};

const copyQuestion = ({ index }) => {
  const src = quiz.value[index];
  const copy = JSON.parse(JSON.stringify(src));
  copy.id = uid();
  quiz.value.splice(index, 0, copy);
};

const moveUpQuestion = ({ index }) => {
  const question = removeQuestion({index});
  quiz.value.splice(index - 1, 0, question);
};

const moveDownQuestion = ({ index }) => {
  const question = removeQuestion({index});
  quiz.value.splice(index + 1, 0, question);
};

const addQuestion = (type) => {
  quiz.value.push({
    id: uid(),
    type,
    text: '',
    answers: [],
    options: []
  });
};
</script>
