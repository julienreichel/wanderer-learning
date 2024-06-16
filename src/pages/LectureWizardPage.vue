<template>
  <q-page padding>
    <q-stepper v-model="step" vertical animated>
      <!-- Step 1: Course Description -->
      <q-step :title="$t('wizard.lecture.title')" :name="1">
        <div class="text-h6">{{ $t("wizard.lecture.description") }}</div>
        <q-input
          outlined
          v-model="courseDescription"
          :placeholder="$t('wizard.lecture.label')"
          type="textarea"
          rows="5"
        />
        <q-toggle
          v-model="advanced"
          :label="$t('wizard.lecture.advanced')"
        />
        <div v-if="advanced" class="q-pa-md q-col-gutter-sm">
          <q-input
            outlined
            v-model="style"
            :label="$t('wizard.lecture.style')"
          />
          <q-input
            outlined
            v-model="tone"
            :label="$t('wizard.lecture.tone')"
          />
          <q-input
            outlined
            v-model="audience"
            :label="$t('wizard.lecture.audience')"
          />
          <q-select
            outlined
            v-model="model"
            :options="['gpt-3.5-turbo', 'gpt-4o']"
            :label="$t('wizard.lecture.model')"
          />
          <q-toggle
            v-model="extendedQueryForConcept"
            :label="$t('wizard.lecture.queryType')"
          />
        </div>
        <q-stepper-navigation>
          <q-space />
          <q-btn
            :loading="loading"
            color="primary"
            :label="$t('wizard.common.next')"
            @click="generateTitleAndObjectives"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 2: Title, Key Concepts, and Learning Objectives -->
      <q-step :title="$t('wizard.titleKeyConceptsObjectives.title')" :name="2">
        <div class="q-pa-none q-col-gutter-sm">
          <q-input
            outlined
            v-model="title"
            :label="$t('wizard.titleKeyConceptsObjectives.lectureTitle')"
          />
          <div class="text-h6">
            {{ $t("wizard.titleKeyConceptsObjectives.concepts") }}
          </div>
          <q-list :label="$t('wizard.titleKeyConceptsObjectives.keyConcepts')">
            <q-item v-for="(concept, index) in keyConcepts" :key="index">
              <q-item-section class="q-pa-none q-col-gutter-sm">
                <q-input
                  v-model="concept.name"
                  :placeholder="
                    $t('wizard.titleKeyConceptsObjectives.conceptName')
                  "
                  outlined
                  dense
                />
                <q-input
                  v-model="concept.description"
                  :placeholder="
                    $t('wizard.titleKeyConceptsObjectives.conceptDescription')
                  "
                  type="textarea"
                  rows="2"
                  outlined
                  dense
                />
              </q-item-section>
              <q-item-section side>
                <q-btn flat icon="close" @click="removeKeyConcept(index)" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn
                  v-if="keyConcepts.length < 7"
                  flat
                  :label="$t('wizard.titleKeyConceptsObjectives.addConcept')"
                  @click="addKeyConcept"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <div class="text-h6">
            {{ $t("wizard.titleKeyConceptsObjectives.objectives") }}
          </div>
          <q-list
            :label="$t('wizard.titleKeyConceptsObjectives.learningObjectives')"
          >
            <q-item
              v-for="(objective, index) in learningObjectives"
              :key="index"
            >
              <q-item-section>
                <q-input
                  v-model="learningObjectives[index]"
                  :placeholder="
                    $t('wizard.titleKeyConceptsObjectives.learningObjective')
                  "
                  outlined
                  dense
                />
              </q-item-section>
              <q-item-section side top>
                <q-btn
                  flat
                  icon="close"
                  @click="removeLearningObjective(index)"
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn
                  v-if="learningObjectives.length < 7"
                  flat
                  :label="$t('wizard.titleKeyConceptsObjectives.addObjective')"
                  @click="addLearningObjective"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <q-stepper-navigation>
          <q-space />
          <q-btn flat :label="$t('wizard.common.back')" @click="step--" />
          <q-btn
            :loading="loading"
            color="primary"
            :label="$t('wizard.common.next')"
            @click="generateTableOfContent()"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 3: Table of Content -->
      <q-step :title="$t('wizard.tableOfContent.title')" :name="3">
        <div class="q-pa-none q-col-gutter-sm">
          <q-list>
            <q-item
              v-for="(step, stepIndex) in tableOfContent"
              :key="stepIndex"
            >
              <q-item-section>
                <q-input
                  v-model="step.name"
                  :placeholder="$t('wizard.tableOfContent.stepName')"
                  outlined
                  dense
                />
                <q-list :label="$t('wizard.tableOfContent.stepParts')">
                  <q-item
                    v-for="(item, itemIndex) in step.items"
                    :key="itemIndex"
                  >
                    <q-item-section class="q-pa-none q-col-gutter-sm">
                      <q-input
                        v-model="item.name"
                        :placeholder="$t('wizard.tableOfContent.partName')"
                        outlined
                        dense
                      />
                      <q-input
                        v-model="item.description"
                        :placeholder="
                          $t('wizard.tableOfContent.partDescription')
                        "
                        type="textarea"
                        rows="2"
                        outlined
                        dense
                      />
                    </q-item-section>
                    <q-item-section side top>
                      <q-btn
                        flat
                        icon="close"
                        @click="removePart(stepIndex, itemIndex)"
                      />
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-btn
                        flat
                        :label="$t('wizard.tableOfContent.addPart')"
                        @click="addPart(stepIndex)"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-item-section>
              <q-item-section side top>
                <q-btn flat icon="close" @click="removeStep(stepIndex)" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn
                  flat
                  :label="$t('wizard.tableOfContent.addStep')"
                  @click="addStep"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <q-stepper-navigation>
          <q-space />
          <q-btn flat :label="$t('wizard.common.back')" @click="step--" />
          <q-btn
            :loading="loading"
            color="primary"
            :label="$t('wizard.common.finish')"
            @click="generateLecture"
          />
        </q-stepper-navigation>
      </q-step>
      <!-- Step 3: Generating lecture -->
      <q-step :title="$t('wizard.generating.title')" :name="4">
        <q-spinner-gears color="primary" size="xl" v-if="progress < 1" />
        <q-linear-progress
          :value="progress"
          class="q-mt-md"
          size="25px"
          animation-speed="10000"
        >
          <div class="absolute-full flex flex-center">
            <q-badge
              color="white"
              text-color="primary"
              :label="progressLabel"
            />
          </div>
        </q-linear-progress>
        <q-stepper-navigation>
          <q-btn
            :disable="progress < 1"
            color="primary"
            :label="$t('wizard.common.openLecture')"
            @click="openLecture"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<script setup>
