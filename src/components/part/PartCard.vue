<template>
  <div class="col-2">
    <q-card
      class="full-height"
      clickable
      @click="stepChange(parts.indexOf(part))"
      :class="{ 'custom-highlight': step == parts.indexOf(part) }"
      flat
      bordered
    >
      <q-card-section v-if="part.type === 'text'">
        <q-item-label v-for="idx in 4" :key="idx">
          <q-skeleton type="text" animation="none" />
        </q-item-label>
      </q-card-section>
      <q-img
        v-if="part.type === 'img'"
        :ratio="16 / 9"
        fit="scale-down"
        :src="part.url"
      />
      <q-card-section v-if="part.type === 'quiz'" class="row justify-center items-center full-height">
        <q-icon v-if="!hasQuizAnswer(part)" name="assignment" size="xl" />
        <q-icon v-else name="assignment_turned_in" size="xl" />
      </q-card-section>
      <q-card-section v-if="part.type === 'video'" class="row justify-center items-center full-height">
        <q-icon  name="play_circle" size="xl" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
const props = defineProps({
  part: { type: Object, required: true },
  step: { type: Number, required: true },
  parts: { type: Array, required: true },
  reportings: { type: Array, required: true },
});

const emit = defineEmits(["stepChange"]);

const stepChange = (newStep) => {
  emit("stepChange", newStep);
};

const hasQuizAnswer = (part) => {
  const idx = props.parts.indexOf(part);
  return part.type === "quiz" && props.reportings[idx]?.responses;
};

</script>

<style type="text/scss" scoped>
.custom-highlight {
  border-color: var(--q-primary);
}
</style>
