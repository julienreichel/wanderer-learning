<template>
  <link
    rel="stylesheet"
    type="text/css"
    href="https://jsxgraph.org/jsxgraph.org/distrib/jsxgraph.css"
  />
  <div :id="boardId" ref="jxgBoard" class="jxgbox"></div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from "vue";
import { uid } from "quasar";
import { compile } from "mathjs";
import JXG from "jsxgraph";
// for some weird reason I cannot get this to work, so hacking using the above link
//import 'jsxgraph/distrib/jsxgraph.css';

// Props
const props = defineProps({
  functionString: {
    type: String,
    default: "",
  },
  controls: {
    type: Object,
    default: () => ({}),
  },
});

// Reactive reference to the container element
const jxgBoard = ref(null);
const boardId = ref("jsxgraph-" + uid());
let board;

// Method to render the JSXGraph board
const renderBoard = (funcStr) => {
  console.log("Rendering board with function:", funcStr);
  if (board) {
    JXG.JSXGraph.freeBoard(board);
  }

  board = JXG.JSXGraph.initBoard(boardId.value, {
    boundingbox: [-5, 5, 5, -5],
    axis: true,
  });

  let vars = {};
  Object.keys(props.controls).forEach((key) => {
    const { type, settings, position, options = {} } = props.controls[key];
    if (type === "glider") {
      vars[key] = { elType: "glider", X: () => 0, Y: () => 0 };
      return;
    }
    vars[key] = board.create(type, position || [0, 0], {
      name: key,
      ...settings,
    });
    if (options.line) {
      board.create("line", [vars[key], vars[options.line.point]], options.line);
    }
  });
  if (!funcStr.length) {
    return;
  }
  try {
    // Compile the function string safely using mathjs
    const parsedFunction = compile(funcStr);
    const f = board.create("functiongraph", [
      (x) => {
        const props = { x };
        Object.keys(vars).forEach((key) => {
          if (vars[key].elType === "point" || vars[key].elType === "glider") {
            props[key] = { x: vars[key].X(), y: vars[key].Y() };
          } else if (vars[key].elType === "slider") {
            props[key] = vars[key].Value();
          }
        });
        return parsedFunction.evaluate(props);
      },
    ]);
    Object.keys(props.controls).forEach((key) => {
      const {
        type,
        settings,
        position = [],
        options = {},
      } = props.controls[key];
      if (type === "glider") {
        vars[key] = board.create(type, [...position, f], {
          name: key,
          ...settings,
        });
        if (options.tangent) {
          board.create("tangent", [vars[key]], options.tangent);
        }
        if (options.line) {
          board.create("line", [vars[key], options.line.point], options.line);
        }
      }
    });
  } catch (e) {
    console.warn("Invalid function string", e.message);
  }
};

// Watch for changes in the functionString prop and re-render the board
watch(
  () => props.functionString,
  (newVal) => {
    nextTick(() => renderBoard(newVal));
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (board) {
    JXG.JSXGraph.freeBoard(board);
  }
});
</script>

<style scoped>
.jxgbox {
  width: 100%;
  height: 500px;
}
</style>
