<template>
  <q-card-section class="row q-pa-md">
    <q-splitter v-model="splitterModel" class="full-width full-height">
      <template #before>
        <div class="q-gutter-sm">
          <q-input v-model="part.src" outlined :label="$t('parts.form.add.graph')" />
          <q-input v-model="part.text" outlined autogrow :label="$t('parts.form.description')" />
        </div>
      </template>
      <template #after>
        <q-card class="q-pa-md full-height">
          <q-card-section class="full-height">
            <FunctionPlotter :function-string="part.src" />
          </q-card-section>
        </q-card>
      </template>
    </q-splitter>
  </q-card-section>
</template>

<script setup>
import FunctionPlotter from "src/components/charts/FunctionPlotterChart.vue";

import { ref } from "vue";
const part = defineModel({ type: Object });

// Splitter model
const splitterModel = ref(50);
</script>
