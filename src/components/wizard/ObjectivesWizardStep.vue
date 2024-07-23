<template>
    <div class="q-pa-none q-col-gutter-sm">
      <q-input v-model="title" outlined :label="$t('wizard.titleKeyConceptsObjectives.lectureTitle')" />
      <div class="text-h6">{{ $t("wizard.titleKeyConceptsObjectives.concepts") }}</div>
      <q-list :label="$t('wizard.titleKeyConceptsObjectives.keyConcepts')">
        <q-item v-for="(concept, index) in keyConcepts" :key="index">
          <q-item-section class="q-pa-none q-col-gutter-sm">
            <q-input
              v-model="concept.name"
              :placeholder="$t('wizard.titleKeyConceptsObjectives.conceptName')"
              outlined
              dense
            />
            <q-input
              v-model="concept.description"
              :placeholder="$t('wizard.titleKeyConceptsObjectives.conceptDescription')"
              type="textarea"
              rows="2"
              outlined
              dense
            />
          </q-item-section>
          <q-item-section side>
            <q-btn flat icon="close" @click="removeKeyConcept(index)" />
          </q-item-section>
        </q-item>
      </q-list>
      <div v-if="keyConcepts.length < 7" class="row">
        <q-btn class="col" flat :label="$t('wizard.titleKeyConceptsObjectives.addConcept')" @click="addKeyConcept" />
        <q-btn class="col" flat :label="$t('wizard.titleKeyConceptsObjectives.addAIConcepts')" @click="$emit('generateTitleAndObjectives')" />
      </div>
      <div class="text-h6">{{ $t("wizard.titleKeyConceptsObjectives.objectives") }}</div>
      <q-list :label="$t('wizard.titleKeyConceptsObjectives.learningObjectives')">
        <q-item v-for="(objective, index) in learningObjectives" :key="index">
          <q-item-section>
            <q-input
              v-model="learningObjectives[index]"
              :placeholder="$t('wizard.titleKeyConceptsObjectives.learningObjective')"
              outlined
              dense
            />
          </q-item-section>
          <q-item-section side top>
            <q-btn flat icon="close" @click="removeLearningObjective(index)" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-btn v-if="learningObjectives.length < 7" flat :label="$t('wizard.titleKeyConceptsObjectives.addObjective')" @click="addLearningObjective" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
</template>

<script setup>

const title = defineModel('title', { type: String, required: true });
const keyConcepts = defineModel('keyConcepts', { type: Array, required: true });
const learningObjectives = defineModel('learningObjectives', { type: Array, required: true });

defineEmits(["generateTitleAndObjectives"]);

const addKeyConcept = () => {
  keyConcepts.value.push({ name: "", description: "" });
};

const removeKeyConcept = (index) => {
  keyConcepts.value.splice(index, 1);
};

const addLearningObjective = () => {
  learningObjectives.value.push("");
};

const removeLearningObjective = (index) => {
  learningObjectives.value.splice(index, 1);
};


</script>
