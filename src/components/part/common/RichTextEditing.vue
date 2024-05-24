<template>
  <q-editor
    ref="editorRef"
    @paste="onPaste"
    v-model="editor"
    :toolbar="toolbar"
    :fonts="fonts"
  />
</template>

<script setup>
import { ref } from 'vue';

import { useIris } from 'src/composables/iris';
const { $q } = useIris();


const editor = defineModel();
const props = defineProps({
  mode: {
    type: String,
    default: 'full',
  },
});

/**
 * Capture the <CTL-V> paste event, only allow plain-text, no images.
 * See: https://stackoverflow.com/a/28213320
 */
const editorRef = ref(null);
const onPaste = (evt) => {
  // Let inputs do their thing, so we don't break pasting of links.
  if (evt.target.nodeName === 'INPUT') return;
  let text, onPasteStripFormattingIEPaste;
  evt.preventDefault();
  evt.stopPropagation();
  if (evt.originalEvent && evt.originalEvent.clipboardData.getData) {
    text = evt.originalEvent.clipboardData.getData('text/plain');
    editorRef.value.runCmd('insertText', text);
  } else if (evt.clipboardData && evt.clipboardData.getData) {
    text = evt.clipboardData.getData('text/plain');
    editorRef.value.runCmd('insertText', text);
  } else if (window.clipboardData && window.clipboardData.getData) {
    if (!onPasteStripFormattingIEPaste) {
      onPasteStripFormattingIEPaste = true;
      editorRef.value.runCmd('ms-pasteTextOnly', text);
    }
    onPasteStripFormattingIEPaste = false;
  }
};
const toolbar = [];
if (props.mode === 'full') {
  toolbar.push([
    {
      icon: $q.iconSet.editor.formatting,
      list: 'no-icons',
      options: ['h3', 'h5', 'p', 'code'],
    },
    {
      icon: $q.iconSet.editor.align,
      fixedLabel: true,
      list: 'only-icons',
      options: ['left', 'center', 'right', 'justify'],
    },
  ]);
}
toolbar.push(['bold', 'italic', 'strike', 'underline']);
if (props.mode === 'full') {
  toolbar.push(['quote', 'unordered', 'ordered', 'outdent', 'indent']);
} else if (props.mode !== 'basic') {
  toolbar.push(['unordered', 'ordered']);
}
if (props.mode !== 'basic') {
  toolbar.push(['hr', 'link']);
}
const fonts = {
  arial: 'Arial',
  arial_black: 'Arial Black',
  comic_sans: 'Comic Sans MS',
  courier_new: 'Courier New',
  impact: 'Impact',
  lucida_grande: 'Lucida Grande',
  times_new_roman: 'Times New Roman',
  verdana: 'Verdana',
};
</script>
