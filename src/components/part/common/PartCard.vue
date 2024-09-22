<template>
  <div class="col">
    <q-card
      class="aspect-ratio-16-9 q-card-hover"
      clickable
      :class="{ 'custom-highlight': active }"
      flat
      bordered
      @click="stepChange(step)"
    >
      <q-card-section v-if="part.type === 'text'" class="gt-sm q-pa-sm">
        <q-item-label class="gt-md">{{ textPreview }}</q-item-label>
        <q-item-label v-for="idx in 3" :key="idx">
          <q-skeleton type="text" animation="none" />
        </q-item-label>
      </q-card-section>
      <q-card-section
        v-if="part.type === 'text'"
        class="lt-md q-pa-none row justify-center items-center"
      >
        <q-icon name="format_list_bulleted" size="sm" />
      </q-card-section>

      <q-card-section v-if="part.type === 'img'" class="q-pa-none">
        <q-img :ratio="16 / 9" fit="scale-down" :src="part.url" />
      </q-card-section>

      <q-card-section
        v-if="part.type === 'quiz'"
        class="q-pa-none row justify-center items-center"
      >
        <q-icon
          v-if="!hasQuizAnswer"
          name="assignment"
          size="xl"
          class="gt-sm"
        />
        <q-icon v-else name="assignment_turned_in" size="xl" class="gt-sm" />
        <q-icon
          v-if="!hasQuizAnswer"
          name="assignment"
          size="sm"
          class="lt-md"
        />
        <q-icon v-else name="assignment_turned_in" size="sm" class="lt-md" />
      </q-card-section>

      <q-card-section
        v-if="part.type === 'video'"
        class="q-pa-none row justify-center items-center"
      >
        <q-icon name="play_circle" size="xl" class="gt-sm" />
        <q-icon name="play_circle" size="sm" class="lt-md" />
      </q-card-section>

      <q-card-section v-if="part.type === 'iframe'" class="q-pa-none">
        <div class="aspect-ratio-16-9" style="position: relative">
          <iframe :title="part.text" :src="part.src"></iframe>
          <div
            style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            "
          ></div>
        </div>
      </q-card-section>

      <q-card-section v-if="part.type === 'drawing'" class="q-pa-none">
        <div class="aspect-ratio-16-9" style="position: relative">
          <div class="sub">
            <div class="full-height">
              <escalidraw-wrapper
                :data="drawData"
                view-mode-enabled
                zen-mode-enabled
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="part.type === 'graph'" class="q-pa-none">
        <div class="aspect-ratio-16-9" style="position: relative">
          <div class="sub">
            <div class="graph">
              <function-plotter :function-string="props.part.src" />
            </div>
            <div
              style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
              "
            ></div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions v-if="editing" class="q-pa-xs">
        <q-space />
        <q-btn
          v-if="isAdmin"
          size="sm"
          icon="data_object"
          flat
          round
          @click.stop="$emit('edit', step)"
        />
        <q-btn
          size="sm"
          icon="delete"
          flat
          round
          @click.stop="$emit('remove', step)"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import EscalidrawWrapper from "src/components/common/EscalidrawWrapper.vue";
import FunctionPlotter from "src/components/charts/FunctionPlotterChart.vue";
import { inject, computed, ref } from "vue";
const userAttributes = inject("userAttributes");
const { isAdmin } = userAttributes.value;

const props = defineProps({
  part: { type: Object, required: true },
  hasQuizAnswer: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  step: { type: Number, required: true },
  maxStep: { type: Number, required: true },
  editing: { type: Boolean, default: false },
});

const emit = defineEmits([
  "stepChange",
  "remove",
  "moveLeft",
  "moveRight",
  "edit",
]);

const stepChange = (newStep) => {
  emit("stepChange", newStep);
};

const textPreview = computed(() => {
  if (props.part.type !== "text") {
    return "";
  }
  // find the first <h3> or <h5> block and return it
  let text = props.part.text || "";
  const h = text.match(/<h\d>(.*?)<\/h\d>/);
  if (h) {
    // remove all html, keep only the text
    text = h[1].replace(/<[^>]*>?/gm, "");
  }
  if (text.length < 25) {
    return text;
  }
  return text.substring(0, 21) + " ...";
});

let drawData;
if (props.editing) {
  // we do not use a computed here, because updating the data live while editing is causing issues
  // the main editing window looses the focus, and this breaks the editing
  drawData = ref({
    ...JSON.parse(props.part.src || "{}"),
    appState: { zoom: { value: 0.15 } },
  });
} else {
  drawData = computed(() => ({
    ...JSON.parse(props.part.src || "{}"),
    appState: { zoom: { value: 0.15 } },
  }));
}
</script>

<style lang="scss" scoped>
.custom-highlight {
  border-color: var(--q-primary);
}
.aspect-ratio-16-9 {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio (9/16 * 100) */
}

.aspect-ratio-16-9 > .q-card__section,
.aspect-ratio-16-9 > iframe,
.aspect-ratio-16-9 > .sub {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

iframe,
.graph {
  width: 500%;
  height: 500%;
  border: 0; /* no border */
  transform: scale(0.2);
  transform-origin: 0 0;
}
</style>
