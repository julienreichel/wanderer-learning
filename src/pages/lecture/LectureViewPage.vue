<template>
  <q-page v-if="lecture?.id" class="q-pa-none q-pt-sm q-gutter-sm">
    <q-card>
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
      <q-card-section>
        <div class="q-pt-sm" v-html="lecture.description"></div>
      </q-card-section>
      <quiz-runner
        v-if="connectionQuiz"
        flat
        :questions="questions"
        @finished="connectionQuiz = false"
        @results="processResult"
        :max="20"
        adaptative
      />
      <q-card-actions class="q-px-none q-py-lg" v-if="!connectionQuiz && !practiceQuiz">
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
    <q-card v-if="showFinalQuiz" class="q-pt-sm">
      <q-card-section class="q-gutter-sm">
          <div class="text-h5">{{ $t("lecture.practice_title") }}</div>
          <q-badge v-if="practiceLevel">
            {{ $t("lecture.levels." + practiceLevel) }}
          </q-badge>
          <q-badge v-if="practiceLevel">
            {{ Math.round(practiceRatio * 100) + "%" }}
          </q-badge>
      </q-card-section>
      <quiz-runner
        v-if="practiceQuiz"
        flat
        :questions="questions"
        @finished="practiceQuiz = false"
        @results="processResult"
        :max="3"
        exam-mode
      />
      <q-card-actions class="q-px-none q-py-lg" v-if="!practiceQuiz">
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
  </q-page>
</template>

<script setup>
import { ref, onMounted, inject, computed } from "vue";
import ConceptDisplay from "src/components/concept/ConceptDisplay.vue";
import StepDisplay from "src/components/step/StepDisplay.vue";
import QuizRunner from "src/components/part/display/QuizRunner.vue";

import { useIris } from "src/composables/iris";
const { t, $q, router, canEdit } = useIris();
const { lecture: lectureService, stepReporting: reportingService, lectureReporting: lectureReportingService } =
  inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
const userAttributes = inject("userAttributes");
const { username, userId } = userAttributes.value;

const props = defineProps({
  id: String,
});

const lecture = ref({});
const reporting = ref();
let practiceLevel = ref();
let practiceRatio = ref();
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
  const allReports =(await lectureReportingService.list({
      lectureId: lecture.value.id,
      userId,
      username,
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  reporting.value = allReports[0];
  // did the user passed the final quiz?
  const practiceReport = allReports.find(({type}) => type === "practice");
  if (practiceReport){
    const {level, ratio} = lectureReportingService.getLevel(practiceReport);
    practiceLevel.value = level;
    practiceRatio.value = ratio;
  }

  // load stats for the user for each step
  lecture.value.steps.forEach(async (step) => {
    const reports = await reportingService.list({
      lectureStepId: step.id,
      username,
      userId,
    });
    if (reports.length) {
      // keep only the most recent
      let report = reports.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )[0];
      const totalTime = report.reportings.reduce(
        (acc, val) => acc + val.time,
        0,
      );
      if (totalTime < 60) {
        report.totalTime = totalTime + " sec";
      } else {
        report.totalTime = Math.round(totalTime / 60) + " min";
      }
      step.reporting = report;
    }
  });
});

const showFinalQuiz = computed(() => {
  return lecture.value.steps.every((step) => Boolean(step.reporting));
});
const finished = () => {
  router.push({ name: "CourseView", params: { id: lecture.value.course.id } });
};

const userLevel = computed(() => {
  if (reporting.value) {
    const { level } = lectureReportingService.getLevel(reporting.value);
    return level;
  }
  return undefined;
});

const successRate = computed(() => {
  if (reporting.value) {
    const { ratio } = lectureReportingService.getLevel(reporting.value);
    return ratio;
  }
  return undefined;
});

let connectionQuiz = ref(false);
let practiceQuiz = ref(false);
let questions = computed(() => {
  // cumulate all the questions from the lecture
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

const processResult = async (questions) => {
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
  reporting.value = await lectureReportingService.create({
    lectureId: lecture.value.id,
    type: connectionQuiz.value ? "connection" : "practice",
    responses,
  });

  if (practiceQuiz.value){
    const {level, ratio} = lectureReportingService.getLevel(reporting.value);
    practiceLevel.value = level;
    practiceRatio.value = ratio;
  }
};
</script>

<style lang="sass" scoped>
.truncate-chip-labels > .q-chip
  max-width: 200px
</style>
