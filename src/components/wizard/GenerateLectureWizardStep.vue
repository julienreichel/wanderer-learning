<template>
  <div class="row justify-center">
    <q-spinner-gears v-if="progress < 1" color="primary" size="xl" />
  </div>
  <q-linear-progress
    :value="progress"
    class="q-mt-md"
    size="25px"
    animation-speed="10000"
  >
    <div class="absolute-full flex flex-center">
      <q-badge color="white" text-color="primary" :label="progressLabel" />
    </div>
  </q-linear-progress>
  <my-table-of-content
    v-if="lecturePreview"
    :lecture="lecturePreview"
    class="q-pa-sm"
  />
</template>

<script setup>
import MyTableOfContent from "src/components/common/TableOfContent.vue";
import { ref, inject, nextTick, watch } from "vue";
import { useIris, useFormatter } from "src/composables/iris";

const { t, uid } = useIris();
const { htmlToMarkdown } = useFormatter();
const {
  ai: aiService,
  lecture: lectureService,
  concept: conceptService,
  lectureConcept: lectureConceptService,
  lectureStep: lectureStepService,
  excalidraw: excalidrawService,
} = inject("services");

const props = defineProps({
  lectureTitle: { type: String, required: true },
  lectureContent: { type: String, required: true },
  keyConcepts: { type: Array, required: true },
  learningObjectives: { type: Array, required: true },
  tableOfContent: { type: Array, required: true },
  locale: { type: String, required: true },
  courseId: { type: String, required: true },
  step: { type: Number, required: true },
  extendedQueryForConcept: { type: Boolean, required: true },
  useVisuals: { type: Boolean, required: true },
  model: { type: String, required: true },
});

const emit = defineEmits(["lectureCreated"]);