import { ref, inject } from "vue";

import { useIris } from "src/composables/iris";
const { t, $q, router } = useIris();
const {
  ai: aiService,
  lecture: lectureService,
  concept: conceptService,
  lectureConcept: lectureConceptService,
  lectureStep: lectureStepService,
} = inject("services");

const props = defineProps({
  id: String,
});

const step = ref(1);
const courseDescription = ref("Introduction to Agile");
const advanced = ref(false);
const style = ref("Richard Feynman Style: Simplicity, clarity, passion and enthusiasm, using storytelling with focus on fundamentals, keeping humor and wit.");
const audience = ref("General readership.");
const tone = ref("Accessible, Engaging, Entertaining, Challenging");
const model = ref("gpt-3.5-turbo");
const extendedQueryForConcept = ref(false);

const title = ref("");
const keyConcepts = ref([]);
const learningObjectives = ref([]);
const tableOfContent = ref([]);
const loading = ref(false);
const progress = ref(0);
const progressLabel = ref("");

const addKeyConcept = () => {
  keyConcepts.value.push({ name: "", description: "" });
};

const removeKeyConcept = (index) => {
  keyConcepts.value.splice(index, 1);
};

const addLearningObjective = () => {
  learningObjectives.value.push("");
};

const removeLearningObjective = (index) => {
  learningObjectives.value.splice(index, 1);
};

