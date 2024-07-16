<template>
  <q-card-section class="q-pa-none">
    <q-card-section class="q-pa-none text-right">
      <roti-reporting v-if="ratings?.roti" :roti="ratings.roti" />
    </q-card-section>
    <q-card-section class="q-pa-none text-right">
      <difficulty-reporting
        v-if="ratings?.difficulty"
        :difficulty="ratings?.difficulty"
      />
    </q-card-section>
    <q-card-section class="q-pa-none text-right">
      <rating-reporting v-if="ratings?.stars" :stars="ratings?.stars" />
    </q-card-section>
  </q-card-section>
</template>

<script setup>
import RatingReporting from "./RatingReporting.vue";
import RotiReporting from "./ROTIReporting.vue";
import DifficultyReporting from "./DifficultyReporting.vue";

defineProps({
  ratings: { type: Object },
});
</script>
