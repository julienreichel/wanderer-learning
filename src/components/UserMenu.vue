<template>
  <q-item>
    <q-item-section>{{ userAttributes.name }}</q-item-section>
  </q-item>
  <q-item>
    <LanguageSwitcher />
  </q-item>
  <q-item>
    <q-checkbox
      v-model="showAllLocaleContent"
      dense
      :label="$t('generic.show_all_locale_content')"
    />
  </q-item>
  <q-item clickable @click="logOut">
    <q-item-section>{{ $t("generic.sign_out") }}</q-item-section>
  </q-item>
</template>

<script setup>
import LanguageSwitcher from "src/components/common/LanguageSwitcher.vue";

import { signOut } from "aws-amplify/auth";
import { useIris } from "src/composables/iris";
const { router } = useIris();

let showAllLocaleContent = defineModel({ type: Boolean });
defineProps({
  userAttributes: {
    type: Object,
    required: true,
  },
});

const logOut = async () => {
  await signOut();
  router.push({ name: "SignIn" });
};
</script>
