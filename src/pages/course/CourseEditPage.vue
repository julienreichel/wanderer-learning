<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-card>
      <q-card-section class="q-gutter-sm">
        <div class="row">
          <q-input
            class="col-8"
            outlined
            v-model="course.title"
            :label="$t('course.form.title')"
            @blur="saveCourse()"
            @keydown.enter="saveCourse()"
          />
          <q-space/>
          <q-toggle
            v-model="course.private"
            color="negative"
            :label="course.private ? $t('course.form.private') : $t('course.form.public')"
          />
        </div>
        <div class="row">
          <rich-text-editing
            class="col-8"
            v-model="course.description"
            :placeholder="$t('course.form.description')"
            mode="simple"
          ></rich-text-editing>
          <q-card flat v-if="course.url && !uploadingFile" class="q-pa-none col-4">
            <q-img class="col" fit="cover" :ratio="16 / 9" :src="course.url">
              <div class="absolute-bottom text-subtitle2 text-right q-gutter-sm" style="background: none; padding: 8px !important">
                <q-btn size="sm" padding="xs sm" color="white" text-color="black" icon="edit" @click="uploadingFile = true" />
                <q-btn size="sm" padding="xs sm" color="white" text-color="black" icon="delete" @click="removeImage()" />
              </div>
            </q-img>
          </q-card>
          <file-uploader
            class="col-4"
            flat
            bordered
            v-else
            @uploaded="uploaded"
          />
        </div>
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
import RichTextEditing from "src/components/common/RichTextEditing.vue";
import FileUploader from "src/components/common/FileUploader.vue";

import { useIris } from "src/composables/iris";
const { t, locale, $q, router, canEdit } = useIris();
const {
  course: courseService,
  lecture: lectureService,
  stepReporting: reportingService,
  storage: storageService,
} = inject("services");

const { updateBreadcrumbs } = inject("breadcrumbs");

const props = defineProps({
  id: String,
});

const course = ref({
  title: null,
  lectures: [],
  description: "",
});
const initalCourse = ref(null);

onMounted(async () => {
  if (props.id) {
    const data = await courseService.get(props.id);
    data.description = data.description || "";
    // for backward compatibility
    data.locale = data.locale || locale.value;
    data.private = data.private || false;

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

const dirty = computed(
  () =>
    initalCourse.value.title !== course.value.title ||
    initalCourse.value.description !== course.value.description ||
    initalCourse.value.src !== course.value.src ||
    initalCourse.value.private !== course.value.private
);

const uploadingFile = ref(false);
const removeImage = () => {
  if (course.value.url && !course.value.url.startsWith("http")) {
    storageService.removeImg(course.value.url);
  }
  course.value.url = null;
  course.value.src = null;
};
const uploaded = async (files) => {
  const file = files[0];
  removeImage();

  course.value.src = file?.path;
  course.value.url = file?.url;
};

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
    locale: course.value.locale || locale.value,
  });
  course.value.lectures.push(lecture);

  newTitle.value = null;
};

const openWizard = () => {
  router.push({ name: "LectureWizard", params: { id: course.value.id } });
};
</script>
