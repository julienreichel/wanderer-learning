<template>
  <q-page class="q-pa-md q-gutter-sm">
    <q-input v-model="inputValue" label="Input field" />
    <q-btn @click="fillTextField" label="Send" />
    <q-input v-model="textFieldValue" label="Text field" readonly />
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { generateClient } from 'aws-amplify/data';
const client = generateClient();

let inputValue = ref('');
let textFieldValue = ref('');

const fillTextField = async () => {

  const { data, errors } = await client.queries.AIQuery({
    prompt: inputValue.value
  },
  {
    authMode: 'userPool',
  });
  textFieldValue.value = data;
};
</script>
