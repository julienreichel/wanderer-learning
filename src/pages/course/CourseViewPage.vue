<template>
  <q-page class="">
    <div v-if="course.id" class="q-pa-none q-pt-sm q-gutter-sm">
      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-gutter-sm">
            <div class="text-h5">{{ course.title }}</div>
            <q-badge v-if="userLevel">
              {{ $t("course.levels." + userLevel) }}
            </q-badge>
            <q-badge v-if="userLevel">
              {{ Math.round(successRate * 100) + "%" }}
            </q-badge>
            <div></div>
            <div class="q-pt-sm" v-html="course.description"></div>
          </q-card-section>
          <q-img
            v-if="course.src"
            :src="course.url"
            :ratio="16 / 9"
            class="q-ma-sm col-4"
          >
          </q-img>
        </q-card-section>
        <quiz-runner
          v-if="checkingCourse"
          flat
          :questions="questions"
          @finished="finishQuiz"
          @results="processResult"
          :max="20"
          adaptative
        />
        <q-card-actions class="q-px-none q-py-lg" v-if="!checkingCourse">
          <q-btn square size="md" icon="chevron_left" @click="finished()" />
          <q-space />
          <q-btn
            square
            size="md"
            padding="sm 50px"
            icon="quiz"
            icon-right="chevron_right"
            @click="checkCourse()"
          />
        </q-card-actions>
      </q-card>
      <lectures-editing v-model="course.lectures" v-if="!checkingCourse" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, inject, computed } from "vue";
import LecturesEditing from "src/components/lecture/LecturesEditing.vue";
import QuizRunner from "src/components/part/display/QuizRunner.vue";

import { useIris } from "src/composables/iris";
const { t, $q, router, canEdit } = useIris();
const {
  course: courseService,
  stepReporting: reportingService,
  courseReporting: courseReportingService,
} = inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
const userAttributes = inject("userAttributes");
const { username, userId } = userAttributes.value;

const props = defineProps({
  id: String,
});

const course = ref({});
const reporting = ref();
onMounted(async () => {
  const data = await courseService.get(props.id);
  course.value = data;

  updateBreadcrumbs([
    {
      label: data.title,
      id: data.id,
      edit: canEdit(data) ? "CourseEdit" : null,
    },
  ]);

  // Get the last report
  reporting.value = (
    await courseReportingService.list({
      courseId: course.value.id,
      userId,
      username,
    })
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  const lastTest = reporting.value?.createdAt || 0;

  // load stats for the user for each lecture
  let lectureStarted = 0;
  let newActions = false;
  let lectureResponses = [];
  await Promise.all(
    course.value.lectures.map(async (lecture) => {
      const reports = await reportingService.list({
        lectureId: lecture.id,
        username,
        userId,
      });
      if (reports.length) {
        lecture.stepsSummary = reportingService.getLastReports(reports);
      }
      // If the reports are more recent that the course report, they take priority
      if (lecture.stepsSummary && reporting.value) {
        lectureStarted++;

        const responses = lecture.stepsSummary
          .filter((step) => step.createdAt > lastTest)
          .map(({ reportings }) =>
            reportings
              .map((r) => r.responses)
              .filter(Boolean)
              .flat(),
          )
          .flat();

        if (responses.length) {
          newActions = true;
          lectureResponses.push(responses);
        }
      }
    }),
  );

  if (lectureStarted === course.value.lectures.length) {
    // all lecture have been started, we can use the lectureResponses to evaluate the user level
    reporting.value = {
      responses: lectureResponses.flat(),
    };
  } else if (newActions) {
    reporting.value = {
      responses: [],
      ratio: lectureStarted / course.value.lectures.length,
    };
  }
});

const userLevel = computed(() => {
  if (reporting.value) {
    const { level } = courseReportingService.getLevel(reporting.value);
    return level;
  }
  return undefined;
});

const successRate = computed(() => {
  if (reporting.value) {
    const { ratio } = courseReportingService.getLevel(reporting.value);
    return ratio;
  }
  return undefined;
});

const finished = () => {
  router.push({ name: "CourseList" });
};

let checkingCourse = ref(false);
let questions = ref([]);
const checkCourse = () => {
  checkingCourse.value = true;
  // cumulate all the questions from the course
  questions.value = course.value.lectures
    .map((lecture) => {
      const stepQuestions = lecture.steps
        .map((step) => {
          const partQuestions = step.parts
            .map((part) => {
              if (part.type === "quiz") {
                return part.questions;
              }
            })
            .filter((q) => Boolean(q))
            .flat();
          return partQuestions;
        })
        .flat();
      return stepQuestions;
    })
    .flat();
};
const finishQuiz = () => {
  checkingCourse.value = false;
};
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
  reporting.value = await courseReportingService.create({
    courseId: course.value.id,
    responses,
  });
};
</script>
