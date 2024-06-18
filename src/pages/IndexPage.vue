<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-card>
      <q-card-section v-if="lecturesInProgress.length">
        <div class="text-h5">{{ $t("generic.lectures_in_progress") }}</div>
      </q-card-section>
      <q-card-section class="q-pa-sm q-gutter-sm">
        <lectures-editing v-model="lecturesInProgress" />
      </q-card-section>
    </q-card>
    <q-card>
      <q-card-section>
        <div class="text-h5">{{ $t("generic.related_concepts") }}</div>
      </q-card-section>
      <concept-display :concepts="connectedConcepts" />
    </q-card>
    <q-card>
      <q-card-section v-if="similarLectures.length">
        <div class="text-h5">{{ $t("generic.related_lectures") }}</div>
      </q-card-section>
      <q-card-section class="q-pa-sm q-gutter-sm">
        <lectures-editing v-model="similarLectures" />
      </q-card-section>
    </q-card>
    <q-card v-if="newuser">
      <q-card-section>
        <div class="text-h5">{{ $t("generic.welcome") }}</div>
        <div>{{ $t("generic.getting_started") }}</div>
      </q-card-section>
      <q-card-section class="q-pa-md q-gutter-sm">
        <q-btn
          :label="$t('course.list')"
          @click="$router.push({ name: 'CourseList' })"
        />
        <q-btn
          :label="$t('concept.list')"
          @click="$router.push({ name: 'ConceptList' })"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import LecturesEditing from "src/components/lecture/LecturesEditing.vue";
import ConceptDisplay from "src/components/concept/ConceptDisplay.vue";

import { ref, inject, onMounted, computed } from "vue";

const {
  stepReporting: reportingService,
  lecture: lectureService,
  concept: conceptService,
} = inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
updateBreadcrumbs([{}]);
const userAttributes = inject("userAttributes");

const { username, userId } = userAttributes.value;
const lecturesInProgress = ref([]);
const similarLectures = ref([]);
const connectedConcepts = ref([]);
const newuser = computed(
  () =>
    lecturesInProgress.value.length === 0 &&
    similarLectures.value.length === 0 &&
    connectedConcepts.value.length === 0,
);
onMounted(async () => {
  // Get the last 3 reports
  const data = await reportingService.list({ userId, username, limit: 3 });

  let processedLectureIds = [];
  for(const report of data) {
    // get the lecture if not already processed
    if (processedLectureIds.includes(report.lectureId)) return;
    const lecture = await lectureService.get(report.lectureId);
    processedLectureIds.push(lecture.id);
    if (!lecture) return;

    // check if there in a next step in the lecture based report.lectureStepId
    lecture.steps.forEach((step, index) => {
      if (step.id === report.lectureStepId) {
        if (index + 1 < lecture.steps.length) {
          lecture.nextStep = lecture.steps[index + 1];
          lecturesInProgress.value.push(lecture);
        }
      }
    });

    // load stats for the user for each lecture
    lecturesInProgress.value.forEach(async (lecture) => {
      const reports = await reportingService.list({
        lectureId: lecture.id,
        username,
        userId,
      });
      if (reports.length) {
        lecture.stepsSummary = reportingService.getLastReports(reports);
      }
    });

    // check the concept covered by the lecture, and get similar lectures
    lecture.concepts.forEach(async ({ concept }) => {
      const fullConcept = await conceptService.get(concept.id);
      fullConcept.lectures.forEach(({ lecture }) => {
        if (!lecture) return;
        if (
          lecture.id !== report.lectureId &&
          !similarLectures.value.find(({ id }) => id === lecture.id)
        ) {
          similarLectures.value.push(lecture);
        }
        lecture.concepts.forEach(({ concept }) => {
          if (!connectedConcepts.value.find(({ id }) => id === concept.id)) {
            connectedConcepts.value.push(concept);
          }
        });
      });
    });
  }
});
</script>
