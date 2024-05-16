<template>
  <q-page v-if="lecture?.id" class="q-pa-md q-gutter-sm">
    <q-card>
      <q-card-section>
        <div class="text-h5">{{ lecture.title }}</div>
      </q-card-section>
      <concept-display :concepts="lecture.concepts.items" />
      <q-card-actions>
        <q-space />
        <q-btn square size="sm" icon="straight" @click="finished()" />
      </q-card-actions>
    </q-card>
    <q-card v-for="(step, index) in lecture.steps.items" :key="index">
      <q-card-section horizontal clickable @click="viewStep(step)">
        <q-card-section class="col">
          <q-card-section class="q-pa-sm q-pb-md">
            <div class="text-h5">{{ step.title }}</div>
          </q-card-section>
          <q-card-section class="q-pa-sm">
            <q-icon
              v-for="(part, index) in step.parts"
              :key="index"
              :name="{text:'article', img:'image', video: 'smart_display', quiz: 'help_center'}[part.type]"
              color="primary"
              clickable @click="viewStep(step, index)"
            />
          </q-card-section>
        </q-card-section>
        <q-card-section class="col-1">
          <q-card-section class="q-pa-sm">
            <q-icon v-if="step.reporting" name="check_box" color="positive" size="lg" right/>
          </q-card-section>
          <q-card-section class="q-pa-sm">
            <q-badge
              v-if="step.reporting"
              :label="step.reporting.totalTime"
            />
          </q-card-section>
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import ConceptDisplay from 'src/components/concept/ConceptDisplay.vue';

import { useIris } from 'src/composables/iris';
const { t, $q, router, canEdit } = useIris();
const {lecture: lectureService, stepReporting: reportingService } = inject('services');

const { updateBreadcrumbs } = inject('breadcrumbs');
const userAttributes = inject('userAttributes');
const {username, userId} = userAttributes.value;

const props = defineProps({
  id: String,
});

const lecture = ref({});
onMounted(async () => {
  const data = await lectureService.get(props.id);
  lecture.value = data;

  updateBreadcrumbs([
    { label: t('course.list'), to: { name: 'CourseList' } },
    {
      label: data.course.title,
      to: { name: 'CourseView', params: { id: data.course.id } },
    },
    { label: data.title, id: data.id, edit: canEdit(data) ? 'LectureEdit' : null},
  ]);

  // load stats for the user for each step
  lecture.value.steps.items.forEach(async (step) => {
    const reports = await reportingService.list({ lectureStepID: step.id, username, userId });
    if (reports.items.length){
      // keep only the most recent
      let report = reports.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      const totalTime = report.reportings.reduce(
        (acc, val) => acc + val.time,
        0
      );
      if (totalTime < 60) {
        report.totalTime = totalTime + ' sec';
      } else {
        report.totalTime = Math.round(totalTime / 60) + ' min';
      }
      step.reporting = report;
    }
  });
});

const viewStep = (step, index) => {
  if (step.type === 'quiz') {
    router.push({ name: 'QuizView', params: { id: step.id, stepIdx: index || 0} });
  }
  if (step.type === 'step') {
    router.push({ name: 'LectureStepView', params: { id: step.id, stepIdx: index || 0 } });
  }
};


const finished = () => {
  router.push({ name: 'CourseView', params: { id: lecture.value.course.id } });
};
</script>

<style lang="sass" scoped>
.truncate-chip-labels > .q-chip
  max-width: 200px
</style>
