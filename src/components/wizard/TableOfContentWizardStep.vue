<template>
  <div class="q-pa-none q-col-gutter-sm">
    <q-list>
      <q-item v-for="(tocStep, stepIndex) in tableOfContent" :key="stepIndex">
        <q-item-section>
          <q-input
            v-model="tocStep.name"
            :placeholder="$t('wizard.tableOfContent.stepName')"
            outlined
            dense
          />
          <q-list :label="$t('wizard.tableOfContent.stepParts')">
            <q-item v-for="(item, itemIndex) in tocStep.items" :key="itemIndex">
              <q-item-section class="q-pa-none q-col-gutter-sm">
                <q-input
                  v-model="item.name"
                  :placeholder="$t('wizard.tableOfContent.partName')"
                  outlined
                  dense
                />
                <q-input
                  v-model="item.description"
                  :placeholder="$t('wizard.tableOfContent.partDescription')"
                  type="textarea"
                  rows="2"
                  outlined
                  dense
                />
              </q-item-section>
              <q-item-section side top>
                <q-btn
                  flat
                  icon="close"
                  @click="removePart(stepIndex, itemIndex)"
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <div class="row justify-end">
                  <q-btn
                    size="md"
                    flat
                    icon="add"
                    @click="addPart(stepIndex)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-item-section>
        <q-item-section side top>
          <q-btn flat icon="close" @click="removeStep(stepIndex)" />
        </q-item-section>
      </q-item>
    </q-list>
    <div class="row justify-center">
      '
      <q-btn size="md" icon="add" class="q-mx-sm" @click="addStep" />
      <q-btn
        size="md"
        icon="switch_access_shortcut_add"
        @click="$emit('generateTableOfContent')"
      />
    </div>
  </div>
</template>

<script setup>
const tableOfContent = defineModel({ type: Array, required: true });

defineEmits(["generateTableOfContent"]);

const addStep = () => {
  tableOfContent.value.push({ name: "", items: [] });
};

const removeStep = (index) => {
  tableOfContent.value.splice(index, 1);
};

const addPart = (stepIndex) => {
  tableOfContent.value[stepIndex].items.push({ name: "", description: "" });
};

const removePart = (stepIndex, itemIndex) => {
  tableOfContent.value[stepIndex].items.splice(itemIndex, 1);
};
</script>
