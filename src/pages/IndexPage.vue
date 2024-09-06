<template>
  <q-page v-if="!loading" class="q-px-none q-py-sm q-gutter-sm">
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
    <q-card v-else class="q-pa-none q-pt-sm">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab v-if="questions" name="review" :label="$t('generic.review')" />
        <q-tab
          v-if="lecturesInProgress.length"
          name="progress"
          :label="$t('generic.lectures_in_progress')"
        />
        <q-tab
          v-if="lecturesNext.length"
          name="next"
          :label="$t('generic.lectures_next')"
        />
        <q-tab
          v-if="connectedConcepts.length"
          name="concepts"
          :label="$t('generic.related_concepts')"
        />
        <q-tab
          v-if="similarLectures.length"
          name="lectures"
          :label="$t('generic.related_lectures')"
        />
      </q-tabs>

      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel v-if="questions" name="review" class="q-pa-none">
          <quiz-runner
            flat
            :title="reviewTitle"
            :questions="questions"
            :answered-questions="answeredQuestions"
            :max="3"
            adaptative
            @finished="finishQuiz"
            @results="processResult"
            @progress="processPartial"
          />
        </q-tab-panel>
        <q-tab-panel
          v-if="lecturesInProgress.length"
          name="progress"
          class="q-pa-md q-gutter-sm"
        >
          <lectures-editing v-model="lecturesInProgress" />
        </q-tab-panel>
        <q-tab-panel
          v-if="lecturesNext.length"
          name="next"
          class="q-pa-md q-gutter-sm"
        >
          <lectures-editing v-model="lecturesNext" />
        </q-tab-panel>
        <q-tab-panel v-if="connectedConcepts.length" name="concepts">
          <concept-list flat bordered :concepts="connectedConcepts" />
        </q-tab-panel>
        <q-tab-panel
          v-if="similarLectures.length"
          name="lectures"
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
const { locale, debounce } = useIris();

const {
  stepReporting: reportingService,
  quizReporting: quizReportingService,
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
const addStep = async (lecture, report) => {
  if (!lecture) return;
  const lectureStepId = report.lectureStepId;
  let step = lecture.steps.find(({ id }) => id === lectureStepId);
  if (!step) return;
  step.lecture = lecture;

  // check if there are any quizzes in the step, otherwise skip it
  if (
    !step.parts.some(
      ({ type, questions }) =>
        type === "quiz" &&
        questions.filter((q) => q.type !== "feedback").length,
    )
  ) {
    return;
  }

  // get the quiz report for this step, in case the user has allready starting to revise them
  const latestQuizReports = (await quizReportingService.list({ userId, username, lectureStepId }))
    .sort((a, b) => a.createdAt - b.createdAt);

  const latestFinishedQuiz = latestQuizReports.find(({ inProgress }) => !inProgress);
  if (latestFinishedQuiz) {
    step.points = reportingService.computePointsPerStep(latestQuizReports).averagePoints;
  } else {
    step.points = reportingService.computePointsPerStep(report).averagePoints;
  }

  const inProgressQuiz = latestQuizReports.find(({ inProgress, type }) => inProgress && type === "review");
  if (inProgressQuiz) {
    step.inProgressQuiz = inProgressQuiz;
  }

  lastSteps.value.push(step);
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
      await addStep(lecture, report);
      continue;
    }
    const lecture = await lectureService.get(report.lectureId);
    if (!lecture) continue;
    processedLectureIds[lecture.id] = lecture;

    await addStep(lecture, report);
    // check if there in a next step in the lecture based report.lectureStepId
    const stepIndex = lecture.steps.findIndex(
      ({ id }) => id === report.lectureStepId,
    );
    if (stepIndex + 1 < lecture.steps.length) {
      lecture.nextStep = lecture.steps[stepIndex + 1];
      lecturesInProgress.value.push(lecture);
    }

    // check if there is any next lecture in the course
    const course = await courseService.get(lecture.course.id);
    const lectureIndex = course.lectures.findIndex(
      ({ id }) => id === lecture.id,
    );
    if (lectureIndex + 1 < course.lectures.length) {
      const nextLecture = course.lectures[lectureIndex + 1];
      lecturesNext.value.push(nextLecture);
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

const reviewTitle = computed(() => {
  if (!reviewStep.value) return;
  return reviewStep.value.title;
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

const answeredQuestions = computed(() => {
  if (!reviewStep.value) return;
  return reviewStep.value.inProgressQuiz?.responses;
});

watch(
  questions,
  (questions) => {
    if (!questions && tab.value === "review") {
      tab.value = "progress";
    }
    if (questions) {
      tab.value = "review";
    }
  },
  { immediate: true },
);

const saveReport = async (questions, inProgress) => {
  const step = reviewStep.value;
  let responses = [];

  questions.forEach((question) => {
    // find the index of the part holding the question in the step
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
    responses.push(response);
  });

  if (step.inProgressQuiz) {
    step.inProgressQuiz.responses = responses;
    step.inProgressQuiz.inProgress = inProgress;
    await quizReportingService.update(step.inProgressQuiz);
  } else {
    step.inProgressQuiz = await quizReportingService.create({
      lectureStepId: step.id,
      responses: responses,
      type: "review",
      inProgress
    });
  }
};

const debouncedSaveReport = debounce(saveReport, 500); // 500 milliseconds delay
const processResult = async (questions) => {
  await debouncedSaveReport(questions, false);
};
const processPartial = async (questions) => {
  debouncedSaveReport(questions, true);
}
const finishQuiz = async () => {
  const step = reviewStep.value;
  // make sure this one is no longer shown to the user
  step.points = 100;
};
</script>
