<template>
  <q-dialog v-model="isOpen">
    <q-card style="max-width: none; width: 75%">
      <q-card-section>
        <div class="text-h6">{{ $t("generic.edit.json") }}</div>
      </q-card-section>

      <q-card-section>
        <json-editor v-model="jsonText" v-bind="editorOptions"></json-editor>
      </q-card-section>

      <q-card-actions>
        <q-space />
        <q-btn flat :label="$t('generic.form.cancel')" @click="closeDialog" />
        <q-btn
          :label="$t('generic.form.apply')"
          color="primary"
          :disable="!changed"
          @click="saveJson"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import JsonEditor from "json-editor-vue";

import { useIris } from "src/composables/iris";
const { $q, t } = useIris();

import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  json: {
    type: String,
    default: "",
  },
  data: {
    type: [Object, Array],
    default: null,
  },
  emitJson: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "parts",
  },
});

const emit = defineEmits(["input", "save"]);

const changed = ref(false);
const editorOptions = ref({
  mode: "text", // or 'tree', 'view'
  mainMenuBar: false,
  navigationBar: false,
  statusBar: false,
  onChange: () => {
    changed.value = true;
  },
});

const isOpen = defineModel({ type: Boolean, default: false });

const jsonText = ref(props.data || (props.json && JSON.parse(props.json)));
watch(
  () => props.json,
  (value) => {
    jsonText.value = JSON.parse(value);
  },
);
watch(
  () => props.data,
  (value) => {
    jsonText.value = value;
  },
);

function validateJson(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    $q.notify({
      color: "negative",
      icon: "warning",
      message: t("generic.edit.invalid_json"),
    });
  }
}

function closeDialog() {
  isOpen.value = false;
}

function saveJson() {
  const data = validateJson(jsonText.value);
  if (data) {
    if (!props.emitJson) {
      emit("save", data);
    } else {
      emit("save", jsonText.value);
    }
    closeDialog();
  }
}
</script>
