<template>
  <q-page padding>
    <q-stepper v-model="step" animated>
      <!-- Step 1: Course Description -->
      <q-step :title="$t('wizard.lecture.title')" :name="1">
        <div class="q-gutter-sm">
          <div class="text-h6">{{ $t("wizard.lecture.description") }}</div>
          <div class="row q-col-gutter-sm">
            <q-input
              class="col"
              outlined
              v-model="courseDescription"
              :placeholder="$t('wizard.lecture.label')"
              type="textarea"
              rows="20"
              counter
            >
              <template v-slot:counter>
                <div :class="{'text-warning': courseDescription.length > 10000}">{{ courseDescription.length }} / 10000</div>
              </template>
            </q-input>
            <q-file
              v-if="!tree"
              class="col-4"
              style="max-width: 300px"
              v-model="pdfFiles"
              outlined
              :label="$t('wizard.lecture.pdf_upload')"
              accept=".pdf, application/pdf"
            />
            <div v-else class="col-4 q-gutter-sm">
              <q-slider v-model="nbLines" :min="0" :max="10" class="q-px-lg" />
              <q-tree
                :nodes="tree"
                node-key="label"
                v-model:ticked="ticked"
                tick-strategy="strict"
              />
              <div class="row">
                <q-space />
              <q-btn
                size="sm"
                class="text-right"
                icon="clear"
                @click="tree = null"/>
              </div>
            </div>

          </div>
          <q-toggle v-model="advanced" :label="$t('wizard.lecture.advanced')" />
          <div v-if="advanced" class="q-pa-md q-col-gutter-sm">
            <q-select
              outlined
              v-model="style"
              :label="$t('wizard.lecture.style')"
              :options="styleOptions"
              emit-value
            />
            <q-select
              outlined
              v-model="tone"
              :label="$t('wizard.lecture.tone')"
              :options="toneOptions"
              emit-value
            />
            <q-select
              outlined
              v-model="audience"
              :label="$t('wizard.lecture.audience')"
              :options="audienceOptions"
              emit-value
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
        </div>
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
          </q-list>
          <div class="row" v-if="keyConcepts.length < 7">
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
        <table-of-content
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
import TableOfContent from "src/components/common/TableOfContent.vue";

import { ref, inject, onMounted, nextTick, watch } from "vue";

import { useIris, useFormatter } from "src/composables/iris";
const { t, locale, $q, router, uid } = useIris();
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
  id: String,
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

let pdfFiles = ref(null);
let tree = ref(null);
let ticked = ref([]);
let nbLines = ref(2);
watch(ticked, (newVal, oldVal) => {
  const added = newVal.filter((item) => !oldVal.includes(item));
  const removed = oldVal.filter((item) => !newVal.includes(item));
  // check if added is a chapter or section, and in this case enabled the children
  added.forEach((label) => {
    const chapter = tree.value.find((item) => item.label === label);
    if (chapter) {
      chapter.children.forEach((section) => {
        if (!ticked.value.includes(section.label)) {
          ticked.value.push(section.label);
          added.push(section.label);
        }
      });
    } else {
      const section = tree.value
        .map((item) => item.children)
        .flat()
        .find((item) => item.label === label);
      if (section) {
        const lines =
        nbLines.value < 10 ? section.children.slice(0, nbLines.value) : section.children;
        lines.forEach((page) => {
          if (!ticked.value.includes(page.label)) {
            ticked.value.push(page.label);
          }
        });
      }
    }
  });
  removed.forEach((label) => {
    const chapter = tree.value.find((item) => item.label === label);
    if (chapter) {
      const subLabels = chapter.children.map(section => section.label);
      ticked.value = ticked.value.filter((item) => !subLabels.includes(item));
      removed.push(...subLabels);
    } else {
      const section = tree.value
        .map((item) => item.children)
        .flat()
        .find((item) => item.label === label);
      if (section) {
        const subLabels = section.children.map(section => section.label);
        ticked.value = ticked.value.filter((item) => !subLabels.includes(item));
      }
    }
  });

  // flatten the tree
  const titleOnly = nbLines.value === 0;
  courseDescription.value = tree.value.reduce((acc, chapter) => {
    if (ticked.value.includes(chapter.label)) {
      acc += (titleOnly ? "" : "\n") + chapter.label + "\n";
    }
    acc += chapter.children.reduce((acc2, section) => {
      if (ticked.value.includes(section.label)) {
        acc2 += (titleOnly ? "" : "\n") + section.label + "\n";
      }
      acc2 += section.children.reduce((acc3, page) => {
        if (ticked.value.includes(page.label)) {
          acc3 += page.label + "\n";
        }
        return acc3;
      }, "");
      return acc2;
    }, "");
    return acc;
  }, "").slice(0, 10000);

});
watch(nbLines, (value) => {
  let newTicked = [];
  tree.value.forEach((chapter) => {
    if (!ticked.value.includes(chapter.label)) return;
    newTicked.push(chapter.label);
    chapter.children.forEach((section) => {
      if (!ticked.value.includes(section.label)) return;
      newTicked.push(section.label);
      const lines =
        value < 10 ? section.children.slice(0, value) : section.children;
      lines.forEach((page) => {
        if (!newTicked.includes(page.label)) {
          newTicked.push(page.label);
        }
      });
    });
  });
  ticked.value = newTicked;
});

