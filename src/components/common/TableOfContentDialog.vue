<template>
  <q-dialog v-model="showDialog">
    <q-card style="width: 60%; min-width: 350px; max-width: 800px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ lecture.title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="showDialog = false" />
      </q-card-section>

      <table-of-content :lecture="lecture" />
    </q-card>
  </q-dialog>
</template>

<script setup>
import TableOfContent from "./TableOfContent.vue";
import { ref, watch, defineProps, defineEmits, computed } from "vue";

// Define the props
const props = defineProps({
  lecture: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
});

// Define the emits
const emit = defineEmits(["update:modelValue"]);

// Local state for the dialog visibility
const showDialog = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal) => {
    showDialog.value = newVal;
  },
);

watch(showDialog, (newVal) => {
  emit("update:modelValue", newVal);
});

</script>

<style>
/* Add any custom styles here */
</style>
