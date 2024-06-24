<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-table
      flat
      bordered
      grid
      hide-header
      :rows="courses"
      :columns="columns"
      :pagination="initialPagination"
      :visible-columns="visibleColumns"
      row-key="id"
      :filter="filter"
    >
      <template v-slot:top>
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
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card @click="viewCourse(props.row)" class="q-card-hover">
            <q-img :src="getUrl(props.row)" :ratio="16 / 9">
              <q-icon v-if="props.row.private" class="absolute-top-right q-pa-sm" name="lock" color="negative" size="lg"/>
              <div class="absolute-bottom">
                <div class="text-h6">{{ props.row.title }}</div>
                <div
                  class="text-subtitle2"
                  style="overflow: hidden; height: 42px"
                  v-html="props.row.description"
                ></div>
              </div>
            </q-img>

            <q-card-actions>
              <q-space />
              <q-btn size="sm" icon="east" @click="viewCourse(props.row)" />
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-card v-if="userAttributes.isTeacher">
      <q-card-section>
        <q-input
          outlined
          v-model="newTitle"
          :label="$t('course.form.add')"
          @keydown.enter="addCourse()"
        >
        </q-input>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn size="sm" icon="add" @click="addCourse()" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, inject, onMounted, watch } from "vue";

import { useIris } from "src/composables/iris";
const { t, locale, router } = useIris();
const { course: courseService } = inject("services");

const showAllLocaleContent = inject("showAllLocaleContent");

const { updateBreadcrumbs } = inject("breadcrumbs");
updateBreadcrumbs([{ label: t("course.list") }]);

const userAttributes = inject("userAttributes");
const { username, userId, isAdmin } = userAttributes.value;

const courses = ref([]);
const loadCourses = async () => {
  let options = { userId, username, isAdmin };
  if (!showAllLocaleContent.value) {
    options.locale = locale.value;
  }
  const data = await courseService.list(options);
  courses.value = data;
};
onMounted(async () => {
  loadCourses();
});
watch(locale, loadCourses);
watch(showAllLocaleContent, loadCourses);

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
    name: "src",
    field: "src",
  },
  {
    name: "private",
    field: "private",
  },
  {
    name: "url",
    field: "url",
  },
  {
    name: "ratings",
    field: "ratings",
  },
  {
    name: "title",
    label: t("concept.title"),
    required: true,
    sortable: true,
    field: "title",
  },
  {
    name: "description",
    label: t("concept.description"),
    field: "description",
  },
];
const getUrl = (course) => {
  const idx = Math.floor(Math.random() * 7.9) + 1;
  return course?.url || `/covers/Course${idx}.jpg`;
};

const viewCourse = (course) => {
  router.push({ name: "CourseView", params: { id: course.id } });
};

const newTitle = ref();
const addCourse = async () => {
  const course = await courseService.create({
    title: newTitle.value,
    locale: locale.value,
  });

  router.push({ name: "CourseEdit", params: { id: course.id } });
};
</script>


