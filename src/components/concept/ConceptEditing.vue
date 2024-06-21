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
    <q-select
      outlined
      dense
      v-model="newConceptTitle"
      use-input
      hide-selected
      fill-input
      clearable
      input-debounce="500"
      :label="$t('concept.form.add')"
      :options="options"
      @filter="filterFn"
      @filter-abort="abortFilterFn"
      @new-value="createConcept"
      @update:model-value="selectConcept"
    >
    </q-select>
  </q-card-section>
</template>

<script setup>
import { ref, inject } from "vue";

const { concept: conceptService, lectureConcept: lectureConceptService } =
  inject("services");

const lecture = defineModel();

const showRemove = ref([]);
const newConceptTitle = ref();
const options = ref(null);
let conceptList = null;
const filterFn = async (val, update, abort) => {
  if (!conceptList) {
    conceptList = await conceptService.list();
  }
  options.value = conceptList
    .filter(
      (concept) =>
        concept.title.toLowerCase().includes(val.toLowerCase()) &&
        lecture.value.concepts.find(({ id }) => id === concept.id) ===
          undefined,
    )
    .map((concept) => ({
      label: concept.title,
      value: concept.id,
    }))
    .slice(0, 5);
  update();
};
const abortFilterFn = () => {
  // Nothing to do here
};

const addConcept = async (concept) => {
  if (lecture.value.concepts.find(({ id }) => id === concept.id)) {
    return;
  }

  const item = await lectureConceptService.create({
    lectureId: lecture.value.id,
    conceptId: concept.id,
  });
  lecture.value.concepts.push(item);

  newConceptTitle.value = null;
};

const selectConcept = (val) => {
  addConcept({ id: val.value });
};

const createConcept = async (val, done) => {
  let concept = null;
  concept = conceptList.find(({ title }) => title === val);
  if (!concept) {
    concept = await conceptService.create({
      title: val,
    });
    conceptList.push(concept);
  }
  await addConcept(concept);

  done();
};

const removeConcept = async (item) => {
  lecture.value.concepts = lecture.value.concepts.filter(
    ({ id }) => id !== item.id,
  );

  await lectureConceptService.delete(item);
};
</script>
