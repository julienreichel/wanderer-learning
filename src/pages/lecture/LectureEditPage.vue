<template>
  <q-page class="q-pa-none q-pt-sm q-gutter-sm">
    <q-card>
      <q-card-section>
        <q-input
          v-model="lecture.title"
          outlined
          :label="$t('lecture.form.title')"
          @blur="saveLecture()"
          @keydown.enter="saveLecture()"
        />
      </q-card-section>
      <concept-editing v-model="lecture" />
      <q-card-section>
        <rich-text-editing
          v-model="lecture.description"
          :placeholder="$t('lecture.form.description')"
          mode="simple"
        />
      </q-card-section>
      <q-card-actions class="q-px-none q-py-lg">
        <q-btn square size="md" icon="chevron_left" @click="finished()" />
        <q-space />
        <q-btn
          v-if="isAdmin"
          size="md"
          icon="text_snippet"
          @click="markdownDialog = true"
        /><q-btn
          v-if="isAdmin"
          size="md"
          icon="data_object"
          @click="editJson()"
        />
        <q-btn
          v-if="canEdit(lecture)"
          size="md"
          icon="delete"
          @click="deleteLecture(lecture)"
        />
      </q-card-actions>
    </q-card>
    <draggable
      v-model="lecture.steps"
      item-key="id"
      ghost-class="ghost"
      @change="moved"
    >
      <template #item="{ element }">
        <q-card
          clickable
          class="q-mt-sm"
          @click="canEdit(element) ? editStep(element) : viewStep(element)"
        >
          <q-card-section horizontal>
            <q-card-section class="col q-pa-sm">
              <q-card-section>
                <div class="text-h5">{{ element.title }}</div>
              </q-card-section>
              <q-card-section
                v-if="element.timestampDistribution"
                ref="graphSection"
              >
                <usage-histogram
                  :serie="element.timestampDistribution"
                  :width="600"
                  :height="150"
                />
              </q-card-section>
            </q-card-section>
            <q-card-section class="q-pa-sm text-right">
              <!-- Stats -->
              <time-distribution
                v-if="element.userTimeReportings"
                :serie="element.userTimeReportings"
              />
              <step-reporting :ratings="element.ratings"></step-reporting>
            </q-card-section>
          </q-card-section>
          <q-card-actions v-if="canEdit(element)" class="q-px-none q-py-lg">
            <q-space />
            <q-btn size="md" icon="delete" @click.stop="deleteStep(element)" />
            <q-btn
              size="md"
              padding="sm 64px"
              icon="chevron_right"
              @click.stop="
                canEdit(element) ? editStep(element) : viewStep(element)
              "
            />
          </q-card-actions>
        </q-card>
      </template>
    </draggable>
    <q-card>
      <q-card-section>
        <q-input
          v-model="newTitle"
          outlined
          dense
          :label="$t('step.form.add.step')"
          @keydown.enter="addStep()"
        >
        </q-input>
      </q-card-section>
      <q-card-actions class="q-px-none q-py-lg">
        <q-space />
        <q-btn size="md" icon="add" @click="addStep()" />
      </q-card-actions>
    </q-card>
  </q-page>
  <json-edit-dialog
    v-model="jsonDialog"
    :data="jsonToEdit"
    @save="updateFromJson"
  />
  <markdown-view-dialog
    v-model="markdownDialog"
    :sections="
      lecture.steps
        .map((step) => [{ text: `<h2>${step.title}</h2>` }, ...step.parts])
        .flat()
    "
  />
</template>

<script setup>
import draggable from "vuedraggable";
import ConceptEditing from "src/components/concept/ConceptEditing.vue";
import UsageHistogram from "src/components/charts/UsageHistogram.vue";
import TimeDistribution from "src/components/charts/TimeDistribution.vue";
import StepReporting from "src/components/reporting/StepReporting.vue";
import RichTextEditing from "src/components/common/RichTextEditing.vue";
import JsonEditDialog from "src/components/common/JsonEditDialog.vue";
import MarkdownViewDialog from "src/components/common/MarkdownDialog.vue";
import { ref, inject, computed, onMounted, onBeforeUnmount } from "vue";

import { useIris } from "src/composables/iris";
const { t, locale, $q, router, canEdit } = useIris();
const {
  lecture: lectureService,
  lectureStep: lectureStepService,
  stepReporting: reportingService,
} = inject("services");

const userAttributes = inject("userAttributes");
const { isAdmin } = userAttributes.value;

const { updateBreadcrumbs } = inject("breadcrumbs");

const props = defineProps({
  id: { type: String, required: true },
});

const lecture = ref({
  title: null,
  steps: [],
  description: "",
});
const initalLecture = ref(null);

onMounted(async () => {
  if (!props.id) return;

  const data = await lectureService.get(props.id);
  data.description = data.description || "";
  // for backward compatibility
  data.locale = data.locale || locale.value;
  lecture.value = data;
  initalLecture.value = { ...data };

  updateBreadcrumbs([
    {
      label: data.course.title,
      to: { name: "CourseEdit", params: { id: data.course.id } },
    },
    { label: data.title, id: data.id, view: "LectureView" },
  ]);

  // load stats for each step
  lecture.value.steps.forEach(async (step) => {
    const reports = await reportingService.list({ lectureStepId: step.id });
    if (reports.length) {
      // keep only the most recent
      step.timestampDistribution =
        reportingService.computeTimestampDistribution(reports);
      step.userTimeReportings =
        reportingService.computeUserTimeReportings(reports);

      step.ratings = reportingService.computeRatings(reports);
    }
  });
});
onBeforeUnmount(async () => {
  saveLecture();
});

