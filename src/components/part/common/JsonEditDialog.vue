<template>
  <q-dialog v-model="isOpen">
    <q-card style="max-width: none; width: 75%">
      <q-card-section>
        <div class="text-h6">{{ $t('generic.edit.json') }}</div>
      </q-card-section>

      <q-card-section>
        <json-editor
          v-model="jsonText"
          v-bind="editorOptions"
        ></json-editor>
      </q-card-section>

      <q-card-actions>
        <q-space />
        <q-btn flat :label="$t('generic.form.cancel')" @click="closeDialog" />
        <q-btn :label="$t('generic.form.apply')" color="primary" @click="saveJson" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import JsonEditor from 'json-editor-vue';

import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  json: {
    type: String,
  },
  data: {
    type: [Object, Array],
  },
  emitJson: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['input', 'save']);

const editorOptions = ref({
  mode: 'tree', // or 'tree', 'view'
  mainMenuBar: true,
  navigationBar: true,
  statusBar: true,
});

const isOpen = defineModel();

const jsonText = ref(props.data || props.json && JSON.parse(props.json));
watch(() => props.json, (value) => {
  jsonText.value = JSON.parse(value);
});
watch(() => props.data, (value) => {
  jsonText.value = value;
});


function validateJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    $q.notify({
      color: 'negative',
      icon: 'warning',
      message: t('generic.edit.invalid_json'),
    });
  }
}

function closeDialog() {
  isOpen.value = false;
}

function saveJson() {
  if (!props.emitJson) {
    emit('save', jsonText.value);
    closeDialog();
    return;
  }

  const json = JSON.stringify(jsonText.value);
  if (validateJson(json) === true) {
    emit('save', json);
    closeDialog();
  }
}
</script>