const progress = ref(0);
const progressLabel = ref("");
const lecturePreview = ref(null);

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
    question.text = question.text
      .replace(/\t/g, "\\t")
      .replace(/\f/g, "\\f")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r");

    question.explanations = question.explanations
      ?.replace(/\t/g, "\\t")
      .replace(/\f/g, "\\f")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r");

    question.answers.forEach((answer) => {
      // remove starting A. or B. or C. or D. from the answer
      answer.text = answer.text.replace(/^[A-Z0-9a-z][.)]\s/, "");
      // there should not be isolated \ in the text, in this case replace it by \\
      answer.text = answer.text
        .replace(/\t/g, "\\t")
        .replace(/\f/g, "\\f")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
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

const generateDrawing = async (part) => {
  // generate the visuals for each part
  const text = htmlToMarkdown(part.text);
  const drawings = await aiService.getDrawingsSugestions(text);
  console.log("drawings", drawings);
  let visual = drawings.selection.visual;
  let selected = drawings.visuals.find((item) => item.visual === visual);
  if (!selected) {
    selected = drawings.visuals.sort((a, b) => b.score - a.score)[0];
    visual = selected.visual;
  }
  if (selected.visualImpact < 75) {
    console.log("Visual impact too low, dropping it", selected);
    return null;
  }
  const { elements, files } = await excalidrawService[visual](
    selected.parameters,
  );
  return {
    type: "drawing",
    src: JSON.stringify({ elements, files }),
  };
};

const generateLecture = async () => {
  let lectureId;

  // create the lecture
  progress.value = 0;
  progressLabel.value = t("wizard.generating.create");

  const description =
    "<b>" +
    t("wizard.titleKeyConceptsObjectives.objectives") +
    ":</b><br/><ul><li>" +
    props.learningObjectives.join("</li><li>") +
    "</li></ul>";

  let lecture = await lectureService.create({
    title: props.lectureTitle,
    courseId: props.courseId,
    order: "" + Date.now(),
    description,
    locale: props.locale,
  });
  lectureId = lecture.id;

  // add the key concepts
  progress.value = 5 / 100;
  const conceptList = await conceptService.list();
  let conceptIdMap = {};
  for (const keyConcept of props.keyConcepts) {
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
    props.lectureContent,
    props.keyConcepts,
    props.learningObjectives,
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

  if (props.useVisuals) {
    await Promise.all(
      connectStep.parts
        .filter((part) => part.text)
        .map(async (part) => {
          // generate the visuals for each part
          const newPart = await generateDrawing(part);

          // insert the drawing part after the text part
          if (newPart) {
            const index = connectStep.parts.indexOf(part);
            connectStep.parts.splice(index + 1, 0, newPart);
          }
        }),
    );

    await lectureStepService.update(connectStep);
    lecturePreview.value = null;
    nextTick(() => {
      lecturePreview.value = lecture;
    });
  }

  // Creating the concept steps
  const nbQuestion = 12;
  progress.value = 20 / 100;
  let now = Date.now();
  await Promise.all(
    props.tableOfContent.map(async (step, index) => {
      const order = "" + now;
      now += 1000;
      // To avoid rate limits, we need to wait
      const waitTime = {
        "gpt-3": 10,
        "gpt-40-mini": 5, // reate limits is very high, jsut wait a bit for the backend
        "gpt-4o": 40, // (10K for the HTML, 10K for the quiz for a rate limit of 30K, so 40s between runs)
      }[props.model];
      const maxChars = {
        "gpt-3": 4000,
        "gpt-40-mini": 10000,
        "gpt-4o": 4000,
      }[props.model];
      if (props.model === "gpt-4o" && index > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, index * waitTime * 1000),
        );
      }
      let questions = [];
      let parts = [];

      const conceptName = step.name;

      const conceptText = await aiService.getConceptContent(
        step,
        props.extendedQueryForConcept,
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
      progress.value += 0.2 / props.tableOfContent.length;

      const conceptStep = await lectureStepService.create({
        title: step.name,
        type: "step",
        lectureId,
        order,
        conceptId: conceptIdMap[step.concept],
        level: step.level,
        parts,
      });

      lecture.steps.push(conceptStep);

      lecturePreview.value = null;
      nextTick(() => {
        lecturePreview.value = lecture;
      });
      if (props.useVisuals) {
        await Promise.all(
          conceptStep.parts
            .filter((part) => part.text)
            .map(async (part) => {
              // generate the visuals for each part
              const newPart = await generateDrawing(part);

              // insert the drawing part after the text part
              if (newPart) {
                const index = conceptStep.parts.indexOf(part);
                conceptStep.parts.splice(index + 1, 0, newPart);
              }
            }),
        );
        lecturePreview.value = null;
        nextTick(() => {
          lecturePreview.value = lecture;
        });
      }
      progress.value += 0.1 / props.tableOfContent.length;

      const shortLectureContent = htmlToMarkdown(parts[0].text);

      const fullLectureContent = conceptStep.parts
        .filter((part) => part.text)
        .map((part) => htmlToMarkdown(part.text))
        .join("\n\n");
      // order of the question is not important
      await Promise.all(
        [1, 2, 3, 4].map(async (level) => {
          const conceptQuiz = await aiService.singleQuiz(
            step.name,
            fullLectureContent.length > maxChars
              ? shortLectureContent
              : fullLectureContent,
            level,
          );
          if (conceptQuiz.questions) {
            questions.push(...conceptQuiz.questions);
          } else {
            console.log("No quiz for concept section", conceptName, level);
          }
          progress.value += 0.1 / props.tableOfContent.length;
        }),
      );

      conceptIdMap.default = conceptIdMap[step.concept];
      conceptStep.parts.push(
        createQuizPart(questions, nbQuestion, conceptIdMap),
      );
      await lectureStepService.update(conceptStep);

      return conceptStep;
    }),
  );

  emit("lectureCreated", lecture);
  progressLabel.value = t("wizard.generating.finished");
  progress.value = 1;
};

watch(
  () => props.step,
  (value) => {
    if (value === 4) {
      generateLecture();
    }
  },
  { immediate: true },
);
</script>
