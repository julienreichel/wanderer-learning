<template>
  <div class="col-1">
    <q-card
      v-if="showPrevious"
      class="row justify-center items-center full-height"
      clickable
      @click="stepChange(step - 1)"
      flat
    >
      <q-btn flat round icon="chevron_left" size="lg" />
    </q-card>
    <q-card
      v-else-if="hasNext"
      class="row justify-center items-center full-height"
      clickable
      @click="stepChange(step + 1)"
      flat
    >
      <q-btn flat round icon="chevron_right" size="lg" />
    </q-card>
    <q-card
      v-else-if="hasAnsweredAllQuizzes"
      class="row justify-center items-center full-height"
      clickable
      @click="finish()"
      flat
    >
      <q-btn flat round icon="check" size="lg" />
    </q-card>
  </div>
</template>

<script setup>
defineProps({
  showPrevious: { type: Boolean, default: false },
  step: { type: Number, required: true },
  hasNext: { type: Boolean, default: false },
  hasAnsweredAllQuizzes: { type: Boolean, default: false },
});

const emit = defineEmits(["stepChange", "finish"]);

const stepChange = (newStep) => {
  emit("stepChange", newStep);
};

const finish = () => {
  emit("finish");
};
</script>
