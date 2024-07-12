<template>
  <q-item dense class="q-pa-none">
    <q-item-section avatar>
      <q-avatar>
        <q-icon size="sm" :name="icon" :color="color" />
      </q-avatar>
    </q-item-section>

    <q-item-section>
      <q-item-label class="text">{{ question.text }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from "vue";

import { useIris } from "src/composables/iris";
import { experimental } from "aws-cdk-lib/aws-cloudfront";
const { getIconFromQuestion } = useIris();

const props = defineProps({
  question: { type: Object, required: true },
});

const emit = defineEmits(["selected"]);

const icon = computed(() => getIconFromQuestion(props.question));
const color = computed(() => {
  const level = props.question.level || "beginner";
  const colors = {
    novice: "lime",
    beginner: "light-green",
    intermediate: "green",
    advanced: "teal",
    expert: "purple",
  };
  return colors[level] || "grey";
});
</script>
