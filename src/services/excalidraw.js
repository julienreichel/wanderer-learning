import { uid } from 'quasar'

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
  fillStyle: "solid",
  backgroundColor: "transparent",
};

const DEFAULT_TEXT_OPTS = {
  fontSize: 20,
  fontFamily: 1,
  textAlign: "center",
  verticalAlign: "middle",
  autoResize: false,
  lineHeight: 1.25
};

const COLORS = [
  '#ffec99',
  '#ffc9c9',
  '#a5d8ff',
  '#b2f2bb',
  '#d0bfff',
  '#eaddd7',
  '#e9ecef',
];

export default class ExcalidrawService {
  constructor() {
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

  bullsEyes(opts) {

    const levels = Math.min(7, opts.text.length || 3);
    const circleSize = 400;
    const circleStep = 100 - (levels - 3) * 10;

    const ox = 300;
    const oy = 120;

    let elements = [];
    for (let i = 0; i < levels; i++) {
      elements.push(this.circle({
        x: ox + i * circleStep / 2,
        y: oy + i * circleStep / 2,
        width: circleSize - i * circleStep,
        height: circleSize - i * circleStep,
        backgroundColor: COLORS[levels - i - 1],
      }));
    }
    let vy = circleStep
    for (let i = 0; i < levels; i++) {
      // add line toward the circle
      if (i === levels - 1) {
        vy = circleSize / 2 - i * circleStep - 10;
      }
      elements.push(this.line({
        x: ox - 60,
        y: oy + circleSize - i * circleStep - 20,
        points: [
          [0, 0],
          [90 + i * circleStep / 2, - vy],
        ],
      }));
      vy -= circleStep / 1.5;
    }
    for (let i = 0; i < levels; i++) {
      // let add text
      elements.push(this.text({
        x: ox - 60 - 150 - 10,
        y: oy + circleSize - i * circleStep - 20 - 12.5,
        width: 150,
        height: 25,
        text: opts.text[levels - i - 1],
        textAlign: 'right',
      }));
    }

    return elements;
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
    elements.push(this.rectangle({
      x: ox + pudiumWidth,
      y: oy,
      width: pudiumWidth,
      height: pudiumHeight,
      backgroundColor: COLORS[0],
    }));
    elements.push(this.text({
      x: ox + pudiumWidth,
      y: oy - 30,
      width: pudiumWidth,
      height: 25,
      text: opts.text[0]
    }));

    //silver
    elements.push(this.rectangle({
      x: ox,
      y: oy + pudiumStep,
      width: pudiumWidth,
      height: pudiumHeight - pudiumStep,
      backgroundColor: COLORS[1],
    }));
    elements.push(this.text({
      x: ox,
      y: oy + pudiumStep - 30,
      width: pudiumWidth,
      height: 25,
      text: opts.text[1]
    }));

    //bronze
    elements.push(this.rectangle({
      x: ox + 2 * pudiumWidth,
      y: oy + 2 * pudiumStep,
      width: pudiumWidth,
      height: pudiumHeight - 2 * pudiumStep,
      backgroundColor: COLORS[2],
    }));
    elements.push(this.text({
      x: ox + 2 * pudiumWidth,
      y: oy + 2 * pudiumStep - 30,
      width: pudiumWidth,
      height: 25,
      text: opts.text[2]
    }));

    return elements;
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
    elements.push(this.arrow({
      x: ox,
      y: oy,
      points: [
        [0, 0],
        [timelineLength + lineOffset / 2, 0],
      ],
      strokeWidth: 4
    }));

    for (let i = 0; i < levels; i++) {
      const height = ((i % 2) * 2 - 1) * dashLenght;
      elements.push(this.line({
        x: ox + (i + 1) * lineOffset,
        y: oy,
        points: [
          [0, 0],
          [0, height],
        ],
        strokeWidth: 2
      }));

      elements.push(this.text({
        x: ox + (i + 1) * lineOffset - 75,
        y: oy + height + ((i % 2) - 1) * 25,
        width: 150,
        height: 25,
        text: opts.text[i],
      }));
    }
    return elements;
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
    elements.push(this.line({
      x: ox + triangleSize / 2,
      y: oy,
      points: [
        [0, 0],
        [offset * 2, triangleHeight * 2],
        [- 2 * offset, triangleHeight * 2],
        [0, 0],
      ],
      backgroundColor: COLORS[0],
    }));
    elements.push(this.text({
      x: ox + triangleSize / 2 - width / 2,
      y: oy + triangleHeight * 1.5 - 12.5,
      width: width,
      height: 25,
      text: opts.text[0],
      textAlign: 'center',
    }));

    for (let i = 1; i < levels; i++) {
      width += 2 * offset;
      elements.push(this.line({
        x: ox + triangleSize / 2,
        y: oy + (triangleHeight + 10) * i + triangleHeight,
        points: [
          [0, 0],
          [width / 2, 0],
          [width / 2 + offset, triangleHeight],
          [- width / 2 - offset, triangleHeight],
          [- width / 2, 0],
          [0, 0]
        ],
        backgroundColor: COLORS[i],
      }));
      elements.push(this.text({
        x: ox + triangleSize / 2 - width / 2,
        y: oy + (triangleHeight + 10) * i + triangleHeight * 1.5 - 12.5,
        width: width,
        height: 25,
        text: opts.text[i],
        textAlign: 'center',
      }));


    }

    return elements;
  }
}
