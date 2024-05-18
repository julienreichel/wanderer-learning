<template>
  <q-card v-for="(part, index) in parts" :key="index">
    <rich-text-editing v-if="part.type === 'text'" v-model="part.text">
    </rich-text-editing>
    <div class="row" v-if="part.type === 'img'">
      <amplify-uploader
        :ref="(el) => (uploaderRefs[index] = el)"
        accept=".jpg, image/*"
        :filename="(file) => uid() + '.' + file.name.split('.').pop()"
        @uploaded="(msg) => uploaded(part, msg, index)"
      >
        <template v-slot:header="scope">
          <div class="row no-wrap items-center q-pa-sm q-gutter-sm">
            <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
            <q-btn
              v-if="scope.canAddFiles"
              type="a"
              icon="add_box"
              @click="scope.pickFiles"
              round
              dense
              flat
            >
              <q-uploader-add-trigger />
              <q-tooltip>Pick Files</q-tooltip>
            </q-btn>
            <q-btn
              v-if="scope.canUpload"
              icon="cloud_upload"
              @click="scope.upload"
              round
              dense
              flat
            >
            </q-btn>
          </div>
        </template>
      </amplify-uploader>
      <q-img class="col" :ratio="16 / 9" fit="cover" :src="part.url" />
    </div>
    <div class="row q-pa-md" v-if="part.type === 'video'">
      <q-input
        class="col-8"
        v-model="part.src"
        :label="$t('parts.form.add.video')"
      />
      <div class="col-4">
        <q-video :ratio="16 / 9" :src="part.src" />
      </div>
    </div>
    <question-editing
      v-if="part.type === 'quiz' && !allowMultipleQuestions"
      v-model="part.questions[0]"
    />
    <q-card-section v-if="part.type === 'quiz' && allowMultipleQuestions" class="q-mt-sm q-pa-sm q-gutter-sm">
        <questions-editing
          v-model="part.questions"
        />
    </q-card-section>

    <q-separator />

    <q-card-actions >
      <q-space />
      <q-btn size="sm" icon="delete" @click="remove(index)" />
      <q-btn
        v-if="index > 0"
        size="sm"
        icon="arrow_upward"
        @click="moveUp(index)"
      />
      <q-btn
        v-if="index + 1 < parts.length"
        size="sm"
        icon="arrow_downward"
        @click="moveDown(index)"
      />
    </q-card-actions>
  </q-card>
  <q-card>
    <q-card-actions>
      <q-space/>
      <q-btn
        size="sm"
        icon="add"
        icon-right="library_books"
        @click="add('text')"
      />
      <q-btn
        size="sm"
        icon-right="collections"
        icon="add"
        @click="add('img')"
      />
      <q-btn
        size="sm"
        icon-right="video_library"
        icon="add"
        @click="add('video')"
      />
      <q-btn
        size="sm"
        icon-right="quiz"
        icon="add"
        @click="add('quiz')"
      />
      <q-btn size="sm" icon="check" @click="finish()" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, inject } from 'vue';

import RichTextEditing from './RichTextEditing.vue';
import QuestionEditing from './QuestionEditing.vue';
import QuestionsEditing from './QuestionsEditing.vue';
import AmplifyUploader from '../utils/AmplifyUploader.js';

import { useIris } from 'src/composables/iris';
const { uid } = useIris();
const {storage: storageService} = inject('services');


const parts = defineModel();
const props = defineProps({ allowMultipleQuestions: { type: Boolean, default: false }});
const emit = defineEmits(['finished']);

const remove = (index) => {
  return parts.value.splice(index, 1)[0];
};
const moveUp = (index) => {
  const part = remove(index);
  parts.value.splice(index - 1, 0, part);
};
const moveDown = (index) => {
  const part = remove(index);
  parts.value.splice(index + 1, 0, part);
};

const add = (type) => {
  const { src, text } = {
    text: { text: 'Sample text' },
    img: { src: '' },
    video: { src: 'https://www.youtube.com/embed/k3_tw44QsZQ?rel=0' }
  }[type] || {text: ''};

  if (!parts.value) {
    parts.value = [];
  }
  let questions = [];
  if (!props.allowMultipleQuestions && type === 'quiz') {
    questions = [{
      id: uid(),
      type: 'radio',
      answers: [],
      options: []
    }];
  }

  parts.value.push({
    type,
    src,
    text,
    questions,
    options: [],
  });
};
const uploaderRefs = ref([]);
const uploaded = async (part, msg, idx) => {
  const file = msg.files[0];
  if (part.src) {
    storageService.removeImg(part.src);
  }
  part.src = file?.path;
  part.url = file?.url;

  const uploader = uploaderRefs.value[idx];
  if (uploader) {
    uploader.removeUploadedFiles();
  }
};

const finish = (success = true) => {
  emit('finished', { success });
};
</script>
