<template>
  <q-dialog v-model="popupVisible" position="top">
    <q-card style="width: 60%; min-width: 350px; max-width: 800px">
      <q-stepper v-model="activeStep" flat animated>
        <q-step :title="$t('wizard.drawing.step1')" name="step1">
          <q-card-section>
            <q-input
              v-model="subject"
              outlined
              :placeholder="$t('wizard.drawing.description')"
              type="textarea"
              rows="15"
            />
          </q-card-section>
        </q-step>

        <q-step :title="$t('wizard.drawing.step2')" name="step2">
          <q-card-section class="row justify-center">
            <q-spinner-gears color="primary" size="xl" />
          </q-card-section>
        </q-step>

        <q-step :title="$t('wizard.drawing.step3')" name="step3">
          <q-select
            v-model="selectedOption"
            :options="options"
            outlined
            emit-value
            map-options
            options-dense
          />
        </q-step>
      </q-stepper>

      <q-separator />

      <q-card-actions>
        <q-space />
        <q-btn
          v-if="activeStep !== 'step1'"
          flat
          :label="$t('wizard.common.back')"
          @click="prevStep"
        />
        <q-btn
          :loading="loading"
          :label="$t('wizard.common.next')"
          color="primary"
          :disable="loading"
          @click="nextStep"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, inject, watch } from "vue";

import { useFormatter, useIris } from "src/composables/iris";
const { htmlToMarkdown } = useFormatter();
const { locale } = useIris();

const { ai: aiService, excalidraw: excalidrawService } = inject("services");

const popupVisible = defineModel({ type: Boolean });
const props = defineProps({
  index: { type: Number, default: 0 },
  parts: { type: Array, required: true },
});

const emit = defineEmits(["drawing"]);

// build the inital description based on the previous parts
// Get the text from the parts, and concateante it
const lectureContent =
  props.index === 0
    ? props.parts
        .filter((part) => part.text)
        .map((part) => htmlToMarkdown(part.text))
        .join("\n")
    : htmlToMarkdown(props.parts[props.index - 1].text);

let activeStep = ref("step1");
let subject = ref(lectureContent);

let loading = ref(false);

const prevStep = () => {
  if (activeStep.value === "step2") {
    activeStep.value = "step1";
  } else if (activeStep.value === "step3") {
    activeStep.value = "step2";
    generateDrawings();
  }
};

const nextStep = () => {
  if (activeStep.value === "step1") {
    activeStep.value = "step2";
    generateDrawings();
  } else if (activeStep.value === "step2") {
    activeStep.value = "step3";
  } else if (activeStep.value === "step3") {
    finish();
  }
};

let drawings = {};
const options = ref([]);
let selectedOption = ref(null);
const generateDrawings = async () => {
  loading.value = true;
  aiService.setOptions({ locale: locale.value });
  drawings = await aiService.getDrawingsSugestions(subject.value);
  console.log(drawings);
  drawings.visuals = drawings.visuals.sort((a, b) => b.score - a.score);
  drawings.visuals.forEach((drawing, idx) => {
    options.value.push({ label: drawing.visual, value: idx });
  });

  loading.value = false;
  activeStep.value = "step3"; // Let the user pick a drawing

  selectedOption.value = 0;
};

const selectDrawing = async (value) => {
  if (!drawings.visuals) {
    return;
  }
  const selected = drawings.visuals[value];
  let visual = selected.visual;
  if (visual.substring(0, 7) === "mermaid") {
    visual = "mermaid";
  }
  const { elements, files } = await excalidrawService[visual](
    selected.parameters,
  );

  emit("drawing", { elements, files });
};

watch(
  selectedOption,
  (value) => {
    selectDrawing(value || 0);
  },
  { immediate: true },
);
const finish = () => {
  popupVisible.value = false;
  activeStep.value = "step1";
};
</script>
