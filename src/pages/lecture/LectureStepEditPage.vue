<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-card>
      <q-input
        class="q-pa-sm"
        outlined
        v-model="lectureStep.title"
        :label="$t('step.form.title')"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />
    </q-card>
    <parts-editing
      v-model="lectureStep.parts"
      :stepIdx="stepIdx"
      @finished="finish"
    ></parts-editing>
  </q-page>
</template>

<script setup>
import PartsEditing from 'src/components/part/PartsEditing.vue';

import { ref, inject, onMounted, onBeforeUnmount } from 'vue';

import { useIris } from 'src/composables/iris';
const { t, $q, router } = useIris();
const {lectureStep: lectureStepService} = inject('services');

const { updateBreadcrumbs } = inject('breadcrumbs');
const userAttributes = inject('userAttributes');
const { identityId } = userAttributes.value;
const props = defineProps({
  id: String,
  stepIdx: {
    type: String,
    default: '0'
  }
});

const lectureStep = ref({
  title: null,
  parts: [],
  identityId,
});

const toJSON = ({ title, type, parts }) => {
  // keep only the necessary fields
  parts = parts.map(({type, text, src, questions, options}) => {
    questions = questions?.map(({id, type, text, answers, options}) => {
      answers = answers.map(({text, valid}) => ({text, valid}));
      if (options){
        delete options.__typename;
        options = options.map(({name, value}) => ({name, value}));
      }
      return {id, type, text, answers, options};
    });
    if (options){
      delete options.__typename;
      options = options.map(({name, value}) => ({name, value}));
    }
    return {type, text, src, questions, options};
  });

  let simplified = { title, type, parts};
  return JSON.stringify(simplified);
};

let lectureStepInitial = null;
const saveSteps = async () => {
  const lectureStepCurrent = toJSON(lectureStep.value);
  if (lectureStepInitial === lectureStepCurrent) {
    return true;
  }
  lectureStepInitial = lectureStepCurrent;
  try {
    if (props.id) {
      await lectureStepService.update(lectureStep.value);
    } else {
      await lectureStepService.create(lectureStep.value);
    }
  } catch (err) {
    lectureStepInitial = null;
    console.log(err);
    $q.notify({
      color: 'warning',
      icon: 'cloud_done',
      message: err.errors[0]?.message || t('error.form.save_error'),
    });
    return false;
  }
  return true;
};

onMounted(async () => {
  if (props.id) {
    const data = await lectureStepService.get(props.id);
    if (!data.parts) {
      data.parts = [];
    }
    lectureStep.value = data;

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
      { label: data.title, id: data.id, view: 'LectureStepView', beforeNavigate: saveSteps},
    ]);
    lectureStepInitial = toJSON(data);
  }
});

onBeforeUnmount(async () => {
  saveSteps();
});

const finish = async () => {
  console.log('finish', lectureStep.value);
  router.push({
    name: 'LectureEdit',
    params: { id: lectureStep.value.lecture.id },
  });
};
</script>