const dirty = computed(
  () =>
    initalLecture.value.title !== lecture.value.title ||
    initalLecture.value.description !== lecture.value.description,
);

const saveLecture = async () => {
  if (!dirty.value) return;

  try {
    if (props.id) {
      lecture.value = await lectureService.update(lecture.value);
    } else {
      lecture.value = await lectureService.create(lecture.value);
    }
    initalLecture.value = { ...lecture.value };
    $q.notify({
      color: "info",
      icon: "cloud_done",
      message: t("generic.form.saved"),
    });
  } catch (err) {
    console.log(err);
    $q.notify({
      color: "warning",
      icon: "cloud_done",
      message: err.errors[0]?.message || t("error.form.save_error"),
    });
  }
};

const moved = async (event) => {
  let { newIndex } = event.moved;
  const steps = lecture.value.steps;
  const step = steps[newIndex];
  if (newIndex === 0) {
    step.order = "" + Number(steps[1].order) / 2;
  } else if (newIndex === steps.length - 1) {
    step.order = "" + Date.now();
  } else {
    const previousOrder = Number(steps[newIndex - 1].order);
    const nextOrder = Number(steps[newIndex + 1].order);
    step.order = "" + (previousOrder + nextOrder) / 2;
  }

  await lectureStepService.update(step);

  lecture.value.steps = lectureService.sort(steps);
};

const deleteStep = async (step) => {
  await $q
    .dialog({
      title: t("generic.form.confirm_delete_title"),
      message: t("step.form.confirm_delete_step") + " " + step.title,
      cancel: true,
      persistent: true,
    })
    .onOk(async () => {
      await lectureStepService.delete(step);
      lecture.value.steps = lecture.value.steps.filter(
        ({ id }) => id !== step.id,
      );
    });
};
const viewStep = (step) => {
  router.push({ name: "LectureStepView", params: { id: step.id, stepIdx: 0 } });
};
const editStep = (step) => {
  router.push({ name: "LectureStepEdit", params: { id: step.id, stepIdx: 0 } });
};

const newTitle = ref();
const addStep = async () => {
  const step = await lectureStepService.create({
    title: newTitle.value,
    type: "step",
    lectureId: lecture.value.id,
    order: "" + Date.now(),
    parts: [],
  });

  lecture.value.steps.push(step);

  newTitle.value = null;
};

const deleteLecture = async (lecture) => {
  $q.dialog({
    title: t("generic.form.confirm_delete_title"),
    message: t("lecture.form.confirm_delete_lecture"),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await lectureService.delete(lecture);
    router.push({ name: "CourseEdit", params: { id: lecture.course.id } });
  });
};

const finished = () => {
  router.push({ name: "CourseEdit", params: { id: lecture.value.course.id } });
};

let jsonDialog = ref(false);
let jsonToEdit = ref({});
const editJson = () => {
  jsonDialog.value = true;

  const { title, description, steps } = lecture.value;

  const simplifiedSteps = steps.map(({ title, order, id, parts }) => ({
    title,
    order,
    id,
    parts,
  }));
  const simplifiedLecture = { title, description, steps: simplifiedSteps };

  jsonToEdit.value = simplifiedLecture;
};
const updateFromJson = async (json) => {
  const existingIds = lecture.value.steps.map(({ id }) => id);
  // check if we need to remove steps
  const stepIds = json.steps.map(({ id }) => id);
  const stepsToRemove = lecture.value.steps.filter(
    ({ id }) => !stepIds.includes(id),
  );
  for (const step of stepsToRemove) {
    console.log("removing step", step);
    await deleteStep(step);
  }

  // check if we need to add new steps:
  const stepsToAdd = json.steps.filter(({ id }) => !existingIds.includes(id));
  console.log("create step", stepsToAdd);
  for (const { title, parts, order } of stepsToAdd) {
    console.log("create step", stepsToAdd);
    const step = await lectureStepService.create({
      title: title || "<no title>",
      type: "step",
      lectureId: lecture.value.id,
      order: order || "" + Date.now(),
      parts: parts || [],
    });
    lecture.value.steps.push(step);
  }

  // update existing steps
  for (const { id, title, parts, order } of json.steps) {
    const step = lecture.value.steps.find(({ id: stepId }) => stepId === id);
    if (!step) {
      continue;
    }
    step.title = title;
    step.parts = parts;
    step.order = order;
    console.log("update step", step);
    await lectureStepService.update(step);
  }

  // update the lecture
  lecture.value.title = json.title;
  lecture.value.description = json.description;
  await saveLecture();

  jsonDialog.value = false;
};

let markdownDialog = ref(false);
</script>

<style lang="sass" scoped>
.truncate-chip-labels > .q-chip
  max-width: 200px

.ghost
  opacity: 0
</style>
