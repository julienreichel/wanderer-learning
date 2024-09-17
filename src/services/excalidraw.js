import { uid } from "quasar";

import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

const DEFAULT_OPTS = {
  roughness: 1,
  opacity: 100,
  angle: 0,
  strokeWidth: 2,
  strokeStyle: "solid",
  strokeColor: "#1e1e1e",
  roundness: null,
};

const DEFAULT_FILLED_OPTS = {
  strokeWidth: 1,
  fillStyle: "solid",
  backgroundColor: "transparent",
};

const TEXT_X_OFFEST = 150;
const TEXT_Y_OFFEST = 12.5;

const DEFAULT_TEXT_OPTS = {
  fontSize: 20,
  fontFamily: 1,
  textAlign: "center",
  verticalAlign: "middle",
  autoResize: false,
  lineHeight: 1.25,
  width: TEXT_X_OFFEST * 2,
  height: TEXT_Y_OFFEST * 2,
};

const COLORS = [
  "#ffec99",
  "#ffc9c9",
  "#a5d8ff",
  "#b2f2bb",
  "#d0bfff",
  "#eaddd7",
  "#e9ecef",
];

const point = (angle, radius) => {
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
};

export default class ExcalidrawService {
  constructor() {
    this["mermaid - mindmap"] = this.mermaid;
    this["mermaid - sequence"] = this.mermaid;
    this["mermaid - flowchart"] = this.mermaid;
  }

  /**
   *
   * @param {object} opts
   * @params {number} opts.x
   * @params {number} opts.y
   * @params {number} opts.width
   * @params {number} opts.height
   * @params {number} [opts.angle]
   * @params {number} [opts.strokeWidth]
   * @params {string} [opts.strokeStyle]
   * @params {string} [opts.strokeColor]
   * @params {string} [opts.fillStyle]
   * @params {string} [opts.backgroundColor]
   * @params {number} [opts.roughness]
   * @params {number} [opts.opacity]
   * @returns {object}
   */
  circle(opts) {
    return {
      ...DEFAULT_OPTS,
      ...DEFAULT_FILLED_OPTS,
      ...opts,
      type: "ellipse",
      id: uid(),
    };
  }

  /**
   *
   * @param {object} opts
   * @params {number} opts.x
   * @params {number} opts.y
   * @params {number} opts.width
   * @params {number} opts.height
   * @params {number} [opts.angle]
   * @params {number} [opts.strokeWidth]
   * @params {string} [opts.strokeStyle]
   * @params {string} [opts.strokeColor]
   * @params {string} [opts.fillStyle]
   * @params {string} [opts.backgroundColor]
   * @params {number} [opts.roughness]
   * @params {number} [opts.opacity]
   * @returns {object}
   */
  rectangle(opts) {
    return {
      ...DEFAULT_OPTS,
      ...DEFAULT_FILLED_OPTS,
      ...opts,
      type: "rectangle",
      id: uid(),
    };
  }

  /**
   *
   * @param {object} opts
   * @params {array} opts.points
   * @params {number} opts.x
   * @params {number} opts.y
   * @params {number} [opts.angle]
   * @params {number} [opts.strokeWidth]
   * @params {string} [opts.strokeStyle]
   * @params {string} [opts.strokeColor]
   * @params {number} [opts.roughness]
   * @params {number} [opts.opacity]
   * @returns {object}
   */
  line(opts) {
    return {
      ...DEFAULT_OPTS,
      ...opts,
      type: "line",
      id: uid(),
    };
  }

  /**
   *
   * @param {object} opts
   * @params {number} opts.x
   * @params {number} opts.y
   * @params {array} opts.points
   * @params {number} [opts.startArrowhead] (default: null)
   * @params {number} [opts.endArrowhead] (default: "arrow")
   * @params {number} [opts.angle]
   * @params {number} [opts.strokeWidth]
   * @params {string} [opts.strokeStyle]
   * @params {string} [opts.strokeColor]
   * @params {number} [opts.roughness]
   * @params {number} [opts.opacity]
   * @returns {object}
   */
  arrow(opts) {
    return {
      ...DEFAULT_OPTS,
      startArrowhead: null,
      endArrowhead: "arrow",
      ...opts,
      type: "arrow",
      id: uid(),
    };
  }

