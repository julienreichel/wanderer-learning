<template>
  <q-select
    dense
    v-model="newConceptTitle"
    use-input
    hide-selected
    fill-input
    options-cover
    clearable
    input-debounce="500"
    :options="options"
    @filter="filterFn"
    @filter-abort="abortFilterFn"
    @new-value="createConcept"
  >
  </q-select>
</template>

<script setup>
import { ref, inject, defineEmits, onMounted, watch, nextTick } from "vue";

const { concept: conceptService } = inject("services");

const conceptId = defineModel();

const newConceptTitle = ref();

const mapIdtoTitle = async () => {
  if (!conceptList) {
    conceptList = await conceptService.list();
  }
  if (!conceptId.value) {
    newConceptTitle.value = null;
  } else {
    newConceptTitle.value = conceptList?.find(
      ({ id }) => id === conceptId.value,
    )?.title;
  }
};
watch(newConceptTitle, async (input) => {
  if (!input) {
    return;
  }
  conceptId.value = input.value;
  emit("select", input.value);
  if (props.canCreate) {
    await nextTick();
    newConceptTitle.value = undefined;
  }
});

watch(conceptId, async () => mapIdtoTitle);

onMounted(async () => {
  await mapIdtoTitle();
});

const props = defineProps({
  canCreate: Boolean,
  existingConcepts: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["select", "create"]);

const options = ref(null);
let conceptList = null;
const filterFn = async (val, update) => {
  if (!conceptList) {
    conceptList = await conceptService.list();
  }
  options.value = conceptList
    .filter(
      (item) =>
        item.title.toLowerCase().includes(val.toLowerCase()) &&
        props.existingConcepts.find(
          ({ id, concept }) => id === item.id || concept?.id === item.id,
        ) === undefined,
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

const createConcept = async (input, done) => {
  if (!props.canCreate) {
    done();
    return;
  }

  let concept = null;
  concept = conceptList.find(({ title }) => title === input);
  if (!concept) {
    emit("create", input);
    done(input);
  } else {
    emit("select", input);
    conceptId.value = concept.id;
    done();
  }
  await nextTick();
  newConceptTitle.value = undefined;
};
</script>
