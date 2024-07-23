<template>
  <q-page padding>
    <q-stepper v-model="step" animated>
      <q-step :title="$t('wizard.lecture.title')" :name="1">
        <setup-wizard-step
          v-model="step"
          :prerequisites="prerequisites"
          @options="
            (values) => {
              options = {...options, ...values}
            }
          "
          @course-description="(value) => courseDescription = value"
        />
        <q-stepper-navigation>
          <q-space />
          <q-btn
            :disable="courseDescription.length > 10000"
            :loading="loading"
            color="primary"
            :label="$t('wizard.common.next')"
            @click="generateTitleAndObjectives()"
          />
        </q-stepper-navigation>
      </q-step>
      <!-- Step 2: Title, Key Concepts, and Learning Objectives -->
      <q-step :title="$t('wizard.titleKeyConceptsObjectives.title')" :name="2">
        <div class="q-pa-none q-col-gutter-sm">
          <q-input
            v-model="title"
            outlined
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
          </q-list>
          <div v-if="keyConcepts.length < 7" class="row">
            <q-btn
              class="col"
              flat
              :label="$t('wizard.titleKeyConceptsObjectives.addConcept')"
              @click="addKeyConcept"
            />
            <q-btn
              class="col"
              flat
              :label="$t('wizard.titleKeyConceptsObjectives.addAIConcepts')"
              @click="
                generateTitleAndObjectives(keyConcepts, learningObjectives)
              "
            />
          </div>
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
              v-for="(tocStep, stepIndex) in tableOfContent"
              :key="stepIndex"
            >
              <q-item-section>
                <q-input
                  v-model="tocStep.name"
                  :placeholder="$t('wizard.tableOfContent.stepName')"
                  outlined
                  dense
                />
                <q-list :label="$t('wizard.tableOfContent.stepParts')">
                  <q-item
                    v-for="(item, itemIndex) in tocStep.items"
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
          </q-list>
          <div class="row">
            <q-btn
              class="col"
              flat
              :label="$t('wizard.tableOfContent.addStep')"
              @click="addStep"
            />
            <q-btn
              class="col"
              flat
              :label="$t('wizard.tableOfContent.addAIStep')"
              @click="generateTableOfContent(tableOfContent)"
            />
          </div>
        </div>
        <q-stepper-navigation>
          <q-space />
          <q-btn flat :label="$t('wizard.common.back')" @click="step--" />
          <q-btn
            :loading="loading"
            color="primary"
            :label="$t('wizard.common.finish')"
            @click="generateLecture()"
          />
        </q-stepper-navigation>
      </q-step>
      <!-- Step 3: Generating lecture -->
      <q-step :title="$t('wizard.generating.title')" :name="4">
        <q-spinner-gears v-if="progress < 1" color="primary" size="xl" />
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
        <my-table-of-content
          v-if="lecturePreview"
          :lecture="lecturePreview"
          class="q-pa-sm"
        />
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
import MyTableOfContent from "src/components/common/TableOfContent.vue";
import SetupWizardStep from "src/components/wizard/SetupWizardStep.vue";

import { ref, inject, onMounted, nextTick } from "vue";

import { useIris, useFormatter } from "src/composables/iris";
const { t, locale, router, uid } = useIris();
const { htmlToMarkdown } = useFormatter();
const {
  ai: aiService,
  lecture: lectureService,
  concept: conceptService,
  course: courseService,
  lectureConcept: lectureConceptService,
  lectureStep: lectureStepService,
} = inject("services");

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

const generateTitleAndObjectives = async (concepts = [], objectives = []) => {
  loading.value = true;

  options.value.prerequisites = prerequisites;
  options.value.locale = locale.value;
  aiService.setOptions(options.value);

  console.log("Generating title and objectives", concepts);
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

let lectureId;
const createQuizPart = (questions, nbQuestions, conceptIdMap) => {
  if (!questions) {
    return undefined;
  }

  // remove response that are not valid
  questions.forEach((question) => {
    question.answers =
      question.answers?.filter((answer) => Boolean(answer.text)) || [];
  });
  questions = questions.filter(
    (question) => Boolean(question.text) && question.answers.length > 0,
  );

  // need to clean potential issue created by the AI
  questions.forEach((question) => {
    // map the concept to the conceptId
    question.conceptId = conceptIdMap[question.concept] || conceptIdMap.default;
    delete question.concept;

    question.id = uid();
    // remove the "Fill in the blank:", "Myth or Fact: ", "True or False: "
    question.text = question.text.replace(
      /\s*(Fill in the blank:|Myth or Fact:|Fact or Myth:|Is it a myth or a fact:|True or False:|Is this statement true or false?|True or False?|Myth or Fact?|\(True\/False\))\s*/,
      "",
    );
    question.text = question.text.replace(
      /\s*(Complete the sentence:|Choose the correct ending:|Which of the following best completes the sentence:)\s*/,
      "",
    );
    question.text = question.text.replace(
      /\s*(as discussed in the section|based on the section content|according to the section|according to the lecture|according to the content)\s*/,
      "",
    );
    question.answers.forEach((answer) => {
      // remove starting A. or B. or C. or D. from the answer
      answer.text = answer.text.replace(/^[A-Z0-9a-z][.)]\s/, "");
    });

    // if there is only one answer, we add the missing one
    if (question.answers.length === 1) {
      if (question.answers[0].text === "True") {
        question.answers.push({ text: "False", valid: false });
      }
      if (question.answers[0].text === "False") {
        question.answers.push({ text: "True", valid: false });
      }
      if (question.answers[0].text === "Myth") {
        question.answers.push({ text: "Fact", valid: false });
      }
      if (question.answers[0].text === "Fact") {
        question.answers.push({ text: "Myth", valid: false });
      }
    }

    // Open Ai has the tendancy to invent new types of questions
    const mappingTypes = {
      "fill-in-the-blank": "shorttext",
      "missing-word": "shorttext",
      missing_word: "shorttext",
      word: "shorttext",
      shorttext: "shorttext",
      checkbox: "checkbox",
    };
    if (mappingTypes[question.type]) {
      question.type = mappingTypes[question.type];
    } else if (question.answers.length === 1) {
      question.type = "shorttext";
    } else if (question.answers.filter((a) => a.correct).length > 1) {
      question.type = "checkbox";
    } else {
      question.type = "radio";
    }

    //sometimes it changes explanations to explanation
    if (question.explanation) {
      question.explanations = question.explanation;
      delete question.explanation;
    }
  });
  return {
    type: "quiz",
    questions,
    options: {
      nbQuestions,
    },
  };
};

