<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-card>
      <q-card-section>
        <q-input
          outlined
          v-model="lecture.title"
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
      <q-card-actions>
        <q-space />
        <q-btn square size="sm" icon="straight" @click="finished()" />
        <q-btn
          v-if="canEdit(lecture)"
          size="sm"
          icon="delete"
          @click="deleteLecture(lecture)"
        />
      </q-card-actions>
    </q-card>
    <q-card
      v-for="(step, index) in lecture.steps"
      :key="index"
      clickable
      @click="canEdit(step) ? editStep(step) : viewStep(step)"
    >
      <q-card-section horizontal>
        <q-card-section class="col q-pa-sm">
          <q-card-section>
            <div class="text-h5">{{ step.title }}</div>
          </q-card-section>
          <q-card-section ref="graphSection" v-if="step.timestampDistribution">
            <usage-histogram
              :serie="step.timestampDistribution"
              :width="600"
              :height="150"
            />
          </q-card-section>
        </q-card-section>
        <q-card-section class="q-pa-sm text-right">
          <!-- Stats -->
          <time-distribution
            v-if="step.userTimeReportings"
            :serie="step.userTimeReportings"
          />
          <step-reporting :ratings="step.ratings"></step-reporting>
        </q-card-section>
      </q-card-section>
      <q-card-actions v-if="canEdit(step)">
        <q-space />
        <q-btn
          v-if="index > 0"
          size="sm"
          icon="arrow_upward"
          @click.stop="moveUp(index)"
        />
        <q-btn
          v-if="index < lecture.steps.length - 1"
          size="sm"
          icon="arrow_downward"
          @click.stop="moveDown(index)"
        />
        <q-btn size="sm" icon="delete" @click.stop="deleteStep(step)" />
      </q-card-actions>
    </q-card>
    <q-card>
      <q-card-section>
        <q-input
          outlined
          dense
          v-model="newTitle"
          :label="$t('step.form.add.step')"
          @keydown.enter="addStep()"
        >
        </q-input>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn size="sm" icon="add" @click="addStep()" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import ConceptEditing from "src/components/concept/ConceptEditing.vue";
import UsageHistogram from "src/components/charts/UsageHistogram.vue";
import TimeDistribution from "src/components/charts/TimeDistribution.vue";
import StepReporting from "src/components/reporting/StepReporting.vue";
import RichTextEditing from "src/components/common/RichTextEditing.vue";

import { ref, inject, computed, onMounted } from "vue";

import { useIris } from "src/composables/iris";
const { t, $q, router, canEdit } = useIris();
const {
  lecture: lectureService,
  lectureStep: lectureStepService,
  stepReporting: reportingService,
} = inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");

const props = defineProps({
  id: String,
});

const lecture = ref({
  title: null,
  steps: [],
  description: ""
});
const initalLecture = ref(null);

onMounted(async () => {
  if (!props.id) return;

  const data = await lectureService.get(props.id);
  data.description = data.description || "";
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

const dirty = computed(() => initalLecture.value.title !== lecture.value.title || initalLecture.value.description !== lecture.value.description);

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

const moveUp = async (index) => {
  const steps = lecture.value.steps;
  const previousOrder = index > 1 ? Number(steps[index - 2].order) : 0;
  const nextOrder = index > 0 ? Number(steps[index - 1].order) : 0;
  const step = steps[index];
  step.order = "" + (previousOrder + nextOrder) / 2;
  await lectureStepService.update(step);

  lecture.value.steps = lectureStepService.sort(steps);
};
const moveDown = async (index) => {
  const steps = lecture.value.steps;
  const step = steps[index];
  if (index >= steps.length - 2) {
    step.order = "" + Date.now();
  } else {
    const previousOrder = Number(steps[index + 1].order);
    const nextOrder = Number(steps[index + 2].order);
    step.order = "" + (previousOrder + nextOrder) / 2;
  }
  await lectureStepService.update(step);

  lecture.value.steps = lectureStepService.sort(steps);
};

const deleteStep = async (step) => {
  $q.dialog({
    title: t("generic.form.confirm_delete_title"),
    message: t("step.form.confirm_delete_step"),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
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
const contentType = ref("step");
const optionType = [
  { value: "quiz", slot: "quiz" },
  {
    value: "step",
    slot: "step",
  },
];
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
</script>

<style lang="sass" scoped>
.truncate-chip-labels > .q-chip
  max-width: 200px
</style>
