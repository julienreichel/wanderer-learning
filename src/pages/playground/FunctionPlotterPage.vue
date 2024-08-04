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
            <FunctionPlotter :function-string="functionContent" :controls="controls"/>
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
const controls = ref({
      p: { type: "point", settings: { style: 4 } },
      a: {
        type: "slider",
        position: [
          [1, -4.5],
          [3.9, -4.5],
          [-2, 1, 2],
        ],
      },
      g: {
        type: "glider",
        position: [1, 2],
        options: {
          tangent: { dash: 2, strokeColor: "#aa0000" },
          line: { dash: 2, strokeColor: "#777", point: "p" },
        },
      },
      /* // samples
      v2: { type: "point", position: [-2,3], settings: { style: 1 } },
      v1: { type: "point", position: [-2,3], settings: { style: 1 }, options: { line: { point: "v2", straightFirst:false, straightLast:false, lastArrow:true} } },
      v0: { type: "point", position: [-4,2], settings: { style: 1 }, options: { line: { point: "v1", straightFirst:false, straightLast:false, lastArrow:true} } },
      */
    })
// Splitter model
const splitterModel = ref(50);
</script>