let lecturePreview = ref();
const generateLecture = async () => {
  step.value++;

  // create the lecture
  progress.value = 0;
  progressLabel.value = t("wizard.generating.create");

  const description =
    "<b>" +
    t("wizard.titleKeyConceptsObjectives.objectives") +
    ":</b><br/><ul><li>" +
    learningObjectives.value.join("</li><li>") +
    "</li></ul>";

  let lecture = await lectureService.create({
    title: title.value,
    courseId: props.id,
    order: "" + Date.now(),
    description,
    locale: locale.value,
  });
  lectureId = lecture.id;

  // add the key concepts
  progress.value = 5 / 100;
  const conceptList = await conceptService.list();
  let conceptIdMap = {};
  for (const keyConcept of keyConcepts.value) {
    let concept = conceptList.find(({ title }) => title === keyConcept.name);
    if (!concept) {
      concept = await conceptService.create({
        title: keyConcept.name,
        description: keyConcept.description,
      });
    }
    await lectureConceptService.create({
      lectureId,
      conceptId: concept.id,
    });
    keyConcept.id = concept.id;
    conceptIdMap[keyConcept.name] = concept.id;
    conceptIdMap[concept.id] = concept.id;
  }

  // creating the connection step
  let parts = [];
  progress.value = 10 / 100;
  progressLabel.value = t("wizard.generating.connect");

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
  const connectStep = await lectureStepService.create({
    title: t("wizard.content.connection_title"),
    type: "step",
    lectureId,
    order: "" + Date.now(),
    parts,
  });
  lecture.steps.push(connectStep);
  lecturePreview.value = lecture;

  // Creating the concept steps
  const nbQuestion = 12;
  progress.value = 20 / 100;
  const conceptParts = await Promise.all(
    tableOfContent.value.map(async (step, index) => {
      // To avoid rate limits, we need to wait for 40s
      // (10K for the HTML, 10K for the quiz for a rate limit of 30K, so 40s between runs)
      if (index > 0) {
        await new Promise((resolve) => setTimeout(resolve, index * 40 * 1000));
      }
      let questions = [];
      let parts = [];

      const conceptName = step.name;

      const conceptText = await aiService.getConceptContent(
        step,
        options.value.extendedQueryForConcept,
      );
      if (conceptText.pages) {
        conceptText.pages.forEach((text) => {
          parts.push({
            type: "text",
            text,
          });
        });
      } else {
        console.log("No content for concept section", conceptName);
      }

      progressLabel.value = t("wizard.generating.concept") + " " + conceptName;
      progress.value += 0.3 / tableOfContent.value.length;

      const shortLectureContent = htmlToMarkdown(parts[0].text);

      const fullLectureContent = parts
        .filter((part) => part.text)
        .map((part) => htmlToMarkdown(part.text))
        .join("\n\n");

      // order of the question is not important
      await Promise.all(
        [1, 2, 3, 4].map(async (level) => {
          const conceptQuiz = await aiService.singleQuiz(
            step.name,
            fullLectureContent.length > 4000
              ? shortLectureContent
              : fullLectureContent,
            level,
          );
          if (conceptQuiz.questions) {
            questions.push(...conceptQuiz.questions);
          } else {
            console.log("No quiz for concept section", conceptName, level);
          }
          progress.value += 0.1 / tableOfContent.value.length;
        }),
      );

      conceptIdMap.default = conceptIdMap[step.concept];
      parts.push(createQuizPart(questions, nbQuestion, conceptIdMap));

      lecturePreview.value = null;
      const conceptStep = {
        title: step.name,
        type: "step",
        lectureId,
        order: "" + Date.now(),
        conceptId: conceptIdMap[step.concept],
        level: step.level,
        parts,
      };

      lecture.steps.push(conceptStep);
      nextTick(() => {
        lecturePreview.value = lecture;
      });
      return conceptStep;
    }),
  );
  let now = Date.now();
  for (const part of conceptParts) {
    part.order = "" + now;
    now += 1000;
    await lectureStepService.create(part);
  }
  progressLabel.value = t("wizard.generating.finished");
  progress.value = 1;
};

const openLecture = () => {
  router.push({ name: "LectureView", params: { id: lectureId } });
};
</script>

<style>
.q-tree__node-header-content div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
