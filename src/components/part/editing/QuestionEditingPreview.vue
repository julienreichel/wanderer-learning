<template>
  <q-item dense class="q-pa-none">
    <q-item-section avatar>
      <q-avatar>
        <q-icon size="sm" :name="icon" />
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
const { getIconFromQuestion } = useIris();

const props = defineProps({
  question: { type: Object, required: true },
});

const emit = defineEmits(["selected"]);

const icon = computed(() => getIconFromQuestion(props.question));
</script>
