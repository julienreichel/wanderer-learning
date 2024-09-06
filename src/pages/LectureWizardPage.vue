<template>
  <q-page padding>
    <q-stepper v-model="step" animated>
      <q-step :title="$t('wizard.lecture.title')" :name="1">
        <setup-wizard-step
          v-model="step"
          :prerequisites="prerequisites"
          @options="
            (values) => {
              options = { ...options, ...values };
            }
          "
          @course-description="(value) => (courseDescription = value)"
        />
        <q-stepper-navigation class="row">
          <q-space />
          <q-btn
            :disable="courseDescription.length > 10000"
            :loading="loading"
            color="primary"
            size="md"
            padding="sm 64px"
            icon="chevron_right"
            @click="generateTitleAndObjectives()"
          />
        </q-stepper-navigation>
      </q-step>
      <!-- Step 2: Title, Key Concepts, and Learning Objectives -->
      <q-step :title="$t('wizard.titleKeyConceptsObjectives.title')" :name="2">
        <objectives-wizard-step
          v-model:title="title"
          v-model:key-concepts="keyConcepts"
          v-model:learning-objectives="learningObjectives"
          @generate-title-and-objectives="
            generateTitleAndObjectives(keyConcepts, learningObjectives)
          "
        />
        <q-stepper-navigation class="row">
          <q-btn size="md" icon="chevron_left" @click="step--" />
          <q-space />
          <q-btn
            :loading="loading"
            color="primary"
            size="md"
            padding="sm 64px"
            icon="chevron_right"
            @click="generateTableOfContent()"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 3: Table of Content -->
      <q-step :title="$t('wizard.tableOfContent.title')" :name="3">
        <table-of-content-wizard-step
          v-model="tableOfContent"
          @generate-table-of-content="generateTableOfContent(tableOfContent)"
        />
        <q-stepper-navigation class="row">
          <q-btn size="md" icon="chevron_left" @click="step--" />
          <q-space />
          <q-btn
            :loading="loading"
            color="primary"
            size="md"
            padding="sm 64px"
            icon="chevron_right"
            @click="step = 4"
          />
        </q-stepper-navigation>
      </q-step>
      <!-- Step 4: Generating lecture -->
      <q-step :title="$t('wizard.generating.title')" :name="4">
        <generate-lecture-wizard-step
          :course-id="props.id"
          :lecture-title="title"
          :lecture-content="courseDescription"
          :key-concepts="keyConcepts"
          :learning-objectives="learningObjectives"
          :table-of-content="tableOfContent"
          :locale="locale"
          :step="step"
          :extended-query-for-concept="options.extendedQueryForConcept"
          :model="options.model"
          @lecture-created="lectureId = $event.id"
        />
        <q-stepper-navigation class="row">
          <q-space />
          <q-btn
            :disable="!lectureId"
            color="primary"
            size="md"
            padding="sm 64px"
            icon="chevron_right"
            @click="openLecture"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<script setup>
import SetupWizardStep from "src/components/wizard/SetupWizardStep.vue";
import ObjectivesWizardStep from "src/components/wizard/ObjectivesWizardStep.vue";
import TableOfContentWizardStep from "src/components/wizard/TableOfContentWizardStep.vue";
import GenerateLectureWizardStep from "src/components/wizard/GenerateLectureWizardStep.vue";

import { ref, inject, onMounted } from "vue";

import { useIris } from "src/composables/iris";
const { locale, router } = useIris();
const { ai: aiService, course: courseService } = inject("services");

const props = defineProps({
  id: { type: String, required: true },
});

let prerequisites = [];
onMounted(async () => {
  const course = await courseService.get(props.id);
  // if they are other lecture in the course, add them as prerequisites
  prerequisites = course.lectures.map((lecture) => {
    let text = lecture.title;
    if (lecture.concepts.length) {
      text += "\n- ";
      text += lecture.concepts.map(({ concept }) => concept.title).join("\n- ");
    }
    return text;
  });
});

const options = ref({});
const step = ref(1);
const courseDescription = ref("");

const title = ref("");
const keyConcepts = ref([]);
const learningObjectives = ref([]);
const tableOfContent = ref([]);
const loading = ref(false);

const generateTitleAndObjectives = async (concepts = [], objectives = []) => {
  loading.value = true;

  options.value.prerequisites = prerequisites;
  options.value.locale = locale.value;
  aiService.setOptions(options.value);

  const response = await aiService.getConcepts(
    courseDescription.value,
    concepts,
  );

  title.value = response.title || "";
  response.expectedLearningOutcomes = response.expectedLearningOutcomes || [];
  response.keyConcepts =
    response.keyConcepts?.filter((item) => Boolean(item.name)) || [];

  keyConcepts.value = [...concepts, ...response.keyConcepts];
  learningObjectives.value = [
    ...objectives,
    ...response.expectedLearningOutcomes,
  ];

  loading.value = false;
  step.value = 2;
};

const generateTableOfContent = async (toc = []) => {
  loading.value = true;

  const response = await aiService.getTableOfContent(
    courseDescription.value,
    keyConcepts.value,
    learningObjectives.value,
    toc,
  );
  const sections =
    response.sections?.filter((item) => Boolean(item.name)) || [];

  tableOfContent.value = [...toc, ...sections];

  loading.value = false;
  step.value = 3;
};

let lectureId = ref();

const openLecture = () => {
  router.push({ name: "LectureView", params: { id: lectureId.value } });
};
</script>
