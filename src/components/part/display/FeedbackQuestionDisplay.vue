<template>
  <q-card-section>
    <q-input
      v-if="feedbackType === 'text'"
      clearable
      v-model="newResponse"
    >
    </q-input>
    <div v-else-if="feedbackType === 'roti'">
      <q-icon
        v-for="index in 5"
        :key="index"
        size="xl"
        :name="icons[feedbackType][index - 1]"
        color="primary"
        :style="{
          opacity: index === newResponse || index === mouseOver ? 1 : 0.4,
          scale: index === mouseOver ? 1.3 : 1,
        }"
        @mouseover="mouseOver = index"
        @mouseout="mouseOver = false"
        @click="newResponse = index"
      >
        <q-tooltip>{{ question.answers?.[index - 1].text }}</q-tooltip>
      </q-icon>
    </div>
    <q-rating
      v-else
      v-model="newResponse"
      size="xl"
      color="primary"
      :icon="icons[feedbackType]"
      :icon-selected="iconsSelected[feedbackType]"
      :color-selected="colorSelected[feedbackType]"
    >
      <template #tip-1 v-if="question.answers?.[0]">
        <q-tooltip>{{ question.answers[0].text }}</q-tooltip>
      </template>
      <template #tip-2 v-if="question.answers?.[1]">
        <q-tooltip>{{ question.answers[1].text }}</q-tooltip>
      </template>
      <template #tip-3 v-if="question.answers?.[2]">
        <q-tooltip>{{ question.answers[2].text }}</q-tooltip>
      </template>
      <template #tip-4 v-if="question.answers?.[3]">
        <q-tooltip>{{ question.answers[3].text }}</q-tooltip>
      </template>
      <template #tip-5 v-if="question.answers?.[4]">
        <q-tooltip>{{ question.answers[4].text }}</q-tooltip>
      </template>
    </q-rating>
  </q-card-section>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const newResponse = defineModel();

const props = defineProps({
  question: { type: Object, required: true }
});

const emit = defineEmits(["feedback"]);

watch(newResponse, (value) => {
  emit("feedback", value);
});

const feedbackType = computed(
  () =>
    props.question.options?.find((option) => option.name === "feedbackType")
      ?.value,
);

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
const iconsSelected = {
  stars: "star",
};
const colorSelected = {
  difficulty: ["lime", "light-green", "green", "teal", "purple"],
};

const mouseOver = ref(false);
</script>
