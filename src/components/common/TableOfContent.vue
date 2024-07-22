<template>
  <q-card-section>
    <q-splitter v-model="splitterModel" style="height: 410px">
      <template #before>
        <div class="q-pa-md">
          <q-tree
            ref="tree"
            v-model:selected="selected"
            no-connectors
            accordion
            selected-color="primary"
            :nodes="toc"
            node-key="id"
          />
        </div>
      </template>
      <template #after>
        <part-display
          v-if="previewPart && previewPart.type !== 'quiz'"
          :part="previewPart"
          flat
        />
        <rich-text-renderer v-else class="q-pa-md" :html-content="preview" />
      </template>
    </q-splitter>
  </q-card-section>
</template>

<script setup>
import PartDisplay from "src/components/part/display/PartDisplay.vue";
import RichTextRenderer from "src/components/common/RichTextRenderer.vue";
import { ref, watch, defineProps, computed } from "vue";

import { useIris } from "src/composables/iris";
const { t } = useIris();
// Define the props
const props = defineProps({
  lecture: {
    type: Object,
    required: true,
  },
});

const toc = ref([]);
// Function to extract the first h3 or h5 title from HTML content
const extractTitle = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  const h3 = div.querySelector("h3");
  const h5 = div.querySelector("h5");
  return h3
    ? h3.textContent
    : h5
      ? h5.textContent
      : div.textContent.substring(0, 30) + "...";
};

// Function to build the TOC structure
const buildToc = (steps) => {
  return steps.map((step, stepIdx) => {
    let previousIsQuiz = false;
    const children = step.parts
      .map((part, idx) => {
        let label = part.text?.split("\n")[0] || "";
        if (part.type === "text") {
          label = extractTitle(part.text);
          if (label === step.title) {
            label = t("step.introduction");
          }
          previousIsQuiz = false;
        } else if (part.type === "quiz") {
          if (previousIsQuiz) {
            label = null;
          } else {
            label = t("quiz.name");
          }
          previousIsQuiz = true;
        } else {
          previousIsQuiz = false;
        }
        return {
          id: stepIdx + "." + idx,
          label,
          type: part.type,
        };
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
  () => props.lecture || props.lecture.steps,
  () => {
    if (props.lecture && props.lecture.steps) {
      toc.value = buildToc(props.lecture.steps);
    }
    selected.value = null;
  },
  { immediate: true },
);

const splitterModel = ref(40);
const previewPart = computed(() => {
  const idx = selected.value?.split(".");
  if (!idx || idx.length !== 2) {
    return null;
  }
  return props.lecture.steps[idx[0]]?.parts[idx[1]];
});
const preview = computed(() => {
  const part = previewPart.value;
  if (!part) {
    return "";
  }
  if (part.type === "quiz") {
    // get the questions and return them an html list
    return (
      "<h5>" +
      t("quiz.name") +
      "</h5>" +
      "<ul>" +
      part.questions
        .map((question) => {
          return `<li>${question.text}</li>`;
        })
        .join("") +
      "</ul>"
    );
  }
  return part.text;
});

const tree = ref(null);
watch(selected, (newVal) => {
  if (newVal) {
    const idx = newVal.split(".");
    if (idx.length === 1) {
      tree.value.setExpanded(newVal, true);
    }
  }
});
</script>

<style>
/* Add any custom styles here */
</style>
