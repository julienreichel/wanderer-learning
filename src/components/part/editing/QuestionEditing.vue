<template>
  <q-card-section class="row non-draggable">
    <q-input v-model="question.text" class="col-8" label="The question" />
    <q-select
      v-model="question.type"
      class="col-3 offset-1"
      outlined
      :options="questionTypeOptions"
      :option-label="(item) => $t('quiz.question.type.' + item)"
      label="Type"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-icon :name="selectIcon(scope.opt)" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{
              $t("quiz.question.type." + scope.opt)
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </q-card-section>
  <q-card-section v-if="question.type === 'feedback'">
    <q-btn-toggle v-model="feedbackType" :options="feedbackTypeOptions">
      <template #roti>
        <q-icon right name="sentiment_satisfied_alt" />
      </template>
      <template #difficulty>
        <q-icon right name="speed" />
      </template>
      <template #stars>
        <q-icon right name="grade" />
      </template>
      <template #text>
        <q-icon right name="short_text" />
      </template>
    </q-btn-toggle>
    <q-list
      v-if="feedbackType === 'roti' || feedbackType === 'difficulty'"
      class="q-gutter-sm"
    >
      <q-item v-for="index in 5" :key="index">
        <q-input
          v-if="question.answers[index - 1]"
          v-model="question.answers[index - 1].text"
          class="full-width"
        >
          <template #prepend>
            <q-icon
              :name="
                Array.isArray(icons[feedbackType])
                  ? icons[feedbackType][index - 1]
                  : icons[feedbackType]
              "
              :color="
                colors[feedbackType]
                  ? colors[feedbackType][index - 1]
                  : 'primary'
              "
            />
          </template>
        </q-input>
      </q-item>
    </q-list>
  </q-card-section>
  <q-card-section v-else>
    <q-list class="q-gutter-sm">
      <q-item
        v-for="(answer, answerIdx) in question.answers"
        :key="answerIdx"
        class="q-px-none"
      >
        <q-input v-model="answer.text" class="full-width">
          <template #prepend>
            <q-icon :name="getIcon(question)" />
          </template>
          <template #append>
            <q-toggle
              v-model="answer.valid"
              checked-icon="check"
              color="green"
              :name="'valid' + answerIdx"
              unchecked-icon="clear"
            />
            <q-btn
              flat
              padding="xs"
              size="sm"
              icon="close"
              @click="removeAnswer(question, answerIdx)"
            />
          </template>
        </q-input>
      </q-item>
    </q-list>
    <q-btn size="sm" icon="add" @click="addAnswer(question)" />
  </q-card-section>
  <q-card-section v-if="question.type !== 'feedback'">
    <div class="row">
      <q-toggle
        v-model="provideExplanation"
        class="col"
        name="explanation"
        :label="$t('quiz.question.explanation')"
      />
      <concept-selecting
        v-model="question.conceptId"
        class="col"
        :placeholder="$t('concept.form.edit')"
        outlined
      />
      <difficulty-slider
        class="col"
        :level="level"
        @level="(value) => (question.level = value)"
      />
    </div>
    <rich-text-editing
      v-if="provideExplanation"
      v-model="question.explanations"
      mode="simple"
    >
    </rich-text-editing>
  </q-card-section>
  <q-card-section v-if="feedbackType === 'text'">
    <q-input v-model="question.answers[0].text" label="The answer" />
  </q-card-section>
</template>

<script setup>
import RichTextEditing from "../../common/RichTextEditing.vue";
import DifficultySlider from "src/components/common/DifficultySlider.vue";
import ConceptSelecting from "src/components/concept/ConceptSelecting.vue";

import { ref, watch } from "vue";
import { useIris } from "src/composables/iris";
const { t, getIconFromQuestion } = useIris();

const question = defineModel({ type: Object });
if (!question.value.explanations) {
  question.value.explanations = "";
}
watch(
  () => question.value.options,
  (options) => {
    if (!options) {
      return;
    }
    feedbackType.value = question.value.options.feedbackType || "roti";
  },
);

const level = ref(question.value.level || "beginner");

const feedbackType = ref(question.value.options.feedbackType || "roti");
watch(
  [feedbackType, () => question.value.type],
  () => {
    if (question.value.type !== "feedback") {
      return;
    }
    if (feedbackType.value === "roti") {
      question.value.text = t("quiz.feedback.question.roti");
      question.value.answers = [1, 2, 3, 4, 5].map((index) => ({
        text: t("quiz.feedback.tooltips.roti." + index),
      }));
    }
    if (feedbackType.value === "difficulty") {
      question.value.text = t("quiz.feedback.question.difficulty");
      question.value.answers = [1, 2, 3, 4, 5].map((index) => ({
        text: t("quiz.feedback.tooltips.difficulty." + index),
      }));
    }
    if (feedbackType.value === "stars") {
      question.value.text = t("quiz.feedback.question.stars");
    }
    if (feedbackType.value === "text") {
      question.value.text = t("quiz.feedback.question.text");
    }
  },
  { immediate: true },
);

if (
  question.value.type === "feedback" &&
  (feedbackType.value === "roti" || feedbackType.value === "difficulty") &&
  !question.value.answers?.length === 5
) {
  question.value.answers = [1, 2, 3, 4, 5].map((index) => ({
    text: t("quiz.feedback.tooltips." + feedbackType.value + "." + index),
  }));
}

const icons = {
  difficulty: "speed",
  roti: [
    "sentiment_very_dissatisfied",
    "sentiment_dissatisfied",
    "sentiment_neutral",
    "sentiment_satisfied",
    "sentiment_satisfied_alt",
  ],
  stars: "star_border",
};
const colors = {
  difficulty: ["lime", "light-green", "green", "teal", "purple"],
};

const feedbackTypeOptions = [
  {
    label: t("quiz.feedback.type.roti"),
    value: "roti",
    slot: "roti",
  },
  {
    label: t("quiz.feedback.type.difficulty"),
    value: "difficulty",
    slot: "difficulty",
  },
  {
    label: t("quiz.feedback.type.stars"),
    value: "stars",
    slot: "stars",
  },
  {
    label: t("quiz.feedback.type.text"),
    value: "text",
    slot: "text",
  },
];

const questionTypeOptions = ["shorttext", "radio", "checkbox", "feedback"];

const selectIcon = (value) => getIconFromQuestion({ type: value });

const getIcon = (question, add) => {
  if (question.type === "radio") {
    return add ? "add_circle" : "radio_button_unchecked";
  }
  if (question.type === "checkbox") {
    return add ? "add_box" : "check_box_outline_blank";
  }
  if (question.type === "shorttext") {
    return "short_text";
  }
  if (question.type === "longtext") {
    return "notes";
  }
  if (question.type === "feedback") {
    return "rate_review";
  }
};

const provideExplanation = ref(question.value.explanations !== "");
watch(provideExplanation, (value) => {
  if (!value) {
    question.value.explanations = "";
  }
});

const removeAnswer = (question, index) => {
  return question.answers.splice(index, 1)[0];
};

const addAnswer = (question) => {
  question.answers.push({
    text: "",
    valid: false,
  });
};
</script>
