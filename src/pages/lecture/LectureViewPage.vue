<template>
  <q-page v-if="lecture?.id" class="q-pa-none q-pt-sm q-gutter-sm">
    <q-card>
      <q-card-section horizontal class="justify-between">
        <q-card-section>
          <q-card-section class="q-gutter-sm">
            <div class="text-h5">{{ lecture.title }}</div>
            <q-badge v-if="userLevel">
              {{ $t("lecture.levels." + userLevel) }}
            </q-badge>
            <q-badge v-if="userLevel">
              {{ Math.round(successRate * 100) + "%" }}
            </q-badge>
          </q-card-section>
          <concept-display :concepts="lecture.concepts" />
          <q-card-section v-if="lecture.description">
            <rich-text-renderer
              class="q-pt-sm"
              :html-content="lecture.description"
            />
          </q-card-section>
        </q-card-section>
        <q-card-section v-if="lecture.score?.length" style="width: 170px">
          <step-score :serie="lecture.score" :width="150" />
        </q-card-section>
      </q-card-section>
      <quiz-runner
        v-if="connectionQuiz"
        flat
        :questions="questions"
        :answered-questions="activeConnection?.responses"
        :max="20"
        adaptative
        @finished="connectionQuiz = false"
        @results="processResult"
        @progress="processPartial"
      />
      <q-card-actions
        v-if="!connectionQuiz && !practiceQuiz"
        class="q-px-none q-py-lg"
      >
        <q-btn square size="md" icon="chevron_left" @click="finished()" />
        <q-space />
        <q-btn
          square
          size="md"
          padding="sm 50px"
          icon="quiz"
          icon-right="chevron_right"
          @click="connectionQuiz = true"
        />
      </q-card-actions>
    </q-card>
    <template v-if="!connectionQuiz && !practiceQuiz">
      <step-display
        v-for="(step, index) in lecture.steps"
        :key="index"
        :step="step"
      />
    </template>
    <q-card v-if="!connectionQuiz && showFinalQuiz" class="q-pt-sm">
      <q-card-section>
        <q-card-section horizontal class="justify-between">
          <q-card-section class="q-gutter-sm">
            <div class="text-h5">{{ $t("lecture.practice_title") }}</div>
            <q-badge v-if="practiceLevel">
              {{ $t("lecture.levels." + practiceLevel) }}
            </q-badge>
            <q-badge v-if="practiceLevel">
              {{ Math.round(practiceRatio * 100) + "%" }}
            </q-badge>
          </q-card-section>
          <q-card-section
            v-if="lecture.practiceScore?.length"
            style="width: 170px"
          >
            <step-score :serie="lecture.practiceScore" :width="150" />
          </q-card-section>
        </q-card-section>
      </q-card-section>
      <quiz-runner
        v-if="practiceQuiz"
        flat
        :questions="questions"
        :max="20"
        exam-mode
        @finished="practiceQuiz = false"
        @results="processResult"
      />
      <q-card-actions v-if="!practiceQuiz" class="q-px-none q-py-lg">
        <q-space />
        <q-btn
          size="md"
          padding="sm 50px"
          icon="quiz"
          icon-right="chevron_right"
          @click="practiceQuiz = true"
        />
      </q-card-actions>
    </q-card>
    <q-card v-if="practiceLevel && feedbackQuiz" class="q-pt-sm">
      <q-card-section class="q-gutter-sm">
        <div class="text-h5">{{ $t("lecture.feedback_title") }}</div>
      </q-card-section>
      <quiz-runner
        flat
        :questions="feedbacks"
        @finished="feedbackQuiz = false"
        @results="processResult"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, inject, computed } from "vue";
import ConceptDisplay from "src/components/concept/ConceptDisplay.vue";
import StepDisplay from "src/components/step/StepDisplay.vue";
import QuizRunner from "src/components/part/display/QuizRunner.vue";
import StepScore from "src/components/charts/StepScore.vue";
import RichTextRenderer from "src/components/common/RichTextRenderer.vue";

import { useIris } from "src/composables/iris";
const { t, router, canEdit, uid } = useIris();
const {
  lecture: lectureService,
  stepReporting: reportingService,
  course: courseService,
  quizReporting: quizReportingService,
} = inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
const userAttributes = inject("userAttributes");
const { username, userId } = userAttributes.value;

const props = defineProps({
  id: { type: String, required: true },
});

