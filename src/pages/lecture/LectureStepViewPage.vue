<template>
  <q-page v-if="lectureStep.id" class="q-pa-md q-gutter-sm">
    <q-card class="gt-sm">
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
const {
  lectureStep: lectureStepService,
  stepReporting: stepReportingService,
  course: courseService,
} = inject("services");

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
  if (!finished || time < 5) {
    console.log("[Lecture] Step not completed", reportings);
    $q.notify({
      message: t("lecture.step.not_completed"),
      color: "warning",
    });
  } else {
    const report = await stepReportingService.create({
      lectureStepId: lectureStep.value.id,
      lectureId: lectureStep.value.lecture.id,
      reportings,
    });

    // if there is a stars count, update the course stars
    let starValues = [];
    reportings.forEach((partReport) => {
      const response = partReport.responses?.find(
        (response) => response.feedbackType === "stars",
      );
      if (response) {
        starValues.push(Number(response.response));
      }
    });
    if (starValues.length > 0) {
      let course = lectureStep.value.lecture.course;
      const stars = Math.round(
        starValues.reduce((a, b) => a + b) / starValues.length,
      );
      if (!lectureStep.value.lecture.course.ratings) {
        course.ratings = [{ value: stars, reportingId: report.id }];
      } else {
        course.ratings.push({ value: stars, reportingId: report.id });
      }
      courseService.update(course);
    }
  }

  router.push({
    name: "LectureView",
    params: { id: lectureStep.value.lecture.id },
  });
};
</script>