  /**
   *
   * @param {object} opts
   * @params {number} opts.x
   * @params {number} opts.y
   * @params {number} opts.width
   * @params {number} opts.height
   * @params {number} opts.text
   * @params {number} [opts.angle]
   * @params {number} [opts.strokeWidth]
   * @params {string} [opts.strokeStyle]
   * @params {string} [opts.strokeColor]
   * @params {number} [opts.roughness]
   * @params {number} [opts.opacity]
   * @returns {object}
   * @returns
   */
  text(opts) {
    return {
      ...DEFAULT_OPTS,
      ...DEFAULT_TEXT_OPTS,
      originalText: opts.text,
      ...opts,
      type: "text",
      id: uid(),
    };
  }

  /**
   * @param {object} opts
   * @params {array} opts.text
   * @returns {array}
   */

  bullseye(opts) {
    const levels = Math.min(7, opts.text.length || 3);
    const circleSize = 400;
    const circleStep = 100 - (levels - 3) * 10;

    const ox = 300;
    const oy = 120;

    let elements = [];
    for (let i = 0; i < levels; i++) {
      elements.push(
        this.circle({
          x: ox + (i * circleStep) / 2,
          y: oy + (i * circleStep) / 2,
          width: circleSize - i * circleStep,
          height: circleSize - i * circleStep,
          backgroundColor: COLORS[levels - i - 1],
        }),
      );
    }
    let vy = circleStep;
    for (let i = 0; i < levels; i++) {
      // add line toward the circle
      if (i === levels - 1) {
        vy = circleSize / 2 - i * circleStep - 10;
      }
      elements.push(
        this.line({
          x: ox - 60,
          y: oy + circleSize - i * circleStep - 20,
          points: [
            [0, 0],
            [90 + (i * circleStep) / 2, -vy],
          ],
        }),
      );
      vy -= circleStep / 1.5;
    }
    for (let i = 0; i < levels; i++) {
      // let add text
      elements.push(
        this.text({
          x: ox - 60 - TEXT_X_OFFEST * 2 - 10,
          y: oy + circleSize - i * circleStep - 20 - TEXT_Y_OFFEST,
          text: opts.text[levels - i - 1],
          textAlign: "right",
        }),
      );
    }

    return { elements };
  }

  /**
   * @param {object} opts
   * @params {array} opts.text
   * @returns {array}
   */
  podium(opts) {
    let elements = [];
    const pudiumWidth = 200;
    const pudiumHeight = 200;
    const pudiumStep = 60;

    const ox = 160;
    const oy = 160;

    // winner
    elements.push(
      this.rectangle({
        x: ox + pudiumWidth,
        y: oy,
        width: pudiumWidth,
        height: pudiumHeight,
        backgroundColor: COLORS[0],
      }),
    );
    elements.push(
      this.text({
        x: ox + pudiumWidth,
        y: oy - 30,
        width: pudiumWidth,
        height: 25,
        text: opts.text[0],
      }),
    );

    //silver
    elements.push(
      this.rectangle({
        x: ox,
        y: oy + pudiumStep,
        width: pudiumWidth,
        height: pudiumHeight - pudiumStep,
        backgroundColor: COLORS[1],
      }),
    );
    elements.push(
      this.text({
        x: ox,
        y: oy + pudiumStep - 30,
        width: pudiumWidth,
        text: opts.text[1],
      }),
    );

    //bronze
    elements.push(
      this.rectangle({
        x: ox + 2 * pudiumWidth,
        y: oy + 2 * pudiumStep,
        width: pudiumWidth,
        height: pudiumHeight - 2 * pudiumStep,
        backgroundColor: COLORS[2],
      }),
    );
    elements.push(
      this.text({
        x: ox + 2 * pudiumWidth,
        y: oy + 2 * pudiumStep - 30,
        width: pudiumWidth,
        text: opts.text[2],
      }),
    );

    return { elements };
  }

