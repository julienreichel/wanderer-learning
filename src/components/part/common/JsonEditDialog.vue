<template>
  <q-dialog v-model="isOpen">
    <q-card style="max-width: none; width: 75%">
      <q-card-section>
        <div class="text-h6">{{ $t('generic.edit.json') }}</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="jsonText"
          type="textarea"
          autogrow
          rows="10"
          filled
          :rules="[validateJson]"
          lazy-rules
        />
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
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  json: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['input', 'save']);

const isOpen = defineModel();

const jsonText = ref(props.json);
watch(() => props.json, (value) => {
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
  if (validateJson(jsonText.value) === true) {
    emit('save', jsonText.value);
    closeDialog();
  }
}
</script>
