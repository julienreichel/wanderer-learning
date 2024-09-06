<template>
  <q-card-section v-if="questions.length">
    <div class="text-h6 text-center">{{ title }}</div>
  </q-card-section>
  <q-list class="q-pa-md q-gutter-sm">
    <q-item
      v-for="q in questions"
      :key="q.id"
      :class="color"
      clickable
      @click="$emit('activate', q)"
    >
      <q-item-section avatar>
        <q-icon :name="getIcon(q)" />
      </q-item-section>
      <!-- eslint-disable vue/no-v-html -->
      <q-item-section class="text-ellipsis">
        <div v-html="renderKatex(q.text)"></div>
      </q-item-section>
      <q-item-section
        v-if="type !== 'feedback' || q.options?.feedbackType !== 'text'"
        side
      >
        {{ type === "feedback" ? q.response : q.points }} / 5
      </q-item-section>
      <q-item-section v-else> {{ q.response }} </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { useFormatter } from "src/composables/iris";
const { renderKatex } = useFormatter();

defineEmits(["activate"]);

const props = defineProps({
  questions: { type: Array, default: () => [] },
  color: { type: String, default: "" },
  icon: { type: String, default: "task_alt" },
  title: { type: String, default: "" },
  type: { type: String, default: "quiz" },
});

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
const getIcon = (question) => {
  if (props.type !== "feedback") {
    return props.icon;
  }
  const feedbackType = question.options?.feedbackType;

  return Array.isArray(icons[feedbackType])
    ? icons[feedbackType][question.response - 1]
    : icons[feedbackType];
};
</script>