const lecture = ref({});
const reporting = ref();
let practiceLevel = ref();
let practiceRatio = ref();
let activeConnection = ref();
onMounted(async () => {
  const data = await lectureService.get(props.id);
  lecture.value = data;

  updateBreadcrumbs([
    {
      label: data.course.title,
      to: { name: "CourseView", params: { id: data.course.id } },
    },
    {
      label: data.title,
      id: data.id,
      edit: canEdit(data) ? "LectureEdit" : null,
    },
  ]);

  // Get the last report
  const allReports = (
    await quizReportingService.list({
      lectureId: lecture.value.id,
      userId,
      username,
    })
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const allReportWithScore = allReports
    .filter(({ type, inProgress }) => type !== "feedback" && !inProgress)
    .slice(0, 3);
  reporting.value = allReportWithScore[0];

  // is there a connection quiz in progress?
  const inProgressConnectionReport = allReports.find(({ inProgress, type }) => inProgress && type === 'connection');
  if (inProgressConnectionReport) {
    connectionQuiz.value = true;
    activeConnection.value = inProgressConnectionReport;
    console.log('activeConnection', activeConnection.value);
  }
  // did the user passed the final quiz?
  const practiceReports = allReports.filter(({ type }) => type === "practice");
  if (practiceReports.length) {
    const { level, ratio } = quizReportingService.getLevel(
      practiceReports[0],
    );
    practiceLevel.value = level;
    practiceRatio.value = ratio;
    lecture.value.practiceScore = practiceReports.reverse().map((report) => ({
      key: report.createdAt,
      value: {
        difficulties: quizReportingService.getLevel(report).difficulties,
      },
    }));
  }

  lecture.value.score = allReportWithScore.reverse().map((report) => ({
    key: t("lecture.reports." + report.type),
    value: {
      difficulties: quizReportingService.getLevel(report).difficulties,
    },
  }));

  // was the last user action to generate a feedback?
  const feedbackReport = allReports[0]?.type === "feedback";
  if (feedbackReport) {
    feedbackQuiz.value = false;
  }

  // load stats for the user for each step
  let lectureStarted = 0;
  await Promise.all(
    lecture.value.steps.map(async (step) => {
      const reports = (
        await reportingService.list({
          lectureStepId: step.id,
          username,
          userId,
        })
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (reports.length) {
        lectureStarted++;
        // get the longest time for all reports
        let maxTime = 0;
        let selectedReport = {};
        reports.forEach((report) => {
          const totalTime = report.reportings.reduce(
            (acc, val) => acc + val.time,
            0,
          );
          if (totalTime > maxTime) {
            maxTime = totalTime;
            selectedReport = report;
          }
        });
        if (maxTime < 60) {
          selectedReport.totalTime = maxTime + " sec";
        } else {
          selectedReport.totalTime = Math.round(maxTime / 60) + " min";
        }
        step.reporting = selectedReport;
        step.score = reports
          .slice(0, 3)
          .reverse()
          .map((report) => ({
            value: reportingService.computePointsPerStep(report),
            key: report.createdAt,
          }))
          .filter((score) => score.value.total);
      }
    }),
  );

  if (!lectureStarted && !allReports.length) {
    // this user has never touched this lecture, let's start with a quiz
    connectionQuiz.value = true;
  }
});

const showFinalQuiz = computed(() => {
  return lecture.value.steps.every((step) => Boolean(step.reporting));
});
const finished = () => {
  router.push({ name: "CourseView", params: { id: lecture.value.course.id } });
};

const userLevel = computed(() => {
  if (reporting.value) {
    const { level } = quizReportingService.getLevel(reporting.value);
    return level;
  }
  return undefined;
});

const successRate = computed(() => {
  if (reporting.value) {
    const { ratio } = quizReportingService.getLevel(reporting.value);
    return ratio;
  }
  return undefined;
});

let connectionQuiz = ref(false);
let practiceQuiz = ref(false);
let feedbackQuiz = ref(true);
let questions = computed(() => {
  // cumulate all the questions from the lecture
  if (!lecture.value.steps) return [];

  return lecture.value.steps
    .map((step) => {
      const partQuestions = step.parts
        .map((part) => {
          if (part.type === "quiz") {
            return part.questions.filter((q) => q.type !== "feedback");
          }
        })
        .filter((q) => Boolean(q))
        .flat();
      return partQuestions;
    })
    .flat();
});

const feedbacks = ref(
  ["roti", "difficulty", "stars"].map((type) => ({
    id: uid(),
    type: "feedback",
    text: t("quiz.feedback.question." + type),
    answers:
      type == "stars"
        ? []
        : [1, 2, 3, 4, 5].map((index) => ({
            text: t("quiz.feedback.tooltips." + type + "." + index),
          })),
    options: {
      feedbackType: type,
    },
  })),
);

const debounceAsync = (func, delay) => {
  let timeoutId;
  return function (...args) {
    const context = this;
    clearTimeout(timeoutId);
    return new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        const result = await func.apply(context, args);
        resolve(result);
      }, delay);
    });
  };
}


let currentReport = null;
const saveReport = async (questions, inProgress) => {
  const responses = questions.map((question) => {
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
    return response;
  });

  if (!currentReport && connectionQuiz.value && activeConnection.value){
    currentReport = activeConnection.value;
  }

  if (currentReport) {
    currentReport.responses = responses;
    currentReport.inProgress = inProgress;
    await quizReportingService.update(currentReport);
  } else {
    const type = connectionQuiz.value
      ? "connection"
      : practiceQuiz.value
        ? "practice"
        : "feedback";
    currentReport = await quizReportingService.create({
      lectureId: lecture.value.id,
      type,
      inProgress,
      responses,
    });
  }
};

const debouncedSaveReport = debounceAsync(saveReport, 500); // 500 milliseconds delay

const processResult = async (questions) => {
  await debouncedSaveReport(questions, false);
  const type = currentReport.type;

  currentReport = null;

  if (practiceQuiz.value) {
    const { level, ratio } = quizReportingService.getLevel(reporting.value);
    practiceLevel.value = level;
    practiceRatio.value = ratio;
  }

  if (type === "feedback") {
    // if there is a stars count, update the course stars
    const starQuestion = questions.find(
      (response) => response.feedbackType === "stars",
    );
    if (starQuestion) {
      const stars = Number(starQuestion.response);
      let course = lecture.value.course;
      if (!course.ratings) {
        course.ratings = [{ value: stars, reportingId: reporting.value.id }];
      } else {
        course.ratings.push({ value: stars, reportingId: reporting.value.id });
      }
      courseService.update(course);
    }
    feedbackQuiz.value = false;
  } else {
    feedbackQuiz.value = true;
  }
};
const processPartial = async (questions) => {
  await debouncedSaveReport(questions, true);
};

</script>

<style lang="sass" scoped>
.truncate-chip-labels > .q-chip
  max-width: 200px
</style>
