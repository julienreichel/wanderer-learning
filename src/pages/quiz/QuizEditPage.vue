<template>
  <q-page class="q-pa-sm q-gutter-sm">
    <q-card v-if="quiz">
      <q-input
        class="q-pa-sm"
        outlined
        v-model="quiz.title"
        :label="$t('quiz.form.title')"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />
    </q-card>
    <questions-editing
      v-model="quiz.parts[0].questions"
      @finished="finish"
    ></questions-editing>
  </q-page>
</template>

<script setup>
import QuestionsEditing from 'src/components/part/QuestionsEditing.vue';

import { ref, inject, onMounted, onBeforeUnmount } from 'vue';

import { useIris } from 'src/composables/iris';
const { t, $q, router } = useIris();
const {lectureStep: lectureStepService} = inject('services');

const { updateBreadcrumbs } = inject('breadcrumbs');

const props = defineProps({
  id: String,
});

const quiz = ref({
  title: null,
  parts: [ { type: 'quiz', questions: [] }],
  identityId: inject('identityId'),
});

const toJSON = ({ title, type, parts }) => {
  // keep only the necessary fields
  parts = parts.map(({type, text, src, questions, options}) => {
    questions = questions.map(({id, type, text, answers, options}) => {
      answers = answers.map(({text, valid}) => ({text, valid}));
      if (options){
        delete options.__typename;
      }
      return {id, type, text, answers, options};
    });
    if (options){
      delete options.__typename;
    }
    return {type, text, src, questions, options};
  });

  let simplified = { title, type, parts};
  return JSON.stringify(simplified);
};
let lectureStepInitial = null;
const saveSteps = async () => {
  const lectureStepCurrent = toJSON(quiz.value);
  if (lectureStepInitial === lectureStepCurrent) {
    return true;
  }
  lectureStepInitial = lectureStepCurrent;
  try {
    if (props.id) {
      await lectureStepService.update(quiz.value);
    } else {
      await lectureStepService.create(quiz.value);
    }

  } catch (err) {
    lectureStepInitial = null;
    console.log(err);
    $q.notify({
      color: 'warning',
      icon: 'cloud_done',
      message: err?.errors?.[0]?.message || t('error.form.save_error'),
    });
    return false;
  }
  return true;
};

onMounted(async () => {
  if (props.id) {
    const data = await lectureStepService.get(props.id);
    if (!data.parts || !data.parts.length) {
      data.parts = [{ type: 'quiz', questions: [] }];
    }
    quiz.value = data;
    quiz.value.parts[0].type = 'quiz';
    updateBreadcrumbs([
      { label: t('course.list'), to: { name: 'CourseList' } },
      {
        label: data.lecture.course.title,
        to: { name: 'CourseEdit', params: { id: data.lecture.course.id } },
      },
      {
        label: data.lecture.title,
        to: { name: 'LectureEdit', params: { id: data.lecture.id } },
      },
      { label: data.title, id: data.id, stepIdx: 0, view: 'QuizView', beforeNavigate: saveSteps},
    ]);
    lectureStepInitial = toJSON(data);;
  }
});

onBeforeUnmount(async () => {
  saveSteps();
});

const finish = async () => {
  router.push({ name: 'LectureEdit', params: { id: quiz.value.lectureID } });
};
</script>
