<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-card>
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
    <q-card v-if="!newuser">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab
          name="review"
          :label="$t('generic.review')"
          v-if="lastSteps.length"
        />
        <q-tab
          name="progress"
          :label="$t('generic.lectures_in_progress')"
          v-if="lecturesInProgress.length"
        />
        <q-tab
          name="next"
          :label="$t('generic.lectures_next')"
          v-if="lecturesNext.length"
        />
        <q-tab
          name="concepts"
          :label="$t('generic.related_concepts')"
          v-if="connectedConcepts.length"
        />
        <q-tab
          name="lectures"
          :label="$t('generic.related_lectures')"
          v-if="similarLectures.length"
        />
      </q-tabs>

      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="review" v-if="lastSteps.length" class="q-pa-md q-gutter-sm">
          <q-list>
            <q-item v-for="(step, index) in lastSteps" :key="index" clickable @click="startQuiz(step)">
              <q-item-label>
                {{ step.title }}
              </q-item-label>
            </q-item>
          </q-list>
        </q-tab-panel>
        <q-tab-panel name="progress" v-if="lecturesInProgress.length" class="q-pa-md q-gutter-sm">
          <lectures-editing v-model="lecturesInProgress" />
        </q-tab-panel>
        <q-tab-panel name="next" v-if="lecturesNext.length" class="q-pa-md q-gutter-sm">
          <lectures-editing v-model="lecturesNext" />
        </q-tab-panel>
        <q-tab-panel name="concepts" v-if="connectedConcepts.length">
          <concept-list flat bordered :concepts="connectedConcepts"/>
        </q-tab-panel>
        <q-tab-panel name="lectures" v-if="similarLectures.length" class="q-pa-md q-gutter-sm">
          <lectures-editing v-model="similarLectures" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
    <quiz-runner-dialog v-if="questions" v-model="quizDialog" :questions="questions"/>
  </q-page>
</template>

<script setup>
import LecturesEditing from "src/components/lecture/LecturesEditing.vue";
import QuizRunnerDialog from "src/components/part/display/QuizRunnerDialog.vue";
import ConceptList from "src/components/concept/ConceptList.vue";

import { ref, inject, onMounted, computed } from "vue";

import { useIris } from "src/composables/iris";
const { locale } = useIris();

const {
  stepReporting: reportingService,
  lecture: lectureService,
  concept: conceptService,
  course: courseService,
} = inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
updateBreadcrumbs([{}]);
const userAttributes = inject("userAttributes");
const showAllLocaleContent = inject("showAllLocaleContent");

const { username, userId } = userAttributes.value;
let tab = ref("progress");

let lecturesInProgress = ref([]);
let lecturesNext = ref([]);
let similarLectures = ref([]);
let connectedConcepts = ref([]);
let lastSteps = ref([]);
const newuser = computed(
  () =>
    lecturesInProgress.value.length === 0 &&
    similarLectures.value.length === 0 &&
    connectedConcepts.value.length === 0,
);
const addStep = (lecture, lectureStepId) => {
  if (!lecture) return;
  const step = lecture.steps.find(({id}) => id === lectureStepId);
  if (!step) return;
  // check if there are any quizzes in the step
  if (step.parts.some(({type, questions}) => type === "quiz" && questions.filter(q => q.type !== "feedback").length)) {
    lastSteps.value.push(step);
  }
};

onMounted(async () => {
  // Get the last 3 reports
  const data = await reportingService.list({ userId, username, limit: 3 });

  let options = {};
  if (!showAllLocaleContent.value) {
    options.locale = locale.value;
  }

  let processedLectureIds = {};
  for (const report of data) {
    // get the lecture if not already processed
    if (processedLectureIds[report.lectureId]) {
      const lecture = processedLectureIds[report.lectureId];
      addStep(lecture, report.lectureStepId);
      continue;
    }
    const lecture = await lectureService.get(report.lectureId);
    processedLectureIds[lecture.id] = lecture;
    if (!lecture) continue;

    addStep(lecture, report.lectureStepId);
    // check if there in a next step in the lecture based report.lectureStepId
    let lectureIsOver = true;
    const stepIndex = lecture.steps.findIndex(
      ({ id }) => id === report.lectureStepId,
    );
    if (stepIndex + 1 < lecture.steps.length) {
      lecture.nextStep = lecture.steps[stepIndex + 1];
      lecturesInProgress.value.push(lecture);
      lectureIsOver = false;
    }

    // check if there is any next lecture in the course
    if (lectureIsOver) {
      const course = await courseService.get(lecture.course.id);
      const lectureIndex = course.lectures.findIndex(
        ({ id }) => id === lecture.id,
      );
      if (lectureIndex + 1 < course.lectures.length) {
        const nextLecture = course.lectures[lectureIndex + 1];
        lecturesNext.value.push(nextLecture);
      }
    }

    // check the concept covered by the lecture, and get similar lectures
    lecture.concepts.forEach(async ({ concept }) => {
      const fullConcept = await conceptService.get(concept.id, options);
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
  // load stats for the user for each lecture in progress
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
});

let questions = ref([]);
let quizDialog = ref(false);
const startQuiz = (step) => {
  // find all the questions in all the parts
  questions.value = step.parts
    .filter(({ type }) => type === "quiz")
    .map((part) => part.questions.filter((q) => q.type !== "feedback"))
    .flat();
  quizDialog.value = true;
};
</script>
