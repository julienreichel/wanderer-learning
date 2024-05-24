<template>
  <q-card>
    <q-card-section class="q-pt-sm q-px-sm q-col-gutter-sm row">
      <NavigationCard
        :step="step"
        :showPrevious="hasPrevious"
        @stepChange="step = $event"
      />
      <PartCard
        v-for="part in previewParts"
        :key="part.id"
        :part="part"
        :step="parts.indexOf(part)"
        :maxStep="parts.length"
        :active="step == parts.indexOf(part)"
        :editing="true"
        @stepChange="step = $event"
        @remove="remove"
        @moveLeft="moveUp"
        @moveRight="moveRight"
        @edit="editJson"
      />
      <NavigationCard
        :step="step"
        :hasNext="hasNext"
        @stepChange="step = $event"
        @finish="finish"
      />
    </q-card-section>
    <q-card-actions>
      <q-space />
      <q-btn
        size="sm"
        icon="add"
        icon-right="library_books"
        @click="add('text')"
      />
      <q-btn
        size="sm"
        icon-right="collections"
        icon="add"
        @click="add('img')"
      />
      <q-btn
        size="sm"
        icon-right="video_library"
        icon="add"
        @click="add('video')"
      />
      <q-btn size="sm" icon-right="quiz" icon="add" @click="add('quiz')" />
      <q-btn size="sm" icon="check" @click="finish()" />
    </q-card-actions>
  </q-card>
  <questions-editing
    v-if="part && part.type === 'quiz'"
    v-model="part.questions"
  />
  <part-editing v-else-if="part" v-model="part" />
  <json-edit-dialog
    v-model="jsonDialog"
    :json="editJsonPart"
    @save="updateJsonPart"
  />
</template>

<script setup>
import NavigationCard from "../common/NavigationCard.vue";
import PartCard from "../common/PartCard.vue";
import PartEditing from "./PartEditing.vue";
import QuestionsEditing from "./QuestionsEditing.vue";
import JsonEditDialog from "../common/JsonEditDialog.vue";

import { ref, computed, watch, nextTick, inject } from "vue";

import { useIris } from "src/composables/iris";
const { uid, router, $q, t } = useIris();

import { useChecks } from "src/composables/checks";
const { checkPart } = useChecks();

const parts = defineModel();
const props = defineProps({
  stepIdx: { type: String },
});
const emit = defineEmits(["finished"]);

const step = ref(Number(props.stepIdx) || 0);
const part = computed(() => parts.value[step.value]);
const previewParts = computed(() => {
  const toDisplay = 5;
  if (parts.value.length < toDisplay) return parts.value;

  const start = Math.min(
    Math.max(0, step.value - Math.floor(toDisplay / 2)),
    parts.value.length - toDisplay,
  );
  return parts.value.slice(start, start + toDisplay);
});

watch(step, (newStep) => {
  router.push({ params: { stepIdx: newStep.toString() } });
});

const hasPrevious = computed(() => step.value > 0);
const hasNext = computed(() => step.value < parts.value.length - 1);

const remove = (index) => {
  return parts.value.splice(index, 1)[0];
};
const moveUp = (index) => {
  const part = remove(index);
  parts.value.splice(index - 1, 0, part);
};
const moveRight = (index) => {
  const part = remove(index);
  parts.value.splice(index + 1, 0, part);
};

const editJsonStep = ref(null);
const jsonDialog = ref(false);
const editJsonPart = ref("");
const editJson = (index, json = null) => {
  editJsonStep.value = index;
  jsonDialog.value = true;

  if (!json) {
    let data = { ...parts.value[index] };
    if (data.type === "img") {
      delete data.text;
      delete data.questions;
      delete data.url;
    }
    json = JSON.stringify(data, null, 2);
  }

  editJsonPart.value = json;
};
const updateJsonPart = async (json) => {
  let data = JSON.parse(json);


  // check that when type = quiz, there is at least one question
  // check that each question has at least one answer
  try {
    data = await checkPart(data);

    parts.value[editJsonStep.value] = data;
  } catch (error) {
    $q.notify({
      color: "negative",
      icon: "warning",
      message: error.message,
    });
    nextTick(() => {
      editJson(editJsonStep.value, json);
    });
  }
};

const add = (type) => {
  const { src, text } = {
    text: { text: "Sample text" },
    img: { src: "" },
    video: { src: "https://www.youtube.com/embed/k3_tw44QsZQ?rel=0" },
  }[type] || { text: "" };

  if (!parts.value) {
    parts.value = [];
  }
  let questions = [];
  if (!props.allowMultipleQuestions && type === "quiz") {
    questions = [
      {
        id: uid(),
        type: "radio",
        answers: [],
        options: [],
      },
    ];
  }
  const newStep = {
    type,
    src,
    text,
    questions,
    options: [],
  };

  parts.value.splice(step.value + 1, 0, newStep);
  step.value = step.value + 1;
};

const finish = (success = true) => {
  emit("finished", { success });
};
</script>
