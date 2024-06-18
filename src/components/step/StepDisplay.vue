<template>
  <q-card>
    <q-card-section horizontal clickable @click="viewStep(step)">
      <q-card-section class="col">
        <q-card-section class="q-pa-sm q-pb-md">
          <div class="text-h5">{{ step.title }}</div>
        </q-card-section>
        <q-card-section class="q-pa-sm">
          <q-icon
            v-for="(part, index) in step.parts"
            :key="index"
            :name="
              {
                text: 'article',
                img: 'image',
                video: 'smart_display',
                quiz: 'help_center',
                iframe: 'open_in_browser',
              }[part.type]
            "
            color="primary"
            clickable
            @click.stop="viewStep(step, index)"
          />
        </q-card-section>
      </q-card-section>
      <q-card-section class="col-1">
        <q-card-section class="q-pa-sm">
          <q-icon
            v-if="step.reporting"
            name="check_box"
            color="positive"
            size="lg"
            right
          />
        </q-card-section>
        <q-card-section class="q-pa-sm">
          <q-badge v-if="step.reporting" :label="step.reporting.totalTime" />
        </q-card-section>
      </q-card-section>
    </q-card-section>
    <q-card-actions>
      <q-space />
      <q-btn size="sm" icon="east" @click="viewStep(step)" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { useIris } from "src/composables/iris";
const { router } = useIris();

const props = defineProps({
  step: Object,
});

const viewStep = (step, index) => {
  console.log("viewStep", step, index);
  router.push({
    name: "LectureStepView",
    params: { id: step.id, stepIdx: index || 0 },
  });
};

</script>
