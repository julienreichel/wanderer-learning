<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-card>
      <q-card-section>
        <q-chip v-if="concept.title" square color="primary" text-color="white">
          {{ concept.title }}
        </q-chip>
        <div class="q-pa-sm" v-html="concept.description"></div>
      </q-card-section>
    </q-card>
    <lectures-editing v-model="concept.lectures" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, inject } from "vue";
import LecturesEditing from "src/components/lecture/LecturesEditing.vue";

import { useIris } from "src/composables/iris";
const { t, $q, router } = useIris();
const { concept: conceptService, stepReporting: reportingService } =
  inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
const userAttributes = inject("userAttributes");
const { username, userId } = userAttributes.value;

const props = defineProps({
  id: String,
});

const concept = ref({
  title: null,
  lectures: [],
});

const loadConcept = async (id) => {
  if (!id) return;

  const data = await conceptService.get(id);
  concept.value = data;

  updateBreadcrumbs([
    { label: t("concept.list"), to: { name: "ConceptList" } },
    { label: data.title, id: data.id },
  ]);

  // load stats for the user for each lecture
  concept.value.lectures.forEach(async ({ lecture }) => {
    const reports = await reportingService.list({
      lectureId: lecture.id,
      username,
      userId,
    });
    if (reports.length) {
      lecture.stepsSummary = reportingService.getLastReports(reports);
    }
  });
};

onMounted(async () => {
  await loadConcept(props.id);
});

watch(
  () => props.id,
  async (id) => {
    await loadConcept(id);
  },
);
</script>
