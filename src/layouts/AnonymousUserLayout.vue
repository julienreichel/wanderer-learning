<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat :label="$t('generic.app_name')" to="/" />
        <q-space />
        <q-btn flat :label="$t('generic.sign_in')" :to="{ name: 'SignIn' }" />
      </q-toolbar>
    </q-header>
    <q-page-container :style="{ maxWidth: '1280px', margin: '0 auto' }">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup></script>
