<template>
  <q-select
    v-model="locale"
    :options="localeOptions"
    dense
    borderless
    emit-value
    map-options
    options-dense
    style="min-width: 150px"
  />
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

import { useIris } from "src/composables/iris";
const { $q, locale } = useIris();

watch(locale, (value) => {
  $q.localStorage.set("locale", value);
});

onMounted(() => {
  locale.value = $q.localStorage.getItem("locale") || "en-US";
});

const localeOptions = ref([
  { value: "en-US", label: "English" },
  { value: "fr-FR", label: "French" },
]);
</script>