watch(pdfFiles, async (file) => {
  if (!file) {
    return;
  }
  tree.value = await aiService.extractTextFromPdfFile(file);
  // by default we tick all the title, and sub and the first 2 lines of text
  ticked.value = tree.value.reduce((acc, chapter) => {
    acc.push(chapter.label);
    chapter.children.forEach((section) => {
      acc.push(section.label);
      const lines =
        nbLines.value < 10
          ? section.children.slice(0, nbLines.value)
          : section.children;
      lines.slice(0, nbLines.value).forEach((page) => {
        acc.push(page.label);
      });
    });
    return acc;
  }, []);

  pdfFiles.value = null;
});

const options = {
  prompt: "",
  style:
    "Richard Feynman: Simplicity, clarity, passion and enthusiasm, using storytelling with focus on fundamentals, keeping humor and wit.",
  audience:
    "University Students: More detailed and analytical, assuming a basic level of knowledge in the subject, with a focus on deeper understanding and critical thinking.",
  tone: "Educational: Informative, structured, and explanatory, providing detailed explanations and examples.",
  model: "gpt-3.5-turbo",
  extendedQueryForConcept: false,
  ...$q.localStorage.getItem("aiOptions"),
};

const formatOption = (text) => {
  return {
    value: text,
    label: "<b>" + text.split(": ")[0] + "</b><br/>" + text.split(": ")[1],
    html: true,
  };
};
const step = ref(1);
const courseDescription = ref(options.prompt);
const advanced = ref(false);
const style = ref(options.style);
const styleOptions = [
  "Angela Duckworth: Motivational, research-driven, focusing on grit and perseverance, combining storytelling with evidence-based strategies.",
  "Carl Sagan: Poetic, insightful, and passionate, using storytelling and clear explanations to convey the wonder and importance of science.",
  "Howard Zinn: Engaging, critical, and thought-provoking, encouraging students to question traditional narratives and explore history from multiple perspectives.",
  "Jo Boaler: Innovative, student-centered, and research-based, promoting growth mindset and conceptual understanding in mathematics.",
  "Marie Kondo: Practical, methodical, and empathetic, encouraging personal reflection and hands-on practice to achieve a tidy and organized life.",
  "Michael Sandel: Interactive, Socratic, and analytical, using real-life dilemmas and moral questions to engage students in philosophical discourse.",
  "Neil deGrasse Tyson: Charismatic, engaging, and entertaining, using analogies, humor, and real-world examples to make science accessible.",
  "Richard Feynman: Simplicity, clarity, passion and enthusiasm, using storytelling with focus on fundamentals, keeping humor and wit.",
  "Sir Ken Robinson: Inspirational, thought-provoking, and innovative, challenging traditional education paradigms and emphasizing creativity.",
].map(formatOption);
const audience = ref(options.audience);
const audienceOptions = [
  "Children: Simple language, engaging, and often includes fun elements like stories or games to maintain interest.",
  "Teenagers: Casual and relatable language, addressing their specific interests and challenges, often using examples relevant to their age group.",
  "Beginner: Basic and introductory language, ensuring concepts are explained clearly and step-by-step to build foundational understanding.",
  "University Students: More detailed and analytical, assuming a basic level of knowledge in the subject, with a focus on deeper understanding and critical thinking.",
  "Professional Adults: Formal and concise, focused on practical application, efficiency, and relevance to their professional context.",
  "Expert: Advanced and specialized language, assuming in-depth knowledge of the subject, focusing on complex concepts and detailed analysis.",
  "General Public: Accessible and clear language, covering a broad range of topics, aiming to be informative and engaging for a wide audience without assuming prior specialized knowledge.",
].map(formatOption);
const tone = ref(options.tone);
const toneOptions = [
  "Authoritative: Confident, knowledgeable, and assertive, conveying expertise and reliability.",
  "Casual: Relaxed, friendly, and conversational, using informal language and contractions.",
  "Concise: Brief, to the point, and efficient, focusing on delivering information quickly and clearly.",
  "Descriptive: Vivid, detailed, and illustrative, using rich language to paint a picture and create an immersive experience.",
  "Educational: Informative, structured, and explanatory, providing detailed explanations and examples.",
  "Empathetic: Compassionate, understanding, and supportive, showing sensitivity to the user's emotions and concerns.",
  "Formal: Polite, professional, and precise, with a focus on clarity and correctness.",
  "Humorous: Light-hearted, witty, and playful, incorporating jokes and amusing remarks.",
  "Inspirational: Motivational, uplifting, and encouraging, often using positive affirmations and quotes.",
  "Technical: Precise, jargon-heavy, and detail-oriented, suitable for explaining complex concepts and specialized information.",
].map(formatOption);
const model = ref(options.model);
const extendedQueryForConcept = ref(options.extendedQueryForConcept);

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

  const options = {
    prompt: courseDescription.value,
    style: style.value,
    tone: tone.value,
    audience: audience.value,
    model: model.value,
    extendedQueryForConcept: extendedQueryForConcept.value,
  };
  $q.localStorage.set("aiOptions", options);

  options.prerequisites = prerequisites;
  options.locale = locale.value;
  aiService.setOptions(options);

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
      /\s*(as discussed in the section|based on the section content|according to the section|according to the lecture)\s*/,
      "",
    );
    question.answers.forEach((answer) => {
      // remove starting A. or B. or C. or D. from the answer
      answer.text = answer.text.replace(/^[A-Z0-9a-z][\.)]\s/, "");
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
    tableOfContent.value.map(async (step) => {
      let questions = [];
      let parts = [];

      const conceptName = step.name;

      const conceptText = await aiService.getConceptContent(
        step,
        extendedQueryForConcept.value,
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
