<template>
  <div id="excalidraw" ref="excalidraw" class="excalidraw">Loading...</div>
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
import { onMounted, onUnmounted, ref, watch } from "vue";
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  initialData: {
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
    console.log(eventName);
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
  return createElement(
    Excalidraw,
    {
      ...props,
      UIOptions: props.options,
      ...eventHandlers,
    },
    createElement(
      MainMenu,
      {},
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
  props,
  (newProps) => {
    if (root) {
      root.render(createExcalidrawElement(newProps, eventHandlers));
    }
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
.excalidraw {
  height: 100%;
  width: 100%;
}
.excalidraw .App-menu_top > .layer-ui__wrapper__top-right {
  display: none;
}
.excalidraw .HelpDialog .Dialog__title {
  display: none;
}
.excalidraw .HelpDialog .HelpDialog__header {
  display: none;
}
</style>
