<template>
  <q-card-section v-if="part.type === 'text'" horizontal class="q-pa-md">
    <div class="row full-width">
      <q-img
        v-if="part.url"
        class="lt-md col-12"
        fit="scale-down"
        :src="part.url"
      />
      <rich-text-renderer :class="textSizeClass" :html-content="part.text" />
      <q-img
        v-if="part.url"
        class="gt-sm"
        :class="imageSizeClass"
        fit="scale-down"
        :src="part.url"
      />
    </div>
  </q-card-section>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import RichTextRenderer from "src/components/common/RichTextRenderer.vue";
import { useIris } from "src/composables/iris";

const { $q } = useIris();
const props = defineProps({
  part: { type: Object, required: true },
});

const imageSize = ref(Number(props.part.options?.imageSize) || 4);
watch(
  () => props.part.options,
  () => {
    imageSize.value = Number(props.part.options?.imageSize || 4);
  },
);

const textSizeClass = computed(() =>
  props.part.url && $q.screen.gt.sm
    ? "col-" + (12 - imageSize.value)
    : "col-12",
);
const imageSizeClass = computed(() =>
  props.part.url ? "col-" + imageSize.value : "col-0",
);
</script>
