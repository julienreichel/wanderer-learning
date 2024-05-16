<template>
  <q-page class="q-pa-md q-col-gutter-sm row">
    <div v-for="course in courses" :key="course.id" class="col-4">
      <q-card class="full-height" clickable @click="viewCourse(course)">
        <q-card-section >
          <div class="text-h5">{{ course.title }}</div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12">
    <q-card v-if="userAttributes.isTeacher" >
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
    </div>
  </q-page>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';

import { useIris } from 'src/composables/iris';
const { t, $q, router } = useIris();
const { course: courseService } = inject('services');

const { updateBreadcrumbs } = inject('breadcrumbs');
updateBreadcrumbs([{ label: t('course.list') }]);

const userAttributes = inject('userAttributes');

const courses = ref([]);
onMounted(async () => {
  const data = await courseService.list();
  courses.value = data.items;
});

const viewCourse = (course) => {
  router.push({ name: 'CourseView', params: { id: course.id } });
};

const newTitle = ref();
const addCourse = async () => {
  const course = await courseService.create({
    title: newTitle.value,
  });

  router.push({ name: 'CourseEdit', params: { id: course.id } });
};
</script>
