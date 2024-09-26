<template>
  <q-card>
    <q-card-section horizontal>
      <q-card-section class="col">
        <q-card-section class="q-pa-none q-pb-md">
          <div class="text-h5">{{ step.title }}</div>
        </q-card-section>
        <q-card-section class="q-pa-sm">
          <q-list dense>
            <q-item
              v-for="(part, index) in partsToList"
              :key="index"
              clickable
              @click="viewStep(step, step.parts.indexOf(part))"
            >
              <q-item-section side>
                <q-icon
                  :name="
                    {
                      text: 'article',
                      img: 'image',
                      video: 'smart_display',
                      quiz: 'help_center',
                      iframe: 'open_in_browser',
                      drawing: 'edit_square',
                      graph: 'assessment',
                    }[part.type]
                  "
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ getTitle(part) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card-section>
      <q-card-section style="width: 150px" class="q-px-none q-py-sm column">
        <q-card-section v-if="step.reporting" class="q-pa-sm row justify-end">
          <q-icon name="check_box" color="positive" size="lg" right />
        </q-card-section>
        <q-card-section v-if="step.reporting" class="q-pa-sm row justify-end">
          <q-badge :label="step.reporting.totalTime" />
        </q-card-section>
        <q-card-section v-if="step.score?.length" class="q-pa-none">
          <step-score :serie="step.score" :width="150" />
        </q-card-section>
      </q-card-section>
    </q-card-section>
    <q-card-actions class="q-px-none q-py-lg">
      <q-space />
      <q-btn
        size="md"
        padding="sm 64px"
        icon="chevron_right"
        @click="viewStep(step)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import StepScore from "src/components/charts/StepScore.vue";
import { useIris } from "src/composables/iris";

import { computed } from "vue";

const { router, t } = useIris();

const props = defineProps({
  step: {
    type: Object,
    default: () => ({}),
  },
});

const partsToList = computed(() =>
  props.step.parts.filter(
    (part) =>
      (part.type === "text" && part.text.startsWith("<h3>")) ||
      part.type === "quiz",
  ),
);

const getTitle = (part) => {
  if (part.type === "text") {
    const div = document.createElement("div");
    div.innerHTML = part.text;
    const h3 = div.querySelector("h3");
    const h5 = div.querySelector("h5");
    return h3
      ? h3.textContent
      : h5
        ? h5.textContent
        : div.textContent.substring(0, 30) + "...";
  } else if (part.type === "quiz") {
    return t("quiz.name");
  } else {
    return part.text?.split("\n")[0] || "";
  }
};

const viewStep = (step, index) => {
  router.push({
    name: "LectureStepView",
    params: { id: step.id, stepIdx: index || 0 },
  });
};
</script>
