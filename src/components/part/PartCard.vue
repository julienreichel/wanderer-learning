<template>
  <div class="col-2">
    <q-card
      class="aspect-ratio-16-9"
      clickable
      @click="stepChange(step)"
      :class="{ 'custom-highlight': active }"
      flat
      bordered
    >
      <q-card-section v-if="part.type === 'text'">
        <q-item-label v-for="idx in 4" :key="idx">
          <q-skeleton type="text" animation="none" />
        </q-item-label>
      </q-card-section>
      <q-card-section v-if="part.type === 'img'" class="q-pa-none">
        <q-img :ratio="16 / 9" fit="scale-down" :src="part.url" />
      </q-card-section>
      <q-card-section
        v-if="part.type === 'quiz'"
        class="row justify-center items-center"
      >
        <q-icon v-if="!hasQuizAnswer" name="assignment" size="xl" />
        <q-icon v-else name="assignment_turned_in" size="xl" />
      </q-card-section>
      <q-card-section
        v-if="part.type === 'video'"
        class="row justify-center items-center"
      >
        <q-icon name="play_circle" size="xl" />
      </q-card-section>
      <q-card-actions v-if="editing" class="q-pa-xs">
        <q-btn
          v-if="step > 0"
          size="sm"
          icon="arrow_back"
          flat round
          @click.stop="$emit('moveLeft', step)"
        />
        <q-btn
          v-if="step + 1 < maxStep"
          size="sm"
          icon="arrow_forward"
          flat round
          @click.stop="$emit('moveRight', step)"
        />
        <q-space />
        <q-btn size="sm" icon="delete" flat round @click.stop="$emit('remove', step)" />

      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
const props = defineProps({
  part: { type: Object, required: true },
  hasQuizAnswer: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  step: { type: Number, required: true },
  maxStep: { type: Number, required: true },
  editing: { type: Boolean, default: false },
});

const emit = defineEmits(["stepChange", "remove", "moveLeft", "moveRight"]);

const stepChange = (newStep) => {
  emit("stepChange", newStep);
};
</script>

<style type="text/scss" scoped>
.custom-highlight {
  border-color: var(--q-primary);
}
.aspect-ratio-16-9 {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio (9/16 * 100) */
}

.aspect-ratio-16-9 > .q-card__section {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
