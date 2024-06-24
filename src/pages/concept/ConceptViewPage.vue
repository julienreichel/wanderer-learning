<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-card>
      <q-card-section v-if="editing" class="q-gutter-sm">
        <q-input
          outlined
          v-model="concept.title"
          :label="$t('concept.form.title')"
        />
        <rich-text-editing
          v-model="concept.description"
          mode="simple"
        ></rich-text-editing>
      </q-card-section>
      <q-card-section v-else>
        <q-chip v-if="concept.title" square color="primary" text-color="white">
          {{ concept.title }}
        </q-chip>
        <div class="q-pa-sm" v-html="concept.description"></div>
      </q-card-section>
      <q-card-actions v-if="editing">
        <q-space />
        <q-btn size="sm" icon="done" @click="updateConcept(concept)" />
        <q-btn size="sm" icon="clear" @click="toogleEditing()" />
      </q-card-actions>
      <q-card-actions
        v-else-if="userAttributes.isTeacher || userAttributes.isAdmin"
      >
        <q-space />
        <q-btn size="sm" icon="edit" @click="toogleEditing()" />
        <q-btn
          size="sm"
          v-if="userAttributes.isAdmin"
          icon="delete"
          @click="deleteConcept(concept)"
        />
      </q-card-actions>
    </q-card>
    <lectures-editing v-model="concept.lectures" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, inject } from "vue";
import LecturesEditing from "src/components/lecture/LecturesEditing.vue";
import RichTextEditing from "src/components/common/RichTextEditing.vue";

import { useIris } from "src/composables/iris";
const { t, locale, $q, router } = useIris();
const { concept: conceptService, stepReporting: reportingService } =
  inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
const userAttributes = inject("userAttributes");
const { username, userId } = userAttributes.value;

const props = defineProps({
  id: String,
});

const showAllLocaleContent = inject("showAllLocaleContent");

const concept = ref({
  title: null,
  lectures: [],
});

let lastCall = null;
const loadConcept = async (id) => {
  lastCall = new Date();
  const thisCall = lastCall;
  if (!id) return;
  let options = {};
  if (!showAllLocaleContent.value) {
    options.locale = locale.value;
  }
  const data = await conceptService.get(id, options);
  // for some reason there are empty lectures in the data
  data.lectures = data.lectures?.filter(({ lecture }) => Boolean(lecture?.id));
  if (thisCall !== lastCall) return;
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
  () => props.id + showAllLocaleContent.value + locale.value,
  async () => {
    await loadConcept(props.id);
  },
);

const deleteConcept = async (concept) => {
  $q.dialog({
    title: t("generic.form.confirm_delete_title"),
    message: t("concept.form.confirm_delete_concept"),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await conceptService.delete(concept);
    router.push({ name: "ConceptList" });
  });
};

const editing = ref(false);
let savedConcept = null;
const toogleEditing = () => {
  if (editing.value) {
    concept.value.title = savedConcept.title;
    concept.value.description = savedConcept.description;
  } else {
    savedConcept = { ...concept.value };
  }
  editing.value = !editing.value;
};
const updateConcept = async (concept) => {
  editing.value = null;

  await conceptService.update(concept);

  $q.notify({
    color: "info",
    icon: "cloud_done",
    message: t("generic.form.saved"),
  });
};
</script>
