<template>
  <q-page v-if="lectureStep.id" class="q-pa-md q-gutter-sm">
    <q-card>
      <q-card-section>
        <div class="text-h5">{{ lectureStep.title }}</div>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn square size="sm" icon="straight" @click="finished()" />
      </q-card-actions>
    </q-card>
    <parts-display
      :parts="lectureStep.parts"
      @finished="finished"
      :stepIdx="stepIdx"
    />
  </q-page>
</template>

<script setup>
import PartsDisplay from "src/components/part/display/PartsDisplay.vue";

import { ref, onMounted, inject } from "vue";

import { useIris } from "src/composables/iris";
const { t, $q, router, canEdit } = useIris();
const { lectureStep: lectureStepService, stepReporting: stepReportingService } =
  inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");

const props = defineProps({
  id: String,
  stepIdx: {
    type: String,
    default: "0",
  },
});

const lectureStep = ref({});
onMounted(async () => {
  const data = await lectureStepService.get(props.id);
  lectureStep.value = data;

  const edit = canEdit(data) ? "LectureStepEdit" : null;
  updateBreadcrumbs([
    { label: t("course.list"), to: { name: "CourseList" } },
    {
      label: data.lecture.course.title,
      to: { name: "CourseView", params: { id: data.lecture.course.id } },
    },
    {
      label: data.lecture.title,
      to: { name: "LectureView", params: { id: data.lecture.id } },
    },
    { label: data.title, id: data.id, edit },
  ]);
});

const finished = async ({ finished, reportings } = {}) => {
  const time = reportings?.reduce((acc, val) => acc + val.time, 0) || 0;
  if (!finished || time < 10) {
    console.log("[Lecture] Step not completed", reportings);
    $q.notify({
      message: t("lecture.step.not_completed"),
      color: "warning",
    });
  } else {
    await stepReportingService.create({
      lectureStepId: lectureStep.value.id,
      lectureId: lectureStep.value.lecture.id,
      reportings,
    });
  }

  router.push({
    name: "LectureView",
    params: { id: lectureStep.value.lecture.id },
  });
};
</script>
