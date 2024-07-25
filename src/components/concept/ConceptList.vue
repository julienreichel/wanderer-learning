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
    <template #top>
      <q-toggle
        v-model="visibleColumns"
        val="description"
        :label="$t('concept.description')"
        class="q-pa-none"
      />
      <q-space />
      <q-input
        v-model="filter"
        outlined
        dense
        debounce="300"
        placeholder="Search"
      >
        <template #:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template #item="props">
      <div
        v-if="visibleColumns.includes('description')"
        class="q-pa-xs col-xs-12 col-sm-6 col-md-4"
      >
        <q-card
          style="height: 120px"
          class="q-card-hover"
          @click="viewConcept(props.row)"
        >
          <q-card-section>
            <q-chip square color="primary" text-color="white">
              {{ props.row.title }}
            </q-chip>
            <!-- eslint-disable vue/no-v-html -->
            <div
              class="q-pa-sm"
              style="overflow: hidden; height: 50px"
              v-html="props.row.description"
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
import { ref } from "vue";

import { useIris } from "src/composables/iris";
const { router, t } = useIris();

defineProps({
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

<style>
.q-table__top {
  padding: 4px 4px;
}
</style>
