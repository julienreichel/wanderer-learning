<template>
  <div class="q-gutter-sm">
    <div class="text-h6">{{ $t("wizard.lecture.description") }}</div>
    <div class="row q-col-gutter-sm">
      <q-input
        v-model="courseDescription"
        class="col"
        outlined
        :placeholder="$t('wizard.lecture.label')"
        type="textarea"
        rows="20"
        counter
      >
        <template #counter>
          <div :class="{ 'text-warning': courseDescription.length > 10000 }">
            {{ courseDescription.length }} / 10000
          </div>
        </template>
      </q-input>
      <q-file
        v-if="!tree"
        v-model="pdfFiles"
        class="col-4"
        style="max-width: 300px"
        outlined
        :label="$t('wizard.lecture.pdf_upload')"
        accept=".pdf, application/pdf"
      />
      <div v-else class="col-4 q-gutter-sm">
        <q-slider v-model="nbLines" :min="0" :max="10" class="q-px-lg" />
        <q-tree
          v-model:ticked="ticked"
          :nodes="tree"
          node-key="label"
          tick-strategy="strict"
        />
        <div class="row">
          <q-space />
          <q-btn
            size="sm"
            class="text-right"
            icon="clear"
            @click="tree = null"
          />
        </div>
      </div>
    </div>
    <q-toggle v-model="advanced" :label="$t('wizard.lecture.advanced')" />
    <div v-if="advanced" class="q-pa-md q-col-gutter-sm">
      <q-select
        v-model="style"
        outlined
        :label="$t('wizard.lecture.style')"
        :options="styleOptions"
        emit-value
      />
      <q-select
        v-model="tone"
        outlined
        :label="$t('wizard.lecture.tone')"
        :options="toneOptions"
        emit-value
      />
      <q-select
        v-model="audience"
        outlined
        :label="$t('wizard.lecture.audience')"
        :options="audienceOptions"
        emit-value
      />
      <q-select
        v-model="model"
        outlined
        :options="['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o']"
        :label="$t('wizard.lecture.model')"
      />
      <q-toggle
        v-model="extendedQueryForConcept"
        :label="$t('wizard.lecture.queryType')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, watch, inject } from "vue";

import { useIris } from "src/composables/iris";
const { $q } = useIris();

const { ai: aiService } = inject("services");

// Define the emits
const emit = defineEmits(["options", "courseDescription"]);

const advanced = ref(false);
const options = {
  prompt: "",
  style:
    "Richard Feynman: Simplicity, clarity, passion and enthusiasm, using storytelling with focus on fundamentals, keeping humor and wit.",
  audience:
    "University Students: More detailed and analytical, assuming a basic level of knowledge in the subject, with a focus on deeper understanding and critical thinking.",
  tone: "Educational: Informative, structured, and explanatory, providing detailed explanations and examples.",
  model: "gpt-4o-mini",
  extendedQueryForConcept: true,
  ...$q.localStorage.getItem("aiOptions"),
};
const extendedQueryForConcept = ref(options.extendedQueryForConcept);
const model = ref(options.model);
const formatOption = (text) => {
  return {
    value: text,
    label: "<b>" + text.split(": ")[0] + "</b><br/>" + text.split(": ")[1],
    html: true,
  };
};


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

const courseDescription = ref(options.prompt);

watch(
  () =>
    style.value +
    tone.value +
    audience.value +
    model.value +
    extendedQueryForConcept.value,
  () => {
    const options = {
      prompt: courseDescription.value,
      style: style.value,
      tone: tone.value,
      audience: audience.value,
      model: model.value,
      extendedQueryForConcept: extendedQueryForConcept.value,
    };
    $q.localStorage.set("aiOptions", options);
    emit("options", options);
  },
  { immediate: true }
);

watch(courseDescription, (value) => {
  const options = {
    prompt: courseDescription.value,
    style: style.value,
    tone: tone.value,
    audience: audience.value,
    model: model.value,
    extendedQueryForConcept: extendedQueryForConcept.value,
  };
  $q.localStorage.set("aiOptions", options);
  emit("courseDescription", value);
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
          nbLines.value < 10
            ? section.children.slice(0, nbLines.value)
            : section.children;
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
      const subLabels = chapter.children.map((section) => section.label);
      ticked.value = ticked.value.filter((item) => !subLabels.includes(item));
      removed.push(...subLabels);
    } else {
      const section = tree.value
        .map((item) => item.children)
        .flat()
        .find((item) => item.label === label);
      if (section) {
        const subLabels = section.children.map((section) => section.label);
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
  }, "");
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
</script>

<style>
.q-tree__node-header-content div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
