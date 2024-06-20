<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-table
      flat
      bordered
      grid
      hide-header
      :rows="concepts"
      :columns="columns"
      :pagination="initialPagination"
      :visible-columns="visibleColumns"
      row-key="title"
      :filter="filter"
    >
      <template v-slot:top>
        <q-toggle
          v-model="visibleColumns"
          val="description"
          :label="$t('concept.description')"
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
          <q-card style="height: 120px" @click="viewConcept(props.row)">
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
import { ref, onMounted, inject } from "vue";

import { useIris } from "src/composables/iris";
const { t, $q, router } = useIris();
const { concept: conceptService } = inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");
updateBreadcrumbs([{ label: t("concept.list") }]);
const userAttributes = inject("userAttributes");

const concepts = ref([]);
onMounted(async () => {
  const data = await conceptService.list();
  concepts.value = data;
});
let filter = ref("");
let visibleColumns = ref(["title", "description"]);
let initialPagination = ref({
  sortBy: "title",
  descending: false,
  rowsPerPage: 10,
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
