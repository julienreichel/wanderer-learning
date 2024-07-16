<template>
  <q-page class="q-pa-none q-pt-sm q-gutter-sm" v-if="lectureStep">
    <q-card class="q-mb-md">
      <q-input
        class="q-pa-sm"
        outlined
        v-model="lectureStep.title"
        :label="$t('step.form.title')"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />
      <div class="row q-pa-sm">
        <concept-selecting
          class="col-8"
          v-model="lectureStep.conceptId"
          :placeholder="$t('concept.form.edit')"
          outlined
        />
        <difficulty-slider
          class="col-4"
          :level="lectureStep.level"
          @level="(value) => (lectureStep.level = value)"
        />
      </div>
    </q-card>
    <parts-editing
      v-if="lectureStep.lecture"
      v-model="lectureStep.parts"
      :stepIdx="stepIdx"
      @finished="finish"
      :lectureId="lectureStep.lecture.id"
    ></parts-editing>
  </q-page>
</template>

<script setup>
import PartsEditing from "src/components/part/editing/PartsEditing.vue";
import DifficultySlider from "src/components/common/DifficultySlider.vue";
import ConceptSelecting from "src/components/concept/ConceptSelecting.vue";

import { ref, inject, onMounted, onBeforeUnmount } from "vue";

import { useIris } from "src/composables/iris";
const { t, $q, router } = useIris();
const { lectureStep: lectureStepService } = inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");

const props = defineProps({
  id: String,
  stepIdx: {
    type: String,
    default: "0",
  },
});

const lectureStep = ref();

const toJSON = ({ title, type, parts, level, conceptId }) => {
  // keep only the necessary fields
  parts = parts.map(({ type, text, src, questions, options }) => {
    questions = questions?.map(
      ({ id, type, text, answers, options, level, conceptId }) => {
        answers = answers.map(({ text, valid }) => ({ text, valid }));
        return { id, type, text, answers, options, level, conceptId };
      },
    );
    return { type, text, src, questions, options };
  });

  let simplified = { title, type, parts, level, conceptId };
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
      color: "warning",
      icon: "cloud_done",
      message: err.errors[0]?.message || t("error.form.save_error"),
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
      {
        label: data.lecture.course.title,
        to: { name: "CourseEdit", params: { id: data.lecture.course.id } },
      },
      {
        label: data.lecture.title,
        to: { name: "LectureEdit", params: { id: data.lecture.id } },
      },
      {
        label: data.title,
        id: data.id,
        view: "LectureStepView",
        beforeNavigate: saveSteps,
      },
    ]);
    lectureStepInitial = toJSON(data);
  }
});

onBeforeUnmount(async () => {
  saveSteps();
});

const finish = async () => {
  router.push({
    name: "LectureEdit",
    params: { id: lectureStep.value.lecture.id },
  });
};
</script>
