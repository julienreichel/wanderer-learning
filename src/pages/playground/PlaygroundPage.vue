<template>
  <q-page padding class="row">
    <q-card class="my-card q-mb-lg col-sm-6 col-md-3">
      <q-card-section>
        <div class="text-h6">Mermaid</div>
        <q-img
          src="https://mermaid.js.org/mermaid-logo.svg"
          class="bg-primary"
        />
      </q-card-section>
      <q-card-actions class="q-px-none q-py-lg">
        <q-space />
        <q-btn
          size="md"
          padding="sm 64px"
          icon="chevron_right"
          :to="{ name: 'mermaid' }"
        />
      </q-card-actions>
    </q-card>

    <q-card class="my-card q-mb-md col-sm-6 col-md-3">
      <q-card-section>
        <div class="text-h6">Graphviz</div>
        <q-img
          src="https://graphviz.org/Resources/app.png"
          class="bg-primary"
        />
      </q-card-section>
      <q-card-actions class="q-px-none q-py-lg">
        <q-space />
        <q-btn
          size="md"
          padding="sm 64px"
          icon="chevron_right"
          :to="{ name: 'graphviz' }"
        />
      </q-card-actions>
    </q-card>

    <q-card class="my-card q-mb-md col-sm-6 col-md-3">
      <q-card-section>
        <div class="text-h6">JSX Graph</div>
        <q-img
          src="https://jsxgraph.org/wp/img/logo_tw.png"
          class="bg-primary"
          style="height: 100%; width: 100%"
        />
      </q-card-section>
      <q-card-actions class="q-px-none q-py-lg">
        <q-space />
        <q-btn
          size="md"
          padding="sm 64px"
          icon="chevron_right"
          :to="{ name: 'function' }"
        />
      </q-card-actions>
    </q-card>

    <q-card class="my-card q-mb-md col-sm-6 col-md-3">
      <q-card-section>
        <div class="text-h6">Excalidraw</div>
        <q-img
          src="https://docs.excalidraw.com/img/logo.svg"
          class="bg-primary"
        />
      </q-card-section>
      <q-card-actions class="q-px-none q-py-lg">
        <q-space />
        <q-btn
          size="md"
          padding="sm 64px"
          icon="chevron_right"
          :to="{ name: 'excalidraw' }"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup></script>

<style scoped>
.my-card {
  max-width: 250px;
  margin: auto;
}
</style>
