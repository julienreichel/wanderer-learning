<template>
  <q-card>
    <q-card-section horizontal>
      <q-card-section class="col">
        <q-card-section
          class="q-pa-none q-pb-md q-card-hover"
          @click="viewStep(step)"
        >
          <div class="text-h5">{{ step.title }}</div>
        </q-card-section>
        <q-card-section class="q-pa-sm">
          <q-list dense>
            <q-item
              v-for="(part, index) in step.parts"
              :key="index"
              clickable
              @click="viewStep(step, index)"
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
      <q-card-section class="col-md-1 cols-sm-3">
        <q-card-section class="q-pa-sm">
          <q-icon
            v-if="step.reporting"
            name="check_box"
            color="positive"
            size="lg"
            right
          />
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
import { useIris } from "src/composables/iris";
const { router, t } = useIris();

const props = defineProps({
  step: Object,
});

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
