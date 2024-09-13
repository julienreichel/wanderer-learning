<template>
  <q-card>
    <q-card-section class="q-pt-sm q-px-sm q-col-gutter-sm row">
      <NavigationCard
        :step="step"
        :show-previous="hasPrevious"
        @step-change="step = $event"
      />
      <draggable
        :list="previewParts"
        item-key="id"
        ghost-class="ghost"
        class="q-pt-sm q-px-sm q-col-gutter-sm row col"
        @change="moved"
      >
        <template #item="{ element }">
          <PartCard
            :part="element"
            :step="parts.indexOf(element)"
            :max-step="parts.length"
            :active="step == parts.indexOf(element)"
            :editing="true"
            @step-change="step = $event"
            @remove="remove"
            @edit="editJsonStep"
          />
        </template>
        <template #footer>
          <div
            v-for="(fillerCard, index) in fillerCards"
            :key="index"
            class="col"
          ></div>
        </template>
      </draggable>

      <NavigationCard
        :step="step"
        :has-next="hasNext"
        @step-change="step = $event"
        @finish="finish"
      />
    </q-card-section>
    <q-card-actions>
      <q-btn-dropdown
        size="sm"
        padding="xs sm"
        menu-anchor="bottom start"
        menu-self="top start"
        dropdown-icon="add"
        outlined
        dense
      >
        <q-list>
          <q-item
            v-for="(item, idx) in options"
            :key="idx"
            clickable
            @click="add(item.value)"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>

            <q-item-section>
              {{ item.label }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-space />
      <q-btn
        v-if="isAdmin"
        size="sm"
        icon="text_snippet"
        @click="openMarkdownDialog = true"
      /><q-btn
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
  <part-editing v-else-if="part" v-model="part" :parts="parts" :index="step" :lecture-id="lectureId" />
  <json-edit-dialog
    v-model="jsonDialog"
    :data="jsonToEdit"
    @save="updateFromJson"
  />
  <q-dialog v-model="openFileUpload">
    <q-card>
      <file-uploader
        :multiple="true"
        convert-pdf-to-images
        accept=".jpg, image/*, application/pdf"
        style="min-height: 300px"
        :title="$t('step.form.file_upload')"
        :prefix="lectureId"
        @uploaded="uploaded"
      />
    </q-card>
  </q-dialog>
  <markdown-dialog
    v-if="parts?.length"
    v-model="openMarkdownDialog"
    :sections="parts"
  />
</template>

<script setup>
import draggable from "vuedraggable";
import NavigationCard from "../common/NavigationCard.vue";
import PartCard from "../common/PartCard.vue";
import PartEditing from "./PartEditing.vue";
import QuestionsEditing from "./QuestionsEditing.vue";
import JsonEditDialog from "src/components/common/JsonEditDialog.vue";
import FileUploader from "src/components/common/FileUploader.vue";
import MarkdownDialog from "src/components/common/MarkdownDialog.vue";

import { ref, computed, watch, nextTick, inject } from "vue";

import { useIris } from "src/composables/iris";
const { uid, router, $q, t } = useIris();

import { useChecks } from "src/composables/checks";
const { checkPart, preparePart } = useChecks();

const { storage: storageService } = inject("services");

const userAttributes = inject("userAttributes");
const { isAdmin } = userAttributes.value;

const parts = defineModel({ type: Array });
const props = defineProps({
  stepIdx: { type: String, default: "0" },
  lectureId: { type: String, required: true },
});

const emit = defineEmits(["finished"]);

const step = ref(Number(props.stepIdx) || 0);
const part = computed(() => parts.value[step.value]);
const previewStart = computed(() => {
  const toDisplay = 5;
  if (parts.value.length < toDisplay) return 0;

  const start = Math.min(
    Math.max(0, step.value - Math.floor(toDisplay / 2)),
    parts.value.length - toDisplay,
  );
  return start;
});
const previewParts = computed(() => {
  const toDisplay = 5;
  if (parts.value.length < toDisplay) return parts.value;

  return parts.value.slice(previewStart.value, previewStart.value + toDisplay);
});
const fillerCards = computed(() => {
  return Array.from({ length: 5 - previewParts.value.length });
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
  const offset = previewStart.value;
  const [movedPart] = parts.value.splice(offset + oldIndex, 1);
  parts.value.splice(offset + newIndex, 0, movedPart);
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

const options = [
  { label: t("parts.form.add.text"), value: "text", icon: "article" },
  { label: t("parts.form.add.img"), value: "img", icon: "image" },
  { label: t("parts.form.add.drawing"), value: "drawing", icon: "edit_square" },
  { label: t("parts.form.add.graph"), value: "graph", icon: "assessment" },
  { label: t("parts.form.add.video"), value: "video", icon: "slideshow" },
  { label: t("parts.form.add.iframe"), value: "iframe", icon: "preview" },
  { label: t("parts.form.add.quiz"), value: "quiz", icon: "help_center" },
];

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
    text: file.description || file.name.replace(/\.[^.]+$/, ""),
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

let openMarkdownDialog = ref(false);
</script>

<style scoped>
.ghost {
  opacity: 0;
}
</style>
