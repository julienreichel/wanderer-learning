<template>
  <q-page class="q-pa-sm q-gutter-sm">
  <authenticator :social-providers="['google']" :sign-up-attributes="['name', 'phone_number']">
  </authenticator>
  </q-page>
</template>

<script setup>
import { watch } from 'vue';
import { useIris } from 'src/composables/iris';
const { router } = useIris();
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-vue';
const auth = useAuthenticator();
import '@aws-amplify/ui-vue/styles.css';


watch(auth, (value) => {
  if (auth.authStatus === 'authenticated') {
    router.push({ name: 'Home' });
  }
});
</script>
