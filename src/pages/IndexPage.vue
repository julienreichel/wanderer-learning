<template>
  <q-page class="q-px-none q-py-sm q-gutter-sm" v-if="!loading">
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
    <q-card v-else class="q-pa-sm">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="review" :label="$t('generic.review')" v-if="questions" />
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
        <q-tab-panel name="review" v-if="questions" class="q-pa-md q-gutter-sm">
          <quiz-runner
            :questions="questions"
            @finished="finishQuiz"
            @results="processResult"
            :max="5"
            adaptative
          />
        </q-tab-panel>
        <q-tab-panel
          name="progress"
          v-if="lecturesInProgress.length"
          class="q-pa-md q-gutter-sm"
        >
          <lectures-editing v-model="lecturesInProgress" />
        </q-tab-panel>
        <q-tab-panel
          name="next"
          v-if="lecturesNext.length"
          class="q-pa-md q-gutter-sm"
        >
          <lectures-editing v-model="lecturesNext" />
        </q-tab-panel>
        <q-tab-panel name="concepts" v-if="connectedConcepts.length">
          <concept-list flat bordered :concepts="connectedConcepts" />
        </q-tab-panel>
        <q-tab-panel
          name="lectures"
          v-if="similarLectures.length"
          class="q-pa-md q-gutter-sm"
        >
          <lectures-editing v-model="similarLectures" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import LecturesEditing from "src/components/lecture/LecturesEditing.vue";
import QuizRunner from "src/components/part/display/QuizRunner.vue";
import ConceptList from "src/components/concept/ConceptList.vue";

import { ref, inject, onMounted, computed, watch } from "vue";

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
let tab = ref("review");

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
const addStep = (lecture, report) => {
  if (!lecture) return;
  const lectureStepId = report.lectureStepId;
  let step = lecture.steps.find(({ id }) => id === lectureStepId);
  if (!step) return;
  step.lecture = lecture;
  step.points = reportingService.computePointsPerStep(step, [
    report,
  ]).averagePoints;
  // check if there are any quizzes in the step
  if (
    step.parts.some(
      ({ type, questions }) =>
        type === "quiz" &&
        questions.filter((q) => q.type !== "feedback").length,
    )
  ) {
    lastSteps.value.push(step);
  }
};

let loading = ref(true);
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
      addStep(lecture, report);
      continue;
    }
    const lecture = await lectureService.get(report.lectureId);
    processedLectureIds[lecture.id] = lecture;
    if (!lecture) continue;

    addStep(lecture, report);
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

  loading.value = false;
});

const reviewStep = computed(() => {
  if (!lastSteps.value.length) return;

  const step = [...lastSteps.value].sort((a, b) => a.points - b.points)[0];

  if (step.points === 100) return;
  return step;
});

const questions = computed(() => {
  if (!reviewStep.value) return;
  const partWithQuiz = reviewStep.value.parts.filter(
    ({ type }) => type === "quiz",
  );
  partWithQuiz.forEach((part) => {
    part.questions.forEach((q) => {
      q.partId = part.id;
    });
  });

  const questions = partWithQuiz
    .map((part) => part.questions.filter((q) => q.type !== "feedback"))
    .flat();
  return questions;
});
watch(questions, (questions) => {
  if (!questions && tab.value === "review") {
    tab.value = "progress";
  }
});

const processResult = async (questions) => {
  const step = reviewStep.value;
  // store a new report
  let reportings = step.parts.map(() => ({ time: 0, responses: [] }));
  questions.forEach((question) => {
    // find the index of the part holding the question in the step
    const partIndex = step.parts.findIndex(({ id }) => id === question.partId);
    reportings[partIndex].time += question.time;
    const response = {
      questionId: question.id,
      valid: question.valid,
      points: question.points,
      type: question.type,
      level: question.level,
      response: Array.isArray(question.response)
        ? question.response.join(",")
        : question.response,
    };
    reportings[partIndex].responses.push(response);
  });
  await reportingService.create({
    lectureStepId: step.id,
    lectureId: step.lecture.id,
    reportings: reportings,
  });
};
const finishQuiz = async (questions) => {
  const step = reviewStep.value;
  // make sure this one is no longer shown to the user
  step.points = 100;
};
</script>
