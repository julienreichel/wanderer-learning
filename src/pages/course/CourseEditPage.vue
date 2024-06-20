<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-card horisontal>
      <q-card-section class="q-gutter-sm">
        <q-input
          outlined
          v-model="course.title"
          :label="$t('course.form.title')"
          @blur="saveCourse()"
          @keydown.enter="saveCourse()"
        />
        <rich-text-editing
          v-model="course.description"
          mode="simple"
        ></rich-text-editing>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn size="sm" icon="delete" @click.stop="deleteCourse(course)" />
      </q-card-actions>
    </q-card>
    <lectures-editing
      v-model="course.lectures"
      :allow-delete="true"
      :edit-mode="true"
    />
    <q-card>
      <q-card-section>
        <q-input
          outlined
          v-model="newTitle"
          :label="$t('lecture.form.add')"
          @keydown.enter="addLecture()"
        >
        </q-input>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn size="sm" icon="add" @click="addLecture()" />
        <q-btn
          size="sm"
          icon="switch_access_shortcut_add"
          @click="openWizard()"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, inject, computed, onMounted, onBeforeUnmount } from "vue";
import LecturesEditing from "src/components/lecture/LecturesEditing.vue";
import RichTextEditing from "src/components/part/common/RichTextEditing.vue";

import { useIris } from "src/composables/iris";
const { t, $q, router, canEdit } = useIris();
const {
  course: courseService,
  lecture: lectureService,
  stepReporting: reportingService,
} = inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");

const props = defineProps({
  id: String,
});

const course = ref({
  title: null,
  lectures: [],
});
const initalCourse = ref(null);

onMounted(async () => {
  if (props.id) {
    const data = await courseService.get(props.id);
    course.value = data;
    initalCourse.value = { ...data };

    updateBreadcrumbs([
      { label: t("course.list"), to: { name: "CourseList" } },
      { label: data.title, id: data.id, view: "CourseView" },
    ]);

    if (!canEdit(data)) {
      router.push({ name: "CourseView", params: { id: data.id } });
    }
  }
  // load stats for for each lecture
  course.value.lectures.forEach(async (lecture) => {
    const reports = await reportingService.list({ lectureId: lecture.id });
    if (reports.length) {
      lecture.userTimeReportings =
        reportingService.computeUserTimeReportings(reports);

      lecture.ratings = reportingService.computeRatings(reports);
    }
  });
});

onBeforeUnmount(async () => {
  saveCourse();
});

const dirty = computed(() => {
  return initalCourse.value.title !== course.value.title || initalCourse.value.description !== course.value.description;
});

const saveCourse = async () => {
  if (!dirty.value) return;

  try {
    if (props.id) {
      course.value = await courseService.update(course.value);
    } else {
      course.value = await courseService.create(course.value);
    }
    initalCourse.value = { ...course.value };
  } catch (err) {
    console.log(err);
    $q.notify({
      color: "warning",
      icon: "cloud_done",
      message: err.errors[0]?.message || t("error.form.save_error"),
    });
  }
};

const deleteCourse = async (course) => {
  $q.dialog({
    title: t("generic.form.confirm_delete_title"),
    message: t("course.form.confirm_delete_course"),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await courseService.delete(course);
    router.push({ name: "CourseList" });
  });
};

const newTitle = ref();
const addLecture = async () => {
  const lecture = await lectureService.create({
    title: newTitle.value,
    courseId: course.value.id,
    order: "" + Date.now(),
  });
  course.value.lectures.push(lecture);

  newTitle.value = null;
};

const openWizard = () => {
  router.push({ name: "LectureWizard", params: { id: course.value.id } });
};
</script>
