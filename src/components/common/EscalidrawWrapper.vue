<template>
  <div id="excalidraw" ref="excalidraw" class="excalidraw-wrapper">
    Loading...
  </div>
</template>

<script>
const events = [
  "change",
  "collaborators",
  "libraryChange",
  "pointerUpdate",
  "paste",
  "copy",
  "libraryOpen",
  "pointerDown",
  "pointerUp",
  "pointerMove",
  "scrollChange",
  "historyChange",
  "scenePointerDown",
  "scenePointerUp",
  "scenePointerMove",
  "sceneScroll",
  "libraryClose",
  "selectElement",
  "exportToBackend",
  "menuToggle",
  "collabButtonClick",
  "collabLinkClick",
  "imageAction",
  "insertElements",
  "canvasStateChange",
  "viewModeToggle",
  "shortcutAction",
  "libraryLoad",
  "dragNewElement",
  "customUI",
];
</script>

<script setup>
import { onUnmounted, ref, watch } from "vue";
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { defineProps, defineEmits, onMounted } from "vue";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  isCollaborating: {
    type: Boolean,
    default: false,
  },
  renderTopRightUI: {
    type: Function,
    default: null,
  },
  renderCustomStats: {
    type: Function,
    default: null,
  },
  initialState: {
    type: Object,
    default: () => ({}),
  },
  viewModeEnabled: {
    type: Boolean,
    default: false,
  },
  zenModeEnabled: {
    type: Boolean,
    default: false,
  },
  gridModeEnabled: {
    type: Boolean,
    default: false,
  },
  libraryReturnUrl: {
    type: String,
    default: "",
  },
  options: {
    //UIOptions
    type: Object,
    default: () => ({
      canvasActions: {
        changeViewBackgroundColor: true,
        clearCanvas: true,
        export: false,
        loadScene: false,
        saveToActiveFile: false,
        toggleTheme: null,
        saveAsImage: false,
      },
    }),
  },
  detectScroll: {
    type: Boolean,
    default: true,
  },
  handleKeyboardGlobally: {
    type: Boolean,
    default: false,
  },
  autoFocus: {
    type: Boolean,
    default: true,
  },
  user: {
    type: Object,
    default: () => ({}),
  },
  initialDataState: {
    type: Object,
    default: () => ({}),
  },
  collabAPI: {
    type: Object,
    default: null,
  },
  langCode: {
    type: String,
    default: "en",
  },
  viewBackgroundColor: {
    type: String,
    default: "#ffffff",
  },
  theme: {
    type: String,
    default: "light",
  },
  name: {
    type: String,
    default: "",
  },
  appState: {
    type: Object,
    default: () => ({}),
  },
  elements: {
    type: Array,
    default: () => [],
  },
  files: {
    type: Object,
    default: () => ({}),
  },
  renderCustomUI: {
    type: Function,
    default: null,
  },
  debounce: {
    type: Number,
    default: 300,
  },
});

const emit = defineEmits(events);

const excalidraw = ref(null);
let root;

let timeouts = {};
const debounceEmit = (eventName, ...args) => {
  clearTimeout(timeouts[eventName]);
  timeouts[eventName] = setTimeout(() => {
    emit(eventName, ...args);
  }, props.debounce);
};

const createEventHandlers = (eventNames) => {
  return eventNames.reduce((handlers, eventName) => {
    handlers[`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`] = (
      ...args
    ) => debounceEmit(eventName, ...args);
    return handlers;
  }, {});
};

const eventHandlers = createEventHandlers(events);

const createExcalidrawElement = (props, eventHandlers) => {
  //const attributes = props.viewModeEnabled ? { style: 'display: none', className: 'hide-menu' } : {};
  const excProps = {
    ...props,
    initialData: JSON.parse(JSON.stringify(props.data || {})),
    UIOptions: props.options,
    ...eventHandlers,
  };
  delete excProps.data;
  delete excProps.options;

  return createElement(
    Excalidraw,
    excProps,
    createElement(
      MainMenu,
      null,
      createElement(MainMenu.DefaultItems.ChangeCanvasBackground),
      createElement(MainMenu.Separator),
      createElement(MainMenu.DefaultItems.ClearCanvas),
    ),
  );
};

onMounted(() => {
  root = createRoot(excalidraw.value);
  root.render(createExcalidrawElement(props, eventHandlers));
});

watch(
  () => props,
  () => {
    if (root) {
      root.unmount();
      root = createRoot(excalidraw.value);
    }
    root.render(createExcalidrawElement(props, eventHandlers));
  },
  { deep: true },
);

onUnmounted(() => {
  if (root) {
    root.unmount();
  }
});
</script>

<style>
.excalidraw-wrapper {
  height: 100%;
  width: 100%;
}
.excalidraw-wrapper .App-menu_top > .layer-ui__wrapper__top-right,
.excalidraw-wrapper .HelpDialog .Dialog__title,
.excalidraw-wrapper .HelpDialog .HelpDialog__header {
  display: none;
}

.excalidraw.excalidraw--view-mode .App-menu.App-menu_top,
.excalidraw.excalidraw--view-mode .App-toolbar .App-toolbar-content {
  display: none;
}
</style>