  /**
   * @param {object} opts
   * @params {array} opts.text
   * @returns {array}
   */
  timeline(opts) {
    const levels = opts.text.length;
    let elements = [];
    const ox = 170;
    const oy = 220;

    const timelineLength = 500;
    const lineOffset = timelineLength / (levels + 1);
    const dashLenght = 50;

    // the main arrow
    elements.push(
      this.arrow({
        x: ox,
        y: oy,
        points: [
          [0, 0],
          [timelineLength + lineOffset / 2, 0],
        ],
        strokeWidth: 4,
      }),
    );

    for (let i = 0; i < levels; i++) {
      const height = ((i % 2) * 2 - 1) * dashLenght;
      elements.push(
        this.line({
          x: ox + (i + 1) * lineOffset,
          y: oy,
          points: [
            [0, 0],
            [0, height],
          ],
          strokeWidth: 2,
        }),
      );

      elements.push(
        this.text({
          x: ox + (i + 1) * lineOffset - TEXT_X_OFFEST,
          y: oy + height + ((i % 2) - 1) * 25,
          text: opts.text[i],
        }),
      );
    }
    return { elements };
  }

  /**
   * @param {object} opts
   * @params {array} opts.text
   * @returns {array}
   */
  pyramid(opts) {
    let elements = [];
    const ox = 280;
    const oy = 160;

    const levels = opts.text.length;

    /// draw a triangle for the top element and then losanges for the rest
    const triangleSize = 350;

    // the intial tiangle is twice the height of the losanges
    const triangleHeight = triangleSize / (levels + 1);

    const offset = triangleHeight / Math.sqrt(3);
    let width = 2 * offset;
    elements.push(
      this.line({
        x: ox + triangleSize / 2,
        y: oy,
        points: [
          [0, 0],
          [offset * 2, triangleHeight * 2],
          [-2 * offset, triangleHeight * 2],
          [0, 0],
        ],
        backgroundColor: COLORS[0],
      }),
    );
    elements.push(
      this.text({
        x: ox + triangleSize / 2 - TEXT_X_OFFEST,
        y: oy + triangleHeight * 1.5 - TEXT_Y_OFFEST,
        text: opts.text[0],
        textAlign: "center",
      }),
    );

    for (let i = 1; i < levels; i++) {
      width += 2 * offset + 7;
      elements.push(
        this.line({
          x: ox + triangleSize / 2,
          y: oy + (triangleHeight + 10) * i + triangleHeight,
          points: [
            [0, 0],
            [width / 2, 0],
            [width / 2 + offset, triangleHeight],
            [-width / 2 - offset, triangleHeight],
            [-width / 2, 0],
            [0, 0],
          ],
          backgroundColor: COLORS[i],
        }),
      );
      elements.push(
        this.text({
          x: ox + triangleSize / 2 - width / 2,
          y:
            oy +
            (triangleHeight + 10) * i +
            triangleHeight * 1.5 -
            TEXT_Y_OFFEST,
          width: width,
          text: opts.text[i],
          textAlign: "center",
        }),
      );
    }

    return { elements };
  }

