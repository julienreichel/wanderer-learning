<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar
        :class="{
          'bg-accent': userAttributes.isAdmin,
          'bg-secondary': userAttributes.isTeacher && !userAttributes.isAdmin,
        }"
      >
        <q-btn flat :label="$t('generic.app_name')" to="/" />
        <q-tabs inline-label shrink>
          <q-route-tab
            icon="school"
            :label="t('course.list')"
            :to="{ name: 'CourseList' }"
          />
          <q-route-tab
            icon="square_foot"
            :label="t('concept.list')"
            :to="{ name: 'ConceptList' }"
          />
          <q-route-tab
            icon="query_stats"
            :label="t('reporting.list')"
            :to="{ name: 'ReportingList' }"
          />
        </q-tabs>
        <q-space />

        <q-toggle
          v-if="enableEditing"
          v-model="editMode"
          color="purple"
          checked-icon="edit"
          unchecked-icon="visibility"
        />
        <q-breadcrumbs active-color="white">
          <q-breadcrumbs-el
            v-for="breadcrumb in breadcrumbs"
            :key="breadcrumb.label"
            :label="breadcrumb.label"
            :to="breadcrumb.to"
            :icon="breadcrumb.icon"
          />
        </q-breadcrumbs>
        <q-btn-dropdown stretch flat icon="person">
          <q-list>
            <q-item>
              <q-item-section>{{ userAttributes.name }}</q-item-section>
            </q-item>
            <q-item clickable @click="logOut">
              <q-item-section>{{ $t("generic.sign_out") }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>
    <q-page-container :style="{ maxWidth: '1280px', margin: '0 auto' }">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, provide, inject, watch } from "vue";

import { signOut } from "aws-amplify/auth";
import { useIris } from "src/composables/iris";
const { t, router } = useIris();

const userAttributes = inject("userAttributes");
watch(userAttributes, (value) => {
  console.log("userAttributes", value);
  if (!value.userId) {
    router.push({ name: "SignIn" });
  }
});

const breadcrumbs = ref([]);
const enableEditing = ref(false);
let viewRoute, editRoute, id, stepIdx, beforeNavigateAction;
function updateBreadcrumbs(data) {
  breadcrumbs.value = data;

  const routeInfo = data[data.length - 1];
  enableEditing.value = Boolean(routeInfo.view) || Boolean(routeInfo.edit);
  editMode.value = !Boolean(routeInfo.edit);
  viewRoute = routeInfo.view;
  editRoute = routeInfo.edit;
  id = routeInfo.id;
  stepIdx = routeInfo.stepIdx;
  beforeNavigateAction = routeInfo.beforeNavigate;
}
provide("breadcrumbs", {
  breadcrumbs,
  updateBreadcrumbs,
});

const editMode = ref(false);
watch(editMode, async (value) => {
  if (beforeNavigateAction && !(await beforeNavigateAction())) {
    return;
  }
  if (value) {
    router.push({ name: editRoute, params: { id } });
  } else {
    router.push({ name: viewRoute, params: { id, stepIdx } });
  }
});

const logOut = async () => {
  await signOut();
  router.push({ name: "SignIn" });
};
</script>

<style>
.q-breadcrumbs__el.flex.inline {
  display: inline-block; /* Ensure the element is treated as inline-block */
  max-width: 120px; /* Set the maximum width of the breadcrumb item */
  white-space: nowrap; /* Prevent the text from wrapping to a new line */
  overflow: hidden; /* Hide the overflowed text */
  text-overflow: ellipsis; /* Add ellipsis (...) to the overflowed text */
}
</style>
