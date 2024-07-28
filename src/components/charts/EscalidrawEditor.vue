<template>
  <div id="excalidraw" ref="excalidraw" classe="excalidraw">Loading...</div>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from 'vue'
import { createRoot } from 'react-dom/client';
import React from 'react'
import { Excalidraw } from "@excalidraw/excalidraw";

const excalidraw = ref(null);

let root;
onMounted(() => {
  root = createRoot(excalidraw.value);
  root.render(React.createElement(Excalidraw, {
    // props
    })
  );
})
onUnmounted(() => {
  if (root) {
    root.unmount();
  }
});

</script>
<style>
.excalidraw {
  height: 100%;
  width: 100%;
}
</style>