  /**
   * @param {object} opts
   * @params {array} opts.text
   * @params {object} opts.axis
   * @params {array} opts.axis.x
   * @params {array} opts.axis.y
   * @returns {array}
   */
  matrix(opts) {
    let elements = [];
    const matrixSize = 500;

    const ox = 200 + matrixSize / 2;
    const oy = 160 + matrixSize / 2;

    // the x axis
    elements.push(
      this.arrow({
        x: ox,
        y: oy,
        points: [
          [-matrixSize / 2, 0],
          [matrixSize / 2, 0],
        ],
        startArrowhead: "arrow",
        endArrowhead: "arrow",
      }),
    );

    elements.push(
      this.text({
        x: ox - matrixSize / 2 - 10 - TEXT_X_OFFEST * 2,
        y: oy - TEXT_Y_OFFEST,
        text: opts.axis?.x?.[0],
        textAlign: "right",
      }),
    );
    elements.push(
      this.text({
        x: ox + matrixSize / 2 + 10,
        y: oy - TEXT_Y_OFFEST,
        text: opts.axis?.x?.[1],
        textAlign: "left",
      }),
    );

    // the y axis
    elements.push(
      this.arrow({
        x: ox,
        y: oy,
        points: [
          [0, -matrixSize / 2],
          [0, matrixSize / 2],
        ],
        startArrowhead: "arrow",
        endArrowhead: "arrow",
      }),
    );
    elements.push(
      this.text({
        x: ox - TEXT_X_OFFEST,
        y: oy - matrixSize / 2 - 10 - TEXT_Y_OFFEST * 2,
        text: opts.axis?.y?.[0],
        textAlign: "center",
      }),
    );
    elements.push(
      this.text({
        x: ox - TEXT_X_OFFEST,
        y: oy + matrixSize / 2 + 10,
        text: opts.axis?.y?.[1],
        textAlign: "center",
      }),
    );

    // the four squares
    const space = 30;
    const squareSize = matrixSize / 2 - space * 2;
    let idx = 0;
    for (let y = -1; y < 1; y++) {
      for (let x = -1; x < 1; x++) {
        elements.push(
          this.rectangle({
            x: ox + x * (squareSize + space * 2) + space,
            y: oy + y * (squareSize + space * 2) + space,
            width: squareSize,
            height: squareSize,
            backgroundColor: COLORS[idx],
            roundness: {
              type: 3,
            },
          }),
        );
        elements.push(
          this.text({
            x: ox + x * (squareSize + space * 2) + space,
            y:
              oy +
              y * (squareSize + space * 2) +
              squareSize / 2 +
              space -
              TEXT_Y_OFFEST,
            width: squareSize,
            text: opts.text[idx],
            textAlign: "center",
          }),
        );
        idx++;
      }
    }

    return { elements };
  }

  /**
   * @param {object} opts
   * @params {array} opts.text
   * @returns {array}
   */
  funnel(opts) {
    let elements = [];

    const figureSize = 400;
    const ox = 260 + figureSize / 2;
    const oy = 160;

    const levels = opts.text.length;

    const itemHeight = figureSize / levels;

    let width = figureSize + levels * 10;
    let offset = itemHeight / 1.5;

    for (let i = 0; i < levels; i++) {
      elements.push(
        this.line({
          x: ox,
          y: oy + (itemHeight + 10) * i,
          points: [
            [-width / 2, 0],
            [width / 2, 0],
            [width / 2 - offset, itemHeight],
            [-width / 2 + offset, itemHeight],
            [-width / 2, 0],
          ],
          backgroundColor: COLORS[i],
        }),
      );
      width -= 2 * offset + 5;
      offset *= 0.5 + levels / 20;
      elements.push(
        this.text({
          x: ox - width / 2,
          y: oy + (itemHeight + 10) * i + itemHeight * 0.5 - TEXT_Y_OFFEST,
          width: width,
          text: opts.text[i],
          textAlign: "center",
        }),
      );
    }

    return { elements };
  }

  /**
   * @param {object} opts
   * @params {array} opts.text
   * @returns {array}
   */
  cycle(opts) {
    let elements = [];
    const innerCircleRadius = 75;
    const outterCircleRadius = 200;

    const ox = 320 + outterCircleRadius / 2;
    const oy = 220 + outterCircleRadius / 2;
    const levels = opts.text.length;

    // The drwaing is based on 2 cicles centered at (ox, oy)

    const middleCircelRadius =
      (innerCircleRadius * 2 + outterCircleRadius * 3) / 5;

    const angleStep = (2 * Math.PI) / levels; // The angle between each point
    const angelOffset = (2 * Math.PI) / 15; // The offset to start from the top

    // Draw a line from the center circle to the outter circle
    // then move by the angle step
    // then draw a line from the outter circle to the center circle
    for (let i = 0; i < levels; i++) {
      const offset = point(i * angleStep + angleStep / 2, 15);
      elements.push(
        this.line({
          x: ox + offset[0],
          y: oy + offset[1],
          points: [
            point(i * angleStep, innerCircleRadius),
            point(i * angleStep + angelOffset, middleCircelRadius),
            point(i * angleStep, outterCircleRadius),
            point((i + 0.25) * angleStep, outterCircleRadius),
            point((i + 0.5) * angleStep, outterCircleRadius),
            point((i + 0.75) * angleStep, outterCircleRadius),
            point((i + 1) * angleStep, outterCircleRadius),
            point((i + 1) * angleStep + angelOffset, middleCircelRadius),
            point((i + 1) * angleStep, innerCircleRadius),
            point((i + 0.75) * angleStep, innerCircleRadius),
            point((i + 0.5) * angleStep, innerCircleRadius),
            point((i + 0.25) * angleStep, innerCircleRadius),
            point(i * angleStep, innerCircleRadius),
          ],
          roundness: {
            type: 3,
          },
          backgroundColor: COLORS[i],
        }),
      );
      const textCenter = point(
        i * angleStep + angleStep / 3 + angelOffset,
        (innerCircleRadius + outterCircleRadius) / 2,
      );
      elements.push(
        this.text({
          x: ox + textCenter[0] + offset[0] - TEXT_X_OFFEST,
          y: oy + textCenter[1] + offset[1] - TEXT_Y_OFFEST,
          text: opts.text[i],
          textAlign: "center",
        }),
      );
    }
    return { elements };
  }

