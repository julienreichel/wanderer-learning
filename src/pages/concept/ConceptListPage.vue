<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-card v-for="concept in concepts" :key="concept.id">
      <q-card-section v-if="editing === concept.id" class="q-gutter-sm">
        <q-input
          outlined
          v-model="concept.title"
          :label="$t('concept.form.title')"
        />
        <rich-text-editing
          v-model="concept.description"
          mode="simple"
        ></rich-text-editing>
      </q-card-section>
      <q-card-section v-else clickable @click="viewConcept(concept)">
        <q-chip square color="primary" text-color="white">
          {{ concept.title }}
        </q-chip>
        <div class="q-pa-sm" v-html="concept.description"></div>
      </q-card-section>
      <q-card-actions v-if="editing === concept.id" >
        <q-space />
        <q-btn size="sm" icon="done" @click="updateConcept(concept)" />
        <q-btn size="sm" icon="clear" @click="editing = null" />
      </q-card-actions>
      <q-card-actions v-else-if="userAttributes.isTeacher">
        <q-space />
        <q-btn size="sm" icon="edit" @click="editing = concept.id" />
        <q-btn size="sm" icon="visibility" @click="viewConcept(concept)" />
        <q-btn size="sm" icon="delete" @click="deleteConcept(concept)" />
      </q-card-actions>
    </q-card>
    <q-card v-if="userAttributes.isTeacher">
      <q-card-section>
        <q-input
          outlined
          v-model="newTitle"
          :label="$t('concept.form.add')"
          @keydown.enter="addConcept()"
        >
        </q-input>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn size="sm" icon="add" @click="addConcept()" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import RichTextEditing from 'src/components/part/RichTextEditing.vue';

import { useIris } from 'src/composables/iris';
const { t, $q, router } = useIris();
const {concept: conceptService} = inject('services');

const { updateBreadcrumbs } = inject('breadcrumbs');
updateBreadcrumbs([{ label: t('concept.list') }]);
const userAttributes = inject('userAttributes');

const concepts = ref([]);
onMounted(async () => {
  const data = await conceptService.list();
  concepts.value = data;
});

const deleteConcept = async (concept) => {
  $q.dialog({
    title: t('generic.form.confirm_delete_title'),
    message: t('concept.form.confirm_delete_concept'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await conceptService.delete(concept);
    concepts.value = concepts.value.filter(({ id }) => id !== concept.id);
  });
};
const viewConcept = (concept) => {
  router.push({ name: 'ConceptView', params: { id: concept.id } });
};

const editing = ref(null);

const newTitle = ref();
const checkDuplicate = (title, id) => {
  const duplicate = concepts.value.find(
    (concept) => concept.title === title && concept.id !== id
  );
  if (duplicate) {
    $q.notify({
      color: 'negative',
      icon: 'warning',
      message: t('concept.form.duplicate'),
    });
    return true;
  }
  return false;
};
const addConcept = async () => {
  if (!newTitle.value) {
    return;
  }
  if (checkDuplicate(newTitle.value)) {
    return;
  }

  const concept = await conceptService.create({
    title: newTitle.value,
  });
  concepts.value.push(concept);
  newTitle.value = '';
};

const updateConcept = async (concept) => {
  editing.value = null;

  if (checkDuplicate(concept.title, concept.id)) {
    return;
  }
  await conceptService.update(concept);

  $q.notify({
    color: 'info',
    icon: 'cloud_done',
    message: t('generic.form.saved'),
  });
};
</script>
