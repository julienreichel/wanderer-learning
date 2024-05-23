<template>
  <div class="col-1">
    <q-card
      v-if="showPrevious"
      class="row justify-center items-center full-height"
      clickable
      @click="stepChange(step - 1)"
      flat
    >
      <q-icon name="chevron_left" size="xl" />
    </q-card>
    <q-card
      v-else-if="hasNext"
      class="row justify-center items-center full-height"
      clickable
      @click="stepChange(step + 1)"
      flat
    >
      <q-icon name="chevron_right" size="xl" />
    </q-card>
    <q-card
      v-else-if="hasAnsweredAllQuizzes"
      class="row justify-center items-center full-height"
      clickable
      @click="finish()"
      flat
    >
      <q-icon name="check" size="xl" />
    </q-card>
  </div>
</template>

<script setup>
const props = defineProps({
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