const addStep = () => {
  tableOfContent.value.push({ name: "", items: [] });
};

const removeStep = (index) => {
  tableOfContent.value.splice(index, 1);
};

const addPart = (stepIndex) => {
  tableOfContent.value[stepIndex].items.push({ name: "", description: "" });
};

const removePart = (stepIndex, itemIndex) => {
  tableOfContent.value[stepIndex].items.splice(itemIndex, 1);
};

const generateTitleAndObjectives = async () => {
  loading.value = true;
  aiService.setOptions({
    style: style.value,
    tone: tone.value,
    audience: audience.value,
    model: model.value,
  });

  const response = await aiService.getConcepts(courseDescription.value);

  title.value = response.title || "";
  keyConcepts.value = response.keyConcepts || [];
  learningObjectives.value = response.expectedLearningOutcomes || [];

  loading.value = false;
  step.value++;
};

const generateTableOfContent = async () => {
  loading.value = true;

  const response = await aiService.getTableOfContent(
    courseDescription.value,
    keyConcepts.value,
    learningObjectives.value,
  );

  tableOfContent.value = response.sections || [];

  loading.value = false;
  step.value++;
};

let lectureId;
const createQuizParts = (quiz, nbQuestionPerQuiz) => {
  let parts = [];
  quiz.forEach((quiz, idx) => (quiz.id = `question-${idx}`));
  for (let i = 0; i < quiz.length; i += nbQuestionPerQuiz) {
    let questions = quiz.slice(i, i + nbQuestionPerQuiz);

    // need to clean potential issue created by the AI
    questions.forEach((question) => {
      // remove the "Fill in the blank:", "Myth or Fact: ", "True or False: "
      question.text = question.text.replace(
        /\s*(Fill in the blank:|Myth or Fact:|Fact or Myth:|Is it a myth or a fact:|True or False:|Is this statement true or false?|Complete the sentence:|\(True\/False\))\s*/,
        "",
      );
      question.answers.forEach((answer) => {
        // remove starting A. or B. or C. or D. from the answer
        answer.text = answer.text.replace(/^[A-Z0-9a-z]\.\s*/, "");
      });

      // if there is only one answer, we add the missing one
      if (question.answers.length === 1) {
        if (question.answers[0].text === "True") {
          question.answers.push({ text: "False" });
        }
        if (question.answers[0].text === "False") {
          question.answers.push({ text: "True" });
        }
        if (question.answers[0].text === "Myth") {
          question.answers.push({ text: "Fact" });
        }
        if (question.answers[0].text === "Fact") {
          question.answers.push({ text: "Myth" });
        }
      }

      // Open Ai has the tendancy to invent new types of questions
      const mappingTypes = {
        "fill-in-the-blank": "shorttext",
        "missing-word": "shorttext",
        "missing_word": "shorttext",
      };
      if(["radio", "checkbox", "shorttext"].includes(question.type) === false) {
        if (mappingTypes[question.type]) {
          question.type = mappingTypes[question.type];
        } else if (question.answers.length === 1) {
          question.type = "shorttext";
        } else if (question.answers.filter((a) => a.correct).length > 1) {
          question.type = "checkbox";
        } else {
          question.type = "radio";
        }
      }


      //sometimes it changes explanations to explanation
      if (question.explanation) {
        question.explanations = question.explanation;
        delete question.explanation;
      }
    });
    parts.push({
      type: "quiz",
      questions,
    });
  }
  return parts;
};
const generateLecture = async () => {
  step.value++;

  // create the lecture
  progress.value = 0;
  progressLabel.value = t("wizard.generating.create");

  const lecture = await lectureService.create({
    title: title.value,
    courseId: props.id,
    order: "" + Date.now(),
  });
  lectureId = lecture.id;

  // add the key concepts
  progress.value = 5 / 100;
  const conceptList = await conceptService.list();
  for (const keyConcept of keyConcepts.value) {
    let concept = conceptList.find(({ title }) => title === keyConcept.name);
    if (!concept) {
      concept = await conceptService.create({
        title: keyConcept.name,
        description: keyConcept.description,
      });
    }
    const item = await lectureConceptService.create({
      lectureId,
      conceptId: concept.id,
    });
  }

  // creating the connection step
  progress.value = 10 / 100;
  progressLabel.value = t("wizard.generating.connect");

  let nbQuiz = 3;
  let nbQuestionPerQuiz = 2;
  let parts = [];
  const connectQuiz = await aiService.getInitialQuiz(
    courseDescription.value,
    keyConcepts.value,
    nbQuiz * nbQuestionPerQuiz,
  );
  parts = createQuizParts(connectQuiz.questions, nbQuestionPerQuiz);

  progress.value = 15 / 100;
  const connectIntro = await aiService.getInitialContent(
    courseDescription.value,
    keyConcepts.value,
    learningObjectives.value,
  );
  connectIntro.content.forEach((text) => {
    parts.push({
      type: "text",
      text,
    });
  });
  await lectureStepService.create({
    title: "Connection",
    type: "step",
    lectureId,
    order: "" + Date.now(),
    parts,
  });

  // Creating the concept steps
  nbQuiz = 3;
  nbQuestionPerQuiz = 2;

  progress.value = 20 / 100;
  for (let i = 0; i < tableOfContent.value.length; i++) {
    parts = [];

    const step = tableOfContent.value[i];
    const conceptName = step.name;
    progressLabel.value = t("wizard.generating.concept") + ' ' + conceptName;
    progress.value += 0.25 / tableOfContent.value.length;

    const conceptText = await aiService.getConceptContent(
        step,
        extendedQueryForConcept.value
      );

    conceptText.pages.forEach((text) => {
      parts.push({
        type: "text",
        text,
      });
    });

    progress.value += 0.25 / tableOfContent.value.length;

    const conceptQuiz = await aiService.getConceptQuiz(
      step,
      nbQuiz * nbQuestionPerQuiz,
    );
    parts = [
      ...parts,
      ...createQuizParts(conceptQuiz.questions, nbQuestionPerQuiz),
    ];

    await lectureStepService.create({
      title: step.name,
      type: "step",
      lectureId,
      order: "" + Date.now(),
      parts,
    });
  }

  // creating the practive quiz step
  progressLabel.value = t("wizard.generating.practice");
  progress.value = 90 / 100;

  // Generating the practice quiz
  nbQuiz = 4;
  nbQuestionPerQuiz = 5;
  parts = [];
  const practiceQuiz = await aiService.getFinalQuiz(
    courseDescription.value,
    keyConcepts.value,
    learningObjectives.value,
    tableOfContent.value,
    nbQuiz * nbQuestionPerQuiz,
  );
  parts = createQuizParts(practiceQuiz.questions, nbQuestionPerQuiz);
  await lectureStepService.create({
    title: "Quiz",
    type: "step",
    lectureId,
    order: "" + Date.now(),
    parts,
  });

  // creating the final conclusion step
  progress.value = 95 / 100;
  progressLabel.value = t("wizard.generating.conclusion");
  parts = ["roti", "difficulty", "stars"].map((type, idx) => ({
    type: "quiz",
    questions: [
      {
        id: "conclusion-" + idx,
        type: "feedback",
        text: t("quiz.feedback.question." + type),
        answers:
          type == "stars"
            ? []
            : [1, 2, 3, 4, 5].map((index) => ({
                text: t("quiz.feedback.tooltips." + type + "." + index),
              })),
        options: [
          {
            name: "feedbackType",
            value: type,
          },
        ],
      },
    ],
  }));

  await lectureStepService.create({
    title: "Feedback",
    type: "step",
    lectureId,
    order: "" + Date.now(),
    parts,
  });

  progressLabel.value = t("wizard.generating.finished");
  progress.value = 1;
};

const openLecture = () => {
  router.push({ name: "LectureView", params: { id: lectureId } });
};
</script>
