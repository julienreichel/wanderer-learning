<template>
  <q-page class="flex flex-center">
    <h1 class="full-width text-center text-uppercase">
      {{ $t("generic.welcome") }}
    </h1>
    <img
      class="bg-primary"
      alt="Wanderer Learning logo"
      src="~assets/wanderer-learning.png"
      style="width: 200px; height: 200px"
    />
  </q-page>
</template>

<script setup>
defineOptions({
  name: "IndexPage",
});
</script>
