<template>
  <q-card-section v-if="concepts" class="q-gutter-sm truncate-chip-labels">
    <q-chip
      square
      clickable
      @click.stop="openConcept(item)"
      color="primary"
      text-color="white"
      v-for="(item, index) in concepts"
      :key="index"
    >
      <div class="ellipsis">
        {{ getConcept(item).title }}
        <q-tooltip>
          <div class="text-weight-bold">{{ getConcept(item).title }}</div>
          <div v-html="getConcept(item).description"></div>
        </q-tooltip>
      </div>
    </q-chip>
  </q-card-section>
</template>

<script setup>
import { useIris } from "src/composables/iris";
const { router } = useIris();

const props = defineProps({
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
