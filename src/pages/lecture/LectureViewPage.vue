<template>
  <q-page v-if="lecture?.id" class="q-pa-none q-pt-sm q-gutter-sm">
    <q-card>
      <q-card-section>
        <div class="text-h5">{{ lecture.title }}</div>
      </q-card-section>
      <concept-display :concepts="lecture.concepts" />
      <q-card-section>
        <div class="q-pt-sm" v-html="lecture.description"></div>
      </q-card-section>
      <q-card-actions class="q-px-none q-py-lg">
        <q-btn square size="md" icon="chevron_left" @click="finished()" />
      </q-card-actions>
    </q-card>
    <step-display
      v-for="(step, index) in lecture.steps"
      :key="index"
      :step="step"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import ConceptDisplay from "src/components/concept/ConceptDisplay.vue";
import StepDisplay from "src/components/step/StepDisplay.vue";

import { useIris } from "src/composables/iris";
const { t, $q, router, canEdit } = useIris();
const { lecture: lectureService, stepReporting: reportingService } =
  inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
const userAttributes = inject("userAttributes");
const { username, userId } = userAttributes.value;

const props = defineProps({
  id: String,
});

const lecture = ref({});
onMounted(async () => {
  const data = await lectureService.get(props.id);
  lecture.value = data;

  updateBreadcrumbs([
    {
      label: data.course.title,
      to: { name: "CourseView", params: { id: data.course.id } },
    },
    {
      label: data.title,
      id: data.id,
      edit: canEdit(data) ? "LectureEdit" : null,
    },
  ]);

  // load stats for the user for each step
  lecture.value.steps.forEach(async (step) => {
    const reports = await reportingService.list({
      lectureStepId: step.id,
      username,
      userId,
    });
    if (reports.length) {
      // keep only the most recent
      let report = reports.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )[0];
      const totalTime = report.reportings.reduce(
        (acc, val) => acc + val.time,
        0,
      );
      if (totalTime < 60) {
        report.totalTime = totalTime + " sec";
      } else {
        report.totalTime = Math.round(totalTime / 60) + " min";
      }
      step.reporting = report;
    }
  });
});

const finished = () => {
  router.push({ name: "CourseView", params: { id: lecture.value.course.id } });
};
</script>

<style lang="sass" scoped>
.truncate-chip-labels > .q-chip
  max-width: 200px
</style>
