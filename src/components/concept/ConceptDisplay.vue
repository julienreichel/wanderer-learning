<template>
  <q-card-section v-if="concepts" class="q-gutter-sm truncate-chip-labels">
    <q-chip
      v-for="(item, index) in concepts"
      :key="index"
      square
      clickable
      color="primary"
      text-color="white"
      @click.stop="openConcept(item)"
    >
      <div class="ellipsis">
        {{ getConcept(item).title }}
      </div>
    </q-chip>
  </q-card-section>
</template>

<script setup>
import { useIris } from "src/composables/iris";
const { router } = useIris();

defineProps({
  concepts: {
    type: Array,
    default: null,
  },
});

const getConcept = (item) => {
  return item.concept || item;
};

const openConcept = (item) => {
  router.push({ name: "ConceptView", params: { id: getConcept(item).id } });
};
</script>

<style lang="sass" scoped>
.truncate-chip-labels > .q-chip
  max-width: 200px
</style>
