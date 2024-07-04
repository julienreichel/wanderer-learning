<template>
  <q-page class="q-pa-md q-gutter-sm">
    <concept-list flat bordered :concepts="concepts"/>
    <q-card v-if="userAttributes.isTeacher">
      <q-card-section>
        <q-input
          outlined
          v-model="newTitle"
          :label="$t('concept.form.add')"
          @keydown.enter="addConcept()"
        >
        </q-input>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn size="sm" icon="add" @click="addConcept()" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import ConceptList from "src/components/concept/ConceptList.vue";
import { ref, onMounted, inject } from "vue";

import { useIris } from "src/composables/iris";
const { t, locale, $q } = useIris();
const { concept: conceptService } = inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
updateBreadcrumbs([{ label: t("concept.list") }]);
const userAttributes = inject("userAttributes");

const concepts = ref([]);
onMounted(async () => {
  const data = await conceptService.list({ locale: locale.value });
  concepts.value = data;
});


let newTitle = ref();
const checkDuplicate = (title, id) => {
  const duplicate = concepts.value.find(
    (concept) => concept.title === title && concept.id !== id,
  );
  if (duplicate) {
    $q.notify({
      color: "negative",
      icon: "warning",
      message: t("concept.form.duplicate"),
    });
    return true;
  }
  return false;
};
const addConcept = async () => {
  if (!newTitle.value) {
    return;
  }
  if (checkDuplicate(newTitle.value)) {
    return;
  }

  const concept = await conceptService.create({
    title: newTitle.value,
  });
  concepts.value.push(concept);
  newTitle.value = "";
};
</script>
