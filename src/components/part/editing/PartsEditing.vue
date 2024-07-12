<template>
  <q-card>
    <q-card-section class="q-pt-sm q-px-sm q-col-gutter-sm row">
      <NavigationCard
        :step="step"
        :showPrevious="hasPrevious"
        @stepChange="step = $event"
      />
      <draggable
        v-model="previewParts"
        item-key="id"
        ghost-class="ghost"
        @change="moved"
        class="q-pt-sm q-px-sm q-col-gutter-sm row col"
      >
        <template #item="{element}" >
          <PartCard
            :part="element"
            :step="parts.indexOf(element)"
            :maxStep="parts.length"
            :active="step == parts.indexOf(element)"
            :editing="true"
            @stepChange="step = $event"
            @remove="remove"
            @edit="editJsonStep"
          />
        </template>
      </draggable>
      <NavigationCard
        :step="step"
        :hasNext="hasNext"
        @stepChange="step = $event"
        @finish="finish"
      />
    </q-card-section>
    <q-card-actions>
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
      <q-btn
        size="sm"
        icon-right="folder_copy"
        icon="add"
        @click="add('iframe')"
      />
      <q-btn size="sm" icon-right="quiz" icon="add" @click="add('quiz')" />
      <q-space />
      <q-btn
        v-if="isAdmin"
        size="sm"
        icon="data_object"
        @click="editJsonPart()"
      />
      <q-btn size="sm" icon="file_upload" @click="openFileUpload = true" />
      <q-btn size="sm" icon="check" @click="finish()" />
    </q-card-actions>
  </q-card>
  <questions-editing
    v-if="part && part.type === 'quiz'"
    v-model="part"
    :parts="parts"
  />
  <part-editing v-else-if="part" v-model="part" :lectureId="lectureId" />
  <json-edit-dialog
    v-model="jsonDialog"
    :data="jsonToEdit"
    @save="updateFromJson"
  />
  <q-dialog v-model="openFileUpload">
    <q-card>
      <file-uploader
        @uploaded="uploaded"
        :multiple="true"
        convertPdfToImages
        accept=".jpg, image/*, application/pdf"
        style="min-height: 300px"
        :title="$t('step.form.file_upload')"
        :prefix="lectureId"
      />
    </q-card>
  </q-dialog>
</template>

<script setup>
import draggable from 'vuedraggable';
import NavigationCard from "../common/NavigationCard.vue";
import PartCard from "../common/PartCard.vue";
import PartEditing from "./PartEditing.vue";
import QuestionsEditing from "./QuestionsEditing.vue";
import JsonEditDialog from "../common/JsonEditDialog.vue";
import FileUploader from "../../common/FileUploader.vue";

import { ref, computed, watch, nextTick, inject } from "vue";

import { useIris } from "src/composables/iris";
const { uid, router, $q, t } = useIris();

import { useChecks } from "src/composables/checks";
const { checkPart, preparePart } = useChecks();

const { storage: storageService } = inject("services");

const userAttributes = inject("userAttributes");
const { isAdmin } = userAttributes.value;

const parts = defineModel();
const props = defineProps({
  stepIdx: { type: String },
  lectureId: { type: String, required: true },
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
  const part = parts.value.splice(index, 1)[0];
  // need to delete image if any
  if (part.src && !part.src.startsWith("http")) {
    storageService.removeImg(part.src);
  }
  part.url = null;
  part.src = null;
  return;
};

const moved = (event) => {
  let { newIndex, oldIndex } = event.moved;
  const oldElement = previewParts.value[oldIndex];
  const oldRealIndex = parts.value.indexOf(oldElement);

  const newElement = previewParts.value[newIndex];
  const newRealIndex = parts.value.indexOf(newElement);

  const [movedPart] = parts.value.splice(oldRealIndex, 1);
  parts.value.splice(newRealIndex, 0, movedPart);
};

const jsonEditStep = ref(null);
const jsonDialog = ref(false);
const jsonToEdit = ref({});
const editJsonStep = (index, json = null) => {
  jsonEditStep.value = index;
  jsonDialog.value = true;

  if (!json) {
    json = preparePart(parts.value[index]);
  }

  jsonToEdit.value = json;
};

const editJsonPart = (json = null) => {
  jsonEditStep.value = null;
  jsonDialog.value = true;

  if (!json) {
    json = parts.value.map((part) => preparePart(part));
  }

  jsonToEdit.value = json;
};

const updateFromJson = async (json) => {
  let data = json;

  try {
    if (jsonEditStep.value === null) {
      const promises = data.map(async (part) => {
        return await checkPart(part);
      });

      parts.value = await Promise.all(promises);
      return;
    }

    data = await checkPart(data);
    parts.value[jsonEditStep.value] = data;
  } catch (error) {
    $q.notify({
      color: "negative",
      icon: "warning",
      message: error.message,
    });
    nextTick(() => {
      if (jsonEditStep.value === null) {
        editJsonPart(json);
      } else {
        editJsonStep(jsonEditStep.value, json);
      }
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
        options: {},
      },
    ];
  }
  const newStep = {
    type,
    src,
    text,
    questions,
    options: {},
  };
  const newStepPos = Math.min(Number(step.value) + 1, parts.value.length);
  parts.value.splice(newStepPos, 0, newStep);
  step.value = newStepPos;
};

const openFileUpload = ref(false);
const uploaded = (files) => {
  const newParts = files.map((file) => ({
    type: "img",
    text: file.description || file.name.replace(/\.[^\.]+$/, ""),
    src: file.path,
    url: file.url,
  }));
  const newStepPos = Math.min(Number(step.value) + 1, parts.value.length);
  parts.value.splice(newStepPos, 0, ...newParts);
  openFileUpload.value = false;
};
const finish = (success = true) => {
  emit("finished", { success });
};
</script>

<style scoped>
.ghost {
  opacity: 0;
}
</style>
