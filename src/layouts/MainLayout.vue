<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar
        :class="{
          'bg-accent': userAttributes.isAdmin,
          'bg-secondary': userAttributes.isTeacher && !userAttributes.isAdmin,
        }"
      >
        <q-btn flat icon="menu" class="lt-md" @click="toggleLeftDrawer" />
        <q-btn flat :label="$t('generic.app_name')" to="/" class="gt-md" />
        <q-tabs inline-label shrink class="gt-sm">
          <q-route-tab
            v-for="link in essentialLinks"
            :key="link.title"
            :icon="link.icon"
            :label="link.title"
            :to="link.to"
          />
        </q-tabs>
        <q-space />

        <q-breadcrumbs active-color="white">
          <q-breadcrumbs-el
            v-for="(breadcrumb, index) in breadcrumbs"
            :key="breadcrumb.label"
            :label="breadcrumb.label"
            :to="breadcrumb.to"
            :icon="breadcrumb.icon"
            :class="{ 'gt-xs': index == 0 && breadcrumbs.length > 1 }"
          />
        </q-breadcrumbs>
        <q-toggle
          v-if="enableEditing"
          v-model="editMode"
          color="warning"
          checked-icon="edit"
          unchecked-icon="visibility"
        />
        <q-btn-dropdown stretch flat icon="person" class="gt-sm">
          <q-list>
            <user-menu v-model="showAllLocaleContent" :user-attributes="userAttributes" />
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" class="lt-md" bordered>
      <q-list>
        <essential-link
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
        <q-separator />
        <user-menu v-model="showAllLocaleContent" :user-attributes="userAttributes" />
      </q-list>
    </q-drawer>

    <q-page-container :style="{ maxWidth: '1280px', margin: '0 auto' }">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>

import EssentialLink from "components/EssentialLink.vue";
import UserMenu from "components/UserMenu.vue";

import { ref, provide, inject, watch, onMounted } from "vue";

import { useIris } from "src/composables/iris";
const { $q, t, locale, router } = useIris();

let leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const essentialLinks = ref([
  {
    icon: "home",
    to: "/",
  },
  {
    title: t("course.list"),
    icon: "school",
    to: { name: "CourseList" },
  },
  {
    title: t("concept.list"),
    icon: "square_foot",
    to: { name: "ConceptList" },
  },
  {
    title: t("reporting.list"),
    icon: "query_stats",
    to: { name: "ReportingList" },
  },
]);

onMounted(() => {
  locale.value = $q.localStorage.getItem("locale") || "en-US";
  showAllLocaleContent.value =
    $q.localStorage.getItem("options")?.showAllLocaleContent || false;
});
let showAllLocaleContent = ref(false);
watch(showAllLocaleContent, (value) => {
  let options = $q.localStorage.getItem("options") || {};
  options.showAllLocaleContent = value;
  $q.localStorage.set("options", options);
});
provide("showAllLocaleContent", showAllLocaleContent);

const userAttributes = inject("userAttributes");
watch(userAttributes, (value) => {
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
  editMode.value = !routeInfo.edit;
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

</script>

<style>
h1 {
  font-size: 3.25rem;
  line-height: 3.25rem;
  margin-block-start: 0.5em;
  margin-block-end: 0.5em;
}
h2 {
  font-size: 2.75rem;
  line-height: 2.75rem;
  margin-block-start: 0.5em;
  margin-block-end: 0.5em;
}
h3 {
  font-size: 2.25rem;
  line-height: 2.25rem;
  margin-block-start: 0.5em;
  margin-block-end: 0.5em;
}
h4 {
  font-size: 2rem;
  margin: 0;
  margin-block-start: 0.5em;
  margin-block-end: 0.5em;
}
h5 {
  font-size: 1.5em;
  margin: 0;
  margin-block-start: 0.5em;
  margin-block-end: 0.5em;
}

.q-breadcrumbs__el.flex.inline {
  display: inline-block; /* Ensure the element is treated as inline-block */

  max-width: 90px; /* Set the maximum width of the breadcrumb item */
  white-space: nowrap; /* Prevent the text from wrapping to a new line */
  overflow: hidden; /* Hide the overflowed text */
  text-overflow: ellipsis; /* Add ellipsis (...) to the overflowed text */
}
@media (min-width: 600px) {
  .q-breadcrumbs__el.flex.inline {
    max-width: 150px; /* Increase maximum width for larger screens */
  }
}

.q-card-hover {
  cursor: pointer;
  transition:
    background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
    opacity 0.4s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.q-card-hover:hover {
  background-color: rgba(0, 0, 0, 0.15);
}

.text-ellipsis {
  display: inline-block; /* Ensure the element is treated as inline-block */
  margin: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
