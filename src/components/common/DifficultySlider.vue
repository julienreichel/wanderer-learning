<template>
  <q-item>
    <q-item-section avatar>
      <q-icon name="speed" />
    </q-item-section>
    <q-item-section>
      <q-slider
        snap
        label
        switch-label-side
        v-model="value"
        :label-value="$t('wizard.questions.difficulties.' + value)"
        :min="1"
        :max="5"
      />
    </q-item-section>
  </q-item>
</template>

<script setup>
import { defineEmits, watch, ref } from "vue";

const emit = defineEmits(["level", "difficulty"]);

const props = defineProps({
  level: String,
  difficulty: Number,
});

const textvalues = ["novice", "beginner", "intermediate", "advanced", "expert"];
const value = ref(props.difficulty || textvalues.indexOf(props.level) + 1 || undefined);
watch(() => props.level, (newVal) => {
  value.value = textvalues.indexOf(newVal) + 1;
});
watch(() => props.difficulty, (newVal) => {
  value.value = newVal;
});

watch(value, (newVal) => {
  emit("level", textvalues[newVal - 1]);
  emit("difficulty",newVal);
});
</script>
