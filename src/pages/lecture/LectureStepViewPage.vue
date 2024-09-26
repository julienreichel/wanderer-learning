<template>
  <q-page v-if="lectureStep.id" class="q-pa-none q-pt-sm q-gutter-sm">
    <q-card class="gt-sm">
      <q-card-section>
        <div class="text-h5">{{ lectureStep.title }}</div>
      </q-card-section>
      <q-card-actions class="q-px-none q-py-lg">
        <q-btn square size="md" icon="chevron_left" @click="finished()" />
      </q-card-actions>
    </q-card>
    <parts-display
      :parts="lectureStep.parts"
      udpdate-route
      :step-idx="stepIdx"
      :previous-reports="activeReport?.reportings"
      :answered-questions="activeReport?.responses"
      @updated="updated"
      @finished="finished"
    />
  </q-page>
</template>

<script setup>
import PartsDisplay from "src/components/part/display/PartsDisplay.vue";

import { ref, onMounted, inject } from "vue";

import { useIris } from "src/composables/iris";
const { router, canEdit, debounce } = useIris();
const {
  lectureStep: lectureStepService,
  stepReporting: stepReportingService,
  course: courseService,
} = inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
const userAttributes = inject("userAttributes");
const { username, userId } = userAttributes.value;

const props = defineProps({
  id: { type: String, required: true },
  stepIdx: {
    type: String,
    default: "0",
  },
});

const lectureStep = ref({});
let activeReport = ref(null);
onMounted(async () => {
  const data = await lectureStepService.get(props.id);

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

  const existingReports = await stepReportingService.list({ lectureStepId: data.id, userId, username });
  activeReport.value = existingReports.find((report) => report.inProgress);

  lectureStep.value = data;

});

const saveReport = async (reportings, responses, inProgress) => {
  console.log("saveReport", reportings, responses, inProgress);
  if (activeReport.value) {
    activeReport.value = await stepReportingService.update({
      ...activeReport.value,
      reportings,
      responses,
      inProgress
    });
  } else {
    activeReport.value = await stepReportingService.create({
      lectureStepId: lectureStep.value.id,
      lectureId: lectureStep.value.lecture.id,
      reportings,
      responses,
      type: "lecture",
    });
  }
};
const debouncedSaveReport = debounce(saveReport, 500); // 500 milliseconds delay

const updated = async ({ reportings, responses } = {}) => {
  debouncedSaveReport(reportings, responses, true);
};

const finished = async ({ finished, reportings, responses } = {}) => {
  debouncedSaveReport(reportings, responses, !finished);

  // if there is a stars count, update the course stars
  const starValues = responses
    ?.filter((response) => response.feedbackType === "stars")
    .map((response) => Number(response.response));

  if (starValues?.length) {
    let course = lectureStep.value.lecture.course;
    const stars = Math.round(
      starValues.reduce((a, b) => a + b, 0) / starValues.length,
    );
    if (!lectureStep.value.lecture.course.ratings) {
      course.ratings = [{ value: stars, reportingId: activeReport.value.id }];
    } else {
      course.ratings.push({ value: stars, reportingId: activeReport.value.id });
    }
    courseService.update(course);
  }

  router.push({
    name: "LectureView",
    params: { id: lectureStep.value.lecture.id },
  });
};
</script>
