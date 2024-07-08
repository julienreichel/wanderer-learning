<template>
  <q-page class="">
    <div v-if="course.id" class="q-pa-none q-pt-sm q-gutter-sm">
      <q-card>
        <q-card-section horizontal>
          <q-card-section>
            <div class="text-h5">{{ course.title }}</div>
            <div class="q-pt-sm" v-html="course.description"></div>
          </q-card-section>
          <q-img
            v-if="course.src"
            :src="course.url"
            :ratio="16 / 9"
            class="q-ma-sm col-4"
          >
          </q-img>
        </q-card-section>
        <q-card-actions class="q-px-none q-py-lg">
          <q-btn square size="md" icon="chevron_left" @click="finished()" />
        </q-card-actions>
      </q-card>
      <lectures-editing v-model="course.lectures" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import LecturesEditing from "src/components/lecture/LecturesEditing.vue";

import { useIris } from "src/composables/iris";
const { t, $q, router, canEdit } = useIris();
const { course: courseService, stepReporting: reportingService } =
  inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
const userAttributes = inject("userAttributes");
const { username, userId } = userAttributes.value;

const props = defineProps({
  id: String,
});

const course = ref({});
onMounted(async () => {
  const data = await courseService.get(props.id);
  course.value = data;

  updateBreadcrumbs([
    {
      label: data.title,
      id: data.id,
      edit: canEdit(data) ? "CourseEdit" : null,
    },
  ]);

  // load stats for the user for each lecture
  course.value.lectures.forEach(async (lecture) => {
    const reports = await reportingService.list({
      lectureId: lecture.id,
      username,
      userId,
    });
    if (reports.length) {
      lecture.stepsSummary = reportingService.getLastReports(reports);
    }
  });
});

const finished = () => {
  router.push({ name: "CourseList" });
};
</script>