  /**
   * @param {object} opts
   * @params {array} opts.text
   * @params {text} opts.base
   * @params {text} opts.roof
   * @returns {array}
   */
  pillars(opts) {
    let elements = [];
    const templleWidth = 500;
    const columnHeight = 300;
    const roofHeight = 100;
    const baseHeight = 40;

    const ox = 200;
    const oy = 120;
    const levels = opts.text.length;

    // draw the base
    elements.push(
      this.rectangle({
        x: ox,
        y: oy + columnHeight + roofHeight + baseHeight,
        width: templleWidth,
        height: baseHeight,
        backgroundColor: COLORS[0],
      }),
    );
    elements.push(
      this.text({
        x: ox,
        y: oy + columnHeight + roofHeight + baseHeight * 1.5 - TEXT_Y_OFFEST,
        width: templleWidth,
        text: opts.base,
        textAlign: "center",
      }),
    );

    // draw the roof
    elements.push(
      this.rectangle({
        x: ox,
        y: oy + roofHeight,
        width: templleWidth,
        height: baseHeight,
        backgroundColor: COLORS[0],
      }),
    );

    elements.push(
      this.line({
        x: ox,
        y: oy,
        points: [
          [templleWidth / 2, 0],
          [templleWidth + 20, roofHeight],
          [-20, roofHeight],
          [templleWidth / 2, 0],
        ],
        backgroundColor: COLORS[0],
      }),
    );
    elements.push(
      this.text({
        x: ox,
        y: oy + roofHeight - baseHeight / 2 - TEXT_Y_OFFEST,
        width: templleWidth,
        text: opts.roof,
        textAlign: "center",
      }),
    );

    // draw the columns
    const space = templleWidth / levels / 4;
    const columnWidth = templleWidth / levels - space;
    for (let i = 0; i < levels; i++) {
      elements.push(
        this.rectangle({
          x: ox + i * (columnWidth + space) + space / 2,
          y: oy + roofHeight + baseHeight,
          width: columnWidth,
          height: columnHeight,
          backgroundColor: COLORS[i + 1],
        }),
      );
      elements.push(
        this.text({
          x:
            ox +
            i * (columnWidth + space) +
            space / 2 +
            columnWidth / 2 -
            columnHeight / 2,
          y: oy + roofHeight + baseHeight + columnHeight / 2,
          width: columnHeight,
          text: opts.text[i],
          angle: Math.PI / 2,
          textAlign: "center",
        }),
      );
    }
    return { elements };
  }

