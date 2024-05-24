<template>
  <q-item clickable @click="$emit('selected')">
    <q-item-section avatar>
      <q-avatar>
        <q-icon size="md" :name="icon" />
      </q-avatar>
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-h5" >{{ question.text }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue';

import { useIris } from "src/composables/iris";
const { getIconFromType } = useIris();

const props = defineProps({
  question: { type: Object, required: true },
});

const emit = defineEmits(['selected']);

const icon = computed(() => getIconFromType(props.question.type));

</script>
