<template>
  <q-card-section
    v-if="lecture?.concepts"
    class="q-gutter-sm truncate-chip-labels"
  >
    <q-chip
      :removable="showRemove[index]"
      square
      color="primary"
      text-color="white"
      @remove="removeConcept(item)"
      @mouseleave="showRemove[index] = false"
      @mouseenter="showRemove[index] = true"
      v-for="(item, index) in lecture.concepts"
      :key="index"
    >
      <div class="ellipsis">
        {{ item.concept?.title }}
        <q-tooltip>
          <div class="text-weight-bold">{{ item.concept?.title }}</div>
          <div v-html="item.concept?.description"></div>
        </q-tooltip>
      </div>
    </q-chip>
  </q-card-section>
  <q-card-section>
    <concept-selecting outlined :label="$t('concept.form.add')" v-model="newConceptId" can-create @create="createConcept" :existingConcepts="lecture.concepts"/>
  </q-card-section>
</template>

<script setup>
import ConceptSelecting from "src/components/concept/ConceptSelecting.vue";

import { ref, inject, watch } from "vue";

const { concept: conceptService, lectureConcept: lectureConceptService } =
  inject("services");

const lecture = defineModel();

const showRemove = ref([]);
const newConceptId = ref();
watch( newConceptId, (id) => {
  if (id) {
    console.log("add concept", id)
    addConcept({ id });
  }
});

const addConcept = async (concept) => {
  newConceptId.value = null;

  if (lecture.value.concepts.find(({ concept: {id} }) => id === concept.id)) {
    return;
  }

  const item = await lectureConceptService.create({
    lectureId: lecture.value.id,
    conceptId: concept.id,
  });
  lecture.value.concepts.push(item);


};
const createConcept = async (val) => {
  const concept = await conceptService.create({
    title: val,
  });
  await addConcept(concept);
};

const removeConcept = async (item) => {
  lecture.value.concepts = lecture.value.concepts.filter(
    ({ id }) => id !== item.id,
  );

  await lectureConceptService.delete(item);
};
</script>