  /**
   * @param {object} opts
   * @params {array} opts.text
   * @returns {array}
   */
  staircases(opts) {
    let elements = [];
    const stepsHeight = 300;
    const stepsWidth = 500;

    const ox = 200;
    const oy = 120;
    const levels = opts.text.length;

    const stepHeight = stepsHeight / levels;
    const stepWidth = stepsWidth / (levels + 1);
    // draw each start starting from the base
    for (let i = 0; i < levels; i++) {
      elements.push(
        this.rectangle({
          x: ox + i * stepWidth,
          y: oy + stepsHeight - (i + 1) * stepHeight,
          width: (levels - i + 1) * stepWidth,
          height: stepHeight,
          backgroundColor: COLORS[i],
        }),
      );
      elements.push(
        this.text({
          x: ox + i * stepWidth + 15,
          y:
            oy +
            stepsHeight -
            (i + 1) * stepHeight +
            stepHeight / 2 -
            TEXT_Y_OFFEST,
          width: (levels - i + 1) * stepWidth - 25,
          text: opts.text[i],
          textAlign: "left",
        }),
      );
    }
    return { elements };
  }

  /**
   * @param {object} opts
   * @params {text} opts.text
   * @returns {array}
   */
  async mermaid(opts) {
    const mermaidSyntax = opts.text;
    const ox = 200;
    const oy = 120;

    try {
      const { elements, files } = await parseMermaidToExcalidraw(
        mermaidSyntax,
        {
          ...DEFAULT_TEXT_OPTS,
        },
      );
      elements.forEach((element) => {
        element.x += ox;
        element.y += oy;
      });
      const excalidrawElements = convertToExcalidrawElements(elements);
      // Render elements and files on Excalidraw
      return { elements: excalidrawElements, files };
    } catch (e) {
      // Parse error, displaying error message to users
      return [];
    }
  }

  /**
   * @param {object} opts
   * @params {object[]} opts.bars
   * @params {number} opts.basrs[].value
   * @params {text} opts.basrs[].text
   * @params {object} opts.axis
   * @params {array} opts.axis.x
   * @params {array} opts.axis.y
   * @returns {array}
   */
  async bars(opts) {
    let elements = [];

    const graphSize = 400;
    const ox = 200;
    const oy = 140;
    const levels = opts.bars.length;

    // the x axis
    elements.push(
      this.arrow({
        x: ox,
        y: oy + graphSize,
        points: [
          [0, 0],
          [graphSize, 0],
        ],
      }),
    );

    elements.push(
      this.text({
        x: ox + graphSize + 10,
        y: oy + graphSize - TEXT_Y_OFFEST,
        text: opts.axis?.x,
        textAlign: "left",
      }),
    );

    // the y axis
    elements.push(
      this.arrow({
        x: ox,
        y: oy + graphSize,
        points: [
          [0, 0],
          [0, -graphSize],
        ],
      }),
    );
    elements.push(
      this.text({
        x: ox - TEXT_X_OFFEST,
        y: oy - TEXT_Y_OFFEST * 2 - 10,
        text: opts.axis?.y,
        textAlign: "center",
      }),
    );

    // the bars
    const space = 15;
    const barSize = graphSize * 0.9;
    const delta = graphSize - barSize;
    const barHeight = (barSize - (levels + 1) * space) / levels;
    const maxValue = Math.max(...opts.bars.map((bar) => bar.value));
    for (let i = 0; i < levels; i++) {
      elements.push(
        this.rectangle({
          x: ox,
          y: oy + delta + (i + 1) * space + i * barHeight,
          width: (opts.bars[i].value / maxValue) * barSize,
          height: barHeight,
          backgroundColor: COLORS[i],
        }),
      );
      if (opts.bars[i].value < maxValue / 3) {
        elements.push(
          this.text({
            x: ox + (opts.bars[i].value / maxValue) * barSize + 15,
            y:
              oy +
              delta +
              (i + 1) * space +
              (i + 0.5) * barHeight -
              TEXT_Y_OFFEST,
            width: barSize - (opts.bars[i].value / maxValue) * barSize,
            text: opts.bars[i].text,
            textAlign: "left",
          }),
        );
      } else {
        elements.push(
          this.text({
            x: ox + 15,
            y:
              oy +
              delta +
              (i + 1) * space +
              (i + 0.5) * barHeight -
              TEXT_Y_OFFEST,
            width: (opts.bars[i].value / maxValue) * barSize,
            text: opts.bars[i].text,
            textAlign: "left",
          }),
        );
      }
    }

    return { elements };
  }
}
