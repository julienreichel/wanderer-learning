<template>
  <q-page class="flex q-pa-md">
    <q-splitter v-model="splitterModel" class="full-width full-height">
      <template #before>
        <q-card class="q-pa-md">
          <q-card-section>
            <q-input
              v-model="functionContent"
              label="Function Input (e.g., 2*x+4 or pow(x,2))"
              debounce="500"
              outlined
              dense
            />
          </q-card-section>
        </q-card>
      </template>
      <template #after>
        <q-card class="q-pa-md full-height">
          <q-card-section class="full-height">
            <FunctionPlotter :function-string="functionContent" />
          </q-card-section>
        </q-card>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import FunctionPlotter from "src/components/charts/FunctionPlotterChart.vue";

// Reactive data
const functionContent = ref("a*(x-p.x)^3+p.y");

// Splitter model
const splitterModel = ref(50);
</script>

<style scoped>
#functionPlotterContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  height: 100%;
}
</style>
