<template>
  <q-dialog v-model="popupVisible">
    <q-card style="max-width: none; width: 75%">
      <q-card-section>
        <q-input
              v-model="text"
              outlined
              type="textarea"
              rows="25"/>
      </q-card-section>
      <q-card-actions>
        <q-space/>
        <q-btn flat label="Close" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>

import { computed } from "vue";

import { useFormatter } from "src/composables/iris";
const { htmlToMarkdown } = useFormatter();

const props = defineProps({
  sections: {
    type: Array,
    default: () => [],
  }
});

const popupVisible = defineModel({ type: Boolean, default: false });

const text = computed(() => {
  return props.sections.filter(({ text }) => text?.trim().length ).map(({ text }) => htmlToMarkdown(text)).join("\n\n");
});

const closeDialog = () => {
  popupVisible.value = false;
};

</script>
