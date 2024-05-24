<template>
  <q-card-section class="row">
    <q-input class="col-8" v-model="question.text" label="The question" />
    <q-select
      class="col-3 offset-1"
      outlined
      v-model="question.type"
      :options="questionTypeOptions"
      :option-label="(item) => $t('quiz.question.type.' + item)"
      label="Type"
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-icon :name="selectIcon(scope.opt)" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{
              $t('quiz.question.type.' + scope.opt)
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </q-card-section>
  <q-card-section v-if="question.type === 'feedback'">
    <q-btn-toggle v-model="feedbackType" :options="feedbackTypeOptions">
      <template v-slot:roti>
        <q-icon right name="sentiment_satisfied_alt" />
      </template>
      <template v-slot:difficulty>
        <q-icon right name="speed" />
      </template>
      <template v-slot:stars>
        <q-icon right name="grade" />
      </template>
      <template v-slot:text>
        <q-icon right name="short_text" />
      </template>
    </q-btn-toggle>
    <q-list
      class="q-gutter-sm"
      v-if="feedbackType === 'roti' || feedbackType === 'difficulty'"
    >
      <q-item v-for="index in 5" :key="index">
        <q-input v-model="question.answers[index - 1].text" class="full-width">
          <template v-slot:prepend>
            <q-icon
              :name="
                Array.isArray(icons[feedbackType])
                  ? icons[feedbackType][index - 1]
                  : icons[feedbackType]
              "
              :color="
                colors[feedbackType]
                  ? colors[feedbackType][index - 1]
                  : 'primary'
              "
            />
          </template>
        </q-input>
      </q-item>
    </q-list>
  </q-card-section>
  <q-card-section v-else>
    <q-list class="q-gutter-sm">
      <q-item
        class="q-px-none"
        v-for="(answer, answerIdx) in question.answers"
        :key="answerIdx"
      >
        <q-input v-model="answer.text" class="full-width">
          <template v-slot:prepend>
            <q-icon :name="getIcon(question)" />
          </template>
          <template v-slot:append>
            <q-toggle
              checked-icon="check"
              color="green"
              unchecked-icon="clear"
              v-model="answer.valid"
            />
            <q-btn
              flat
              padding="xs"
              size="sm"
              icon="close"
              @click="removeAnswer(question, answerIdx)"
            />
          </template>
        </q-input>
      </q-item>
    </q-list>
    <q-btn @click="addAnswer(question)" size="sm" icon="add" />
    <q-toggle
      v-if="question.type === 'shorttext'"
      label="Mark all other answers incorrect"
      v-model="allInvalid"
    />
  </q-card-section>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useIris } from 'src/composables/iris';
const { t, getIconFromType } = useIris();
const question = defineModel();

const setOption = (name, value) => {
  if (!question.value.options) {
    question.value.options = [];
  }
  let option = question.value.options.find((option) => option.name === name);
  if (!option) {
    question.value.options.push({ name, value });
  } else {
    option.value = value;
  }
};

const getOption = (name) => {
  return question.value.options?.find((option) => option.name === name)?.value;
};

const allInvalid = ref(false);
watch(allInvalid, (value) => setOption('allInvalid', value));

watch(() => question.value.options, (options) => {
  if (!options) {
    return;
  }
  feedbackType.value = getOption('feedbackType') || 'roti';
});

const feedbackType = ref(getOption('feedbackType') || 'roti');
watch([feedbackType, () => question.value.type], (value) => {
  if (question.value.type !== 'feedback') {
    return;
  }
  if (feedbackType.value === 'roti') {
    question.value.text = t('quiz.feedback.question.roti');
    question.value.answers = [1, 2, 3, 4, 5].map((index) => ({
      text: t('quiz.feedback.tooltips.roti.' + index),
    }));
  }
  if (feedbackType.value === 'difficulty') {
    question.value.text = t('quiz.feedback.question.difficulty');
    question.value.answers = [1, 2, 3, 4, 5].map((index) => ({
      text: t('quiz.feedback.tooltips.difficulty.' + index),
    }));
  }
  if (feedbackType.value === 'stars') {
    question.value.text = t('quiz.feedback.question.stars');
  }
  if (feedbackType.value === 'text') {
    question.value.text = t('quiz.feedback.question.text');
  }
  setOption('feedbackType', feedbackType.value);


},{ immediate: true });

if (
  question.value.type === 'feedback' &&
  (feedbackType.value === 'roti' || feedbackType.value === 'difficulty') &&
  !question.value.answers?.length === 5
) {
  question.value.answers = [1, 2, 3, 4, 5].map((index) => ({
    text: t(
      'quiz.feedback.tooltips.' + feedbackType.value + '.' + index
    ),
  }));
}

const icons = {
  difficulty: 'speed',
  roti: [
    'sentiment_very_dissatisfied',
    'sentiment_dissatisfied',
    'sentiment_neutral',
    'sentiment_satisfied',
    'sentiment_satisfied_alt',
  ],
  stars: 'star_border',
};
const colors = {
  difficulty: ['lime', 'light-green', 'green', 'teal', 'purple'],
};

const feedbackTypeOptions = [
  {
    label: t('quiz.feedback.type.roti'),
    value: 'roti',
    slot: 'roti',
  },
  {
    label: t('quiz.feedback.type.difficulty'),
    value: 'difficulty',
    slot: 'difficulty',
  },
  {
    label: t('quiz.feedback.type.stars'),
    value: 'stars',
    slot: 'stars',
  },
  {
    label: t('quiz.feedback.type.text'),
    value: 'text',
    slot: 'text',
  },
];

const questionTypeOptions = ['shorttext', 'radio', 'checkbox', 'feedback'];

const selectIcon = (value) => getIconFromType(value);

const getIcon = (question, add) => {
  if (question.type === 'radio') {
    return add ? 'add_circle' : 'radio_button_unchecked';
  }
  if (question.type === 'checkbox') {
    return add ? 'add_box' : 'check_box_outline_blank';
  }
  if (question.type === 'shorttext') {
    return 'short_text';
  }
  if (question.type === 'longtext') {
    return 'notes';
  }
  if (question.type === 'feedback') {
    return 'rate_review';
  }
};

const removeAnswer = (question, index) => {
  return question.answers.splice(index, 1)[0];
};

const addAnswer = (question) => {
  question.answers.push({
    text: '',
    valid: false,
  });
};
</script>
