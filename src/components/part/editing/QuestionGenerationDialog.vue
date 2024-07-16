<template>
  <q-dialog v-model="popupVisible">
    <q-card style="width: 60%; min-width: 350px; max-width: 800px">
      <q-stepper v-model="activeStep" flat animated>
        <q-step :title="$t('wizard.questions.step1')" name="step1">
          <q-card-section>
            <q-input
              outlined
              v-model="subject"
              :placeholder="$t('wizard.questions.description')"
              type="textarea"
              rows="15"
            />
          </q-card-section>
        </q-step>

        <q-step :title="$t('wizard.questions.step2')" name="step2">
          <q-card-section>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="help_center" />
                </q-item-section>
                <q-item-section>
                  <q-slider
                    snap
                    label
                    switch-label-side
                    v-model="nbQuestions"
                    :label-value="
                      nbQuestions +
                      ' ' +
                      $t('wizard.questions.number', nbQuestions)
                    "
                    :min="1"
                    :max="12"
                  />
                </q-item-section>
              </q-item>
              <difficulty-slider
                :difficulty="difficulty"
                @difficulty="(value) => (difficulty = value)"
              />
              <q-item>
                <q-toggle
                  v-model="explanation"
                  :label="$t('wizard.questions.explanation')"
                />
              </q-item>
              <q-item>
                <q-select
                  class="col-12"
                  outlined
                  v-model="type"
                  :label="$t('wizard.questions.type')"
                  :options="typeOptions"
                />
              </q-item>
            </q-list>
          </q-card-section>
        </q-step>

        <q-step :title="$t('wizard.questions.step3')" name="step3">
          <q-card-section class="row justify-center">
            <q-spinner-gears color="primary" size="xl" />
          </q-card-section>
        </q-step>
      </q-stepper>

      <q-separator />

      <q-card-actions>
        <q-space />
        <q-btn
          flat
          :label="$t('wizard.common.back')"
          :disable="activeStep === 'step1'"
          @click="prevStep"
        />
        <q-btn
          :loading="loading"
          :label="$t('wizard.common.next')"
          color="primary"
          :disable="activeStep === 'step3'"
          @click="nextStep"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import DifficultySlider from "src/components/common/DifficultySlider.vue";

import { ref, inject } from "vue";

import { useFormatter, useIris } from "src/composables/iris";
const { t } = useIris();
const { htmlToMarkdown } = useFormatter();

const { ai: aiService } = inject("services");

const popupVisible = defineModel();
const props = defineProps({
  parts: { type: Array },
});

const emit = defineEmits(["questions"]);

// build the inital description based on the parts content
// Get the text from the parts, and concateante it
const lectureContent = props.parts
  .filter((part) => part.text)
  .map((part) => htmlToMarkdown(part.text))
  .join("\n");

let activeStep = ref("step1");
let subject = ref(lectureContent);

const typeOptions = [
  "truefalse",
  "mythfact",
  "choice",
  "checkbox",
  "missingword",
  "finishsentence",
].map((type) => ({
  label: t("wizard.questions.types." + type),
  value: type,
}));

let nbQuestions = ref(6);
let difficulty = ref(3);
let type = ref();
let explanation = ref(true);
let loading = ref(false);

const prevStep = () => {
  if (activeStep.value === "step2") {
    activeStep.value = "step1";
  } else if (activeStep.value === "step3") {
    activeStep.value = "step2";
  }
};

const nextStep = () => {
  if (activeStep.value === "step1") {
    activeStep.value = "step2";
  } else if (activeStep.value === "step2") {
    activeStep.value = "step3";
    finishStepper();
  }
};

const finishStepper = async () => {
  loading.value = true;
  const quizType = type.value.value || "choice";
  const response = await aiService.getQuiz(
    subject.value,
    difficulty.value,
    nbQuestions.value,
    quizType,
    explanation.value,
  );

  response.questions.forEach((question, idx) => {
    question.text = question.text.replace(
      /\s*(Fill in the blank:|Myth or Fact:|Fact or Myth:|Is it a myth or a fact:|True or False:|Is this statement true or false?|Complete the sentence:|\(True\/False\))\s*/,
      "",
    );
    question.answers.forEach((answer) => {
      // remove starting A. or B. or C. or D. from the answer
      answer.text = answer.text.replace(/^[A-Z0-9a-z][.)]\s/, "");
    });

    // pluralise the explanation
    question.explanations = question.explanation;
    delete question.explanation;
    //add the type
    question.type = "radio";
    if (quizType === "checkbox") {
      question.type = "checkbox";
    } else if (quizType === "missingword") {
      if (question.answers.length > 1) {
        question.type = "radio";
      } else {
        question.type = "shorttext";
      }
    }
    question.options = {};
    question.id = Date.now() + "_" + idx;
  });

  loading.value = false;
  popupVisible.value = false;
  activeStep.value = "step1"; // Reset the stepper for next use

  emit("questions", { questions: response.questions });
};
</script>
