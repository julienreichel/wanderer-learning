<template>
  <q-table
    grid
    hide-header
    :rows="concepts"
    :columns="columns"
    :pagination="initialPagination"
    :rows-per-page-options="[6, 12, 24, 0]"
    :visible-columns="visibleColumns"
    row-key="title"
    :filter="filter"
  >
    <template v-slot:top>
      <q-toggle
        v-model="visibleColumns"
        val="description"
        :label="$t('concept.description')"
        class="q-pa-none"
      />
      <q-space />
      <q-input
        outlined
        dense
        debounce="300"
        v-model="filter"
        placeholder="Search"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template v-slot:item="props">
      <div
        class="q-pa-xs col-xs-12 col-sm-6 col-md-4"
        v-if="visibleColumns.includes('description')"
      >
        <q-card
          style="height: 120px"
          @click="viewConcept(props.row)"
          class="q-card-hover"
        >
          <q-card-section>
            <q-chip square color="primary" text-color="white">
              {{ props.row.title }}
            </q-chip>
            <div
              class="q-pa-sm"
              v-html="props.row.description"
              style="overflow: hidden; height: 50px"
            ></div>
          </q-card-section>
        </q-card>
      </div>
      <div v-else>
        <q-chip
          square
          color="primary"
          text-color="white"
          clickable
          @click="viewConcept(props.row)"
        >
          {{ props.row.title }}
        </q-chip>
      </div>
    </template>
  </q-table>
</template>

<script setup>
import { defineProps, ref } from "vue";

import { useIris } from "src/composables/iris";
const { router, t } = useIris();

const props = defineProps({
  concepts: {
    type: Array,
    required: true,
  },
});

let filter = ref("");
let visibleColumns = ref(["title", "description"]);
let initialPagination = ref({
  sortBy: "title",
  descending: false,
  rowsPerPage: 12,
});
const columns = [
  {
    name: "id",
    field: "id",
  },
  {
    name: "title",
    label: t("concept.title"),
    align: "left",
    required: true,
    sortable: true,
    field: "title",
  },
  {
    name: "description",
    label: t("concept.description"),
    align: "left",
    field: "description",
  },
];

const viewConcept = (concept) => {
  router.push({ name: "ConceptView", params: { id: concept.id } });
};
</script>

<style scoped>
.q-table__top {
  padding: 12px 0px;
}
</style>
