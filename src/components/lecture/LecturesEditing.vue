<template>
  <q-card v-for="(lecture, index) in lecturesArray" :key="index">
    <q-card-section horizontal clickable @click="editMode ? editLecture(lecture) : viewLecture(lecture)">
      <q-card-section class="col q-pa-sm">
        <q-card-section class="q-pa-sm">
          <div class="text-h5">{{ lecture.title }}</div>
        </q-card-section>
        <concept-display class="q-pa-sm" :concepts="lecture.concepts" />
      </q-card-section>
      <q-card-section class="q-pa-sm">
        <user-lecture-reporting
          v-if="lecture.stepsSummary"
          :steps-summary="lecture.stepsSummary"
          :steps="lecture.steps"
          />
        <step-reporting v-if="lecture.ratings" :ratings="lecture.ratings"></step-reporting>
      </q-card-section>
    </q-card-section>
    <q-card-section ref="graphSection" v-if="lecture.timestampDistribution">
      <usage-histogram
        :serie="lecture.timestampDistribution"
        :width="600"
        :height="150"
      />
    </q-card-section>
    <q-card-actions v-if="canEdit(lecture) && allowDelete">
      <q-space />
      <q-btn size="sm" icon="delete" @click="deleteLecture(lecture)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { inject, computed, ref } from 'vue';
import ConceptDisplay from 'src/components/concept/ConceptDisplay.vue';
import UserLectureReporting from 'src/components/reporting/UserLectureReporting.vue';
import UsageHistogram from 'src/components/charts/UsageHistogram.vue';
import StepReporting from 'src/components/reporting/StepReporting.vue';

import { useIris } from 'src/composables/iris';
const { t, $q, router, canEdit } = useIris();
const { lecture: lectureService } = inject('services');

const lectures = defineModel();
const props = defineProps({
  allowDelete: Boolean,
  editMode: Boolean,
});

const graphSection = ref([]);
const graphWidth = computed(() => {
  if (!graphSection.value || !graphSection.value[0]) return 300;
  return graphSection.value[0].$el.getBoundingClientRect().width - 32;
});

const lecturesArray = computed(() => {
  if (!lectures.value) return [];
  return lectures.value.map((item) => item.lecture || item);
});

const deleteLecture = async (lecture) => {
  $q.dialog({
    title: t('generic.form.confirm_delete_title'),
    message: t('lecture.form.confirm_delete_step'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await lectureService.delete(lecture);
    lectures.value = lectures.value.filter(({ id }) => id !== lecture.id);
  });
};

const editLecture = (lecture) => {
  router.push({ name: 'LectureEdit', params: { id: lecture.id } });
};

const viewLecture = (lecture) => {
  router.push({ name: 'LectureView', params: { id: lecture.id } });
};
</script>
