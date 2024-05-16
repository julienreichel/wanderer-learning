<template>
  <q-page class="q-pa-sm q-gutter-sm">
    <q-list bordered separator>
      <q-item
        v-for="report in reports"
        :key="report.id"
        :to="{ name: 'LectureView', params: { id: report.step?.lecture.id } }"
      >
        <q-item-section>
          <q-item-label
            >{{ report.step?.lecture.title }} /
            {{ report.step?.title }}</q-item-label
          >
          <q-item-label caption>{{ report.createdAt }}</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-badge
            :label="report.totalTime"
          />
          <div>
            <q-icon
              v-for="(reporting, index) in report.reportings"
              :key="index"
              :name="Boolean(reporting.responses) ? 'help_center' : 'article'"
              :color="
                reporting.responses
                  ? reporting.responses[0].valid
                    ? 'secondary'
                    : 'warning'
                  : 'primary'
              "
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';

import { useIris } from 'src/composables/iris';
const { t } = useIris();
const { stepReporting: reportingService, lectureStep: lectureStepService } =
  inject('services');

const { updateBreadcrumbs } = inject('breadcrumbs');
updateBreadcrumbs([{ label: t('reporting.list') }]);
const userAttributes = inject('userAttributes');
const {username, userId} = userAttributes.value;
const reports = ref([]);
onMounted(async () => {
  // format in the tables
  const data = await reportingService.list({userId, username});
  reports.value = data.items;

  reports.value.forEach(async (report) => {
    report.createdAt = new Date(report.createdAt).toLocaleString();
    const totalTime = report.reportings.reduce(
      (acc, val) => acc + val.time,
      0
    );
    if (totalTime < 60) {
      report.totalTime = totalTime + ' sec';
    } else {
      report.totalTime = Math.round(totalTime / 60) + ' min';
    }
    const quizzes = report.reportings.filter(({ responses }) =>
      Boolean(responses)
    );

    report.totalQuiz = quizzes.length;

    report.step = await lectureStepService.get(report.lectureStepID);
  });
});
</script>
