<template>
  <q-card-section>
    <q-splitter v-model="splitterModel" style="height: 400px">
      <template v-slot:before>
        <div class="q-pa-md">
          <q-tree no-connectors :nodes="toc" node-key="id" v-model:selected="selected" />
        </div>
      </template>
      <template v-slot:after>
        <div class="q-pa-md" v-html="preview"></div>
      </template>
    </q-splitter>
  </q-card-section>
</template>

<script setup>
import { ref, watch, defineProps, computed } from "vue";

import { useIris } from "src/composables/iris";
const { t } = useIris();
// Define the props
const props = defineProps({
  lecture: {
    type: Object,
    required: true,
  }
});

const toc = ref([]);
// Function to extract the first h3 or h5 title from HTML content
const extractTitle = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  const h3 = div.querySelector("h3");
  const h5 = div.querySelector("h5");
  return h3 ? h3.textContent : h5 ? h5.textContent : null;
};

// Function to build the TOC structure
const buildToc = (steps) => {
  return steps.map((step, stepIdx) => {
    let previousIsQuiz = false;
    const children = step.parts
      .map((part, idx) => {
        if (part.type === "text") {
          let label = extractTitle(part.text);
          if (label === step.title) {
            label = t("step.introduction");
          }
          previousIsQuiz = false;
          return {
            id: stepIdx + "." + idx,
            label,
            type: part.type,
          };
        } else if (part.type === "quiz") {
          if (previousIsQuiz) {
            return {};
          }
          previousIsQuiz = true;
          return {
            id: stepIdx + "." + idx,
            label: t("quiz.name"),
            type: part.type,
          };
        }
        return {};
      })
      .filter((child) => Boolean(child.label));

    const result = {
      id: "" + stepIdx,
      label: step.title,
      type: step.type,
      children: children,
    };
    return result;
  });
};

// Watch the lecture prop and update TOC accordingly
const selected = ref(null);
watch(
  () => props.lecture,
  (newLecture) => {
    if (newLecture && newLecture.steps && newLecture.steps) {
      toc.value = buildToc(newLecture.steps);
    }
    selected.value = null;
  },
  { immediate: true },
);

const splitterModel = ref(30);
const preview = computed(() => {
  const idx = selected.value?.split(".");
  if (!idx || idx.length !== 2) {
    return "";
  }
  const step = props.lecture.steps[idx[0]]?.parts[idx[1]];
  if (!step) {
    return "";
  }
  if (step.type === "quiz") {
    // get the questions and return them an html list
    return (
      "<h5>"+ t("quiz.name") + "</h5>" +
      "<ul>" +
      step.questions
        .map((question) => {
          return `<li>${question.text}</li>`;
        })
        .join("") +
      "</ul>"
    );
  }
  return step.text;
});

</script>

<style>
/* Add any custom styles here */
</style>
