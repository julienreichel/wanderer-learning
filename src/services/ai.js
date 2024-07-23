import { generateClient } from "aws-amplify/data";
import concepts from "./prompts/concepts.js";
import toc from "./prompts/toc.js";
import connectQuiz from "./prompts/connectQuiz.js";
import connectText from "./prompts/connectText.js";
import conceptsText from "./prompts/conceptsText.js";
import conceptsTextHtml from "./prompts/conceptsTextHtml.js";
import conceptsTextHtmlIntro from "./prompts/conceptsTextHtmlIntro.js";
import singleQuiz from "./prompts/singleQuiz.js";
import simpleQuiz from "./prompts/quiz.js";

import { marked } from "marked";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

import { useFormatter } from "src/composables/iris";

export default class ServicePrototype {
  constructor() {
    /**
     * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
     */
    this.client = generateClient();

    this.model = null;
    this.style = `Richard Feldman Style: Engaging and practical teaching style. Focus on practical and Hands-On Learning, simplifying complex concepts, iterative Learning and encouraging exploration and experimentation.`;
    this.audience =
      "General Public: Accessible and clear language, covering a broad range of topics, aiming to be informative and engaging for a wide audience without assuming prior specialized knowledge.";
    this.tone =
      "Educational: Informative, structured, and explanatory, providing detailed explanations and examples.";
    this.model = "gpt-4o-mini";
    this.prerequisites = [];
    this.language = "English";
  }

  setOptions(options = {}) {
    if (options.style && options.style !== "") this.style = options.style;
    if (options.model && options.model !== "") this.model = options.model;
    if (options.audience && options.audience !== "")
      this.audience = options.audience;
    if (options.tone) this.tone = options.tone;
    if (options.prerequisites) this.prerequisites = options.prerequisites;
    if (options.locale) {
      this.language =
        { "en-US": "English", "fr-FR": "French" }[options.locale] || "English";
    }
  }

  async query(query) {
    query.model = query.model || this.model;
    query.ttl = Math.floor(Date.now() / 1000) + 3600 * 24 * 7; // kep request for a week
    try {
      const { data } = await this.client.models.AIRequest.create(query, {
        authMode: "userPool",
      });
      const requestId = data.id;

      // now we wait, at most 300s, with backoff retry
      let totalWaitTime = 0;
      let waitTime = 2000;
      while (totalWaitTime < 300 * 1000) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        totalWaitTime += waitTime;
        waitTime = Math.min(waitTime + 1000, 10000);

        const { data } = await this.client.models.AIRequest.get(
          { id: requestId },
          { authMode: "userPool" },
        );
        if (data.finish_reason === "stop") {
          if (query.format === "text") {
            return data.content;
          }
          return JSON.parse(data.content);
        } else {
          if (data.finish_reason) {
            console.log("finish_reason", data.finish_reason, data.content);
          }
        }
      }
      return {};
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  async getConcepts(description, previousConcepts) {
    let conceptsStr;
    if (previousConcepts && previousConcepts.length > 0) {
      conceptsStr = previousConcepts.map(({ name }) => name).join(", ");
    }
    const system = concepts.system(
      this.style,
      this.tone,
      this.audience,
      this.prerequisites,
      conceptsStr,
      this.language,
    );
    const prompt = concepts.prompt(description);

    return this.query({ system, prompt, token: 500 });
  }

  async getTableOfContent(description, concepts, objectives, previousToc) {
    const conceptsList = concepts
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");

    const objectivesList = objectives.join("\n");

    let tocList;
    if (previousToc && previousToc.length > 0) {
      tocList = previousToc
        .map(
          ({ name, items }) =>
            name +
            "\n" +
            items
              .map(({ name, description }) => `- ${name}: ${description}`)
              .join("\n"),
        )
        .join("\n");
    }
    const system = toc.system(
      this.style,
      this.tone,
      this.audience,
      this.prerequisites,
      tocList,
      this.language,
      concepts.map(({ name }) => name),
    );

    const prompt = toc.prompt(description, conceptsList, objectivesList);

    return this.query({ system, prompt, token: 1000 });
  }

  async getInitialQuiz(description, concepts, nbQuestions = 10) {
    const conceptsList = concepts
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");

    const system = connectQuiz.system(
      this.style,
      this.tone,
      this.audience,
      this.prerequisites,
      this.language,
      concepts.map(({ name }) => name),
    );
    const prompt = connectQuiz.prompt(description, conceptsList, nbQuestions);

    return this.query({ system, prompt, token: nbQuestions * 250 });
  }

  async getInitialContent(description, concepts, objectives) {
    const conceptsList = concepts
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");
    const objectivesList = objectives.join("\n");

    const system = connectText.system(
      this.style,
      this.tone,
      this.audience,
      this.language,
    );
    const prompt = connectText.prompt(
      description,
      conceptsList,
      objectivesList,
    );

    return this.query({ system, prompt, token: 2000 });
  }

  async getConceptContent(section, useHtmlQuery = false) {
    const { htmlToMarkdown } = useFormatter();

    if (useHtmlQuery) {
      let pages = [];
      let system = conceptsTextHtmlIntro.system(
        this.style,
        this.tone,
        this.audience,
        this.prerequisites,
        this.language,
      );
      let prompt = conceptsTextHtmlIntro.prompt(section);

      let markdown = await this.query({
        system,
        prompt,
        token: 2000,
        format: "text",
      });
      // marked will replace \[ \] \( and \) by simply [ } ( ), so wee need to add an extra \ to escape it.
      markdown = markdown.replace(/\\([[\]()])/g, "\\\\$1");
      const html = marked.parse(markdown);
      pages.push(html);

      const introText = htmlToMarkdown(html);

      const contentPages = await Promise.all(
        section.items.map(async (item) => {
          system = conceptsTextHtml.system(
            this.style,
            this.tone,
            this.audience,
            this.prerequisites,
            this.language,
          );
          prompt = conceptsTextHtml.prompt(section, item, introText);
          let markdown = await this.query({
            system,
            prompt,
            token: 2000,
            format: "text",
          });
          // marked will replace \[ \] \( and \) by simply [ } ( ), so wee need to add an extra \ to escape it.
          markdown = markdown.replace(/\\([[\]()])/g, "\\\\$1");
          const html = marked.parse(markdown);
          return html;
        }),
      );
      pages.push(...contentPages);

      return { pages };
    } else {
      const system = conceptsText.system(
        this.style,
        this.tone,
        this.audience,
        this.prerequisites,
        this.language,
      );
      const prompt = conceptsText.prompt(section);

      return this.query({ system, prompt, token: 4000, model: "gpt-4o" });
    }
  }

  async singleQuiz(sectionName, sectionContent, difficulty = 3) {
    const system = singleQuiz.system(this.tone, this.language, difficulty);
    const prompt = singleQuiz.prompt(sectionName, sectionContent);

    return this.query({ system, prompt, token: 10 * 250 });
  }

  async getQuiz(descritpion, difficulty, nbQuestions, type, explanation) {
    const system = simpleQuiz.system(
      difficulty,
      nbQuestions,
      type,
      explanation,
      this.language,
    );
    const prompt = simpleQuiz.prompt(descritpion, nbQuestions);

    return this.query({ system, prompt, token: nbQuestions * 250 });
  }

  async extractTextFromPdfFile(pdfFile) {
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(pdfFile))
      .promise;
    const numPages = pdf.numPages;
    let tree = [];

    // first step, get some stats about the document using the first 3 pages.
    // Get the textsize (i.e. item.transform[0]) and create a small historgram
    // Identify the most common text size and use it as a threshold to split the text
    // identify the font size of the title and subtitle (only 2 levels of titles are supported)
    let fontSizeHistogram = {};
    for (let pageNum = 1; pageNum <= Math.min(numPages, 3); pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      textContent.items.forEach((item) => {
        const textSize = Math.round(item.height);
        if (textSize === 0) return;
        if (!fontSizeHistogram[textSize]) fontSizeHistogram[textSize] = 0;
        fontSizeHistogram[textSize] += item.str.length;
      });
    }
    // Find the most common text size anything bellow is also considered as text
    const mostCommonTextSize = Object.keys(fontSizeHistogram).reduce(
      (a, b) => (fontSizeHistogram[a] > fontSizeHistogram[b] ? a : b),
      0,
    );

    // find the 2 most commont text sizes above this one
    const titleTextSizes = Object.keys(fontSizeHistogram)
      .filter((size) => Number(size) > mostCommonTextSize)
      .sort((a, b) => fontSizeHistogram[b] - fontSizeHistogram[a])
      .slice(0, 2)
      .sort();

    let level = 0;
    let levels = [{ children: tree, lable: "" }];
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      // Extract the text content from the page
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();
      const headerFooterHeight = 40; // Assuming headers and footers are within 50 units of the top/bottom
      const items = textContent.items
        .filter((item) => {
          const y = item.transform[5]; // y-coordinate of the text item
          return (
            y > headerFooterHeight && y < viewport.height - headerFooterHeight
          );
        })
        .filter((item) => item.str.trim().length);

      let lastPos = -1;
      for (const item of items) {
        const pos = item.transform[5];
        const delta = Math.round(lastPos - pos);
        if (
          lastPos >= 0 &&
          (delta < mostCommonTextSize ||
            lastPos < pos ||
            item.str.trim().length < 3)
        ) {
          levels[level].label += " " + item.str.trim();
        } else {
          const height = Math.round(item.height);
          let branch = {
            label: item.str,
            children: [],
          };
          if (height <= mostCommonTextSize) {
            level = 3;
          } else if (height <= titleTextSizes[0]) {
            level = 2;
            levels[3] = undefined;
          } else {
            level = 1;
            levels[2] = undefined;
          }
          levels[level] = branch;
          if (levels[level - 1]) {
            levels[level - 1].children.push(branch);
          } else {
            if (level === 2) {
              tree.push(branch);
            } else {
              if (levels[1]) {
                levels[1].children.push(branch);
              } else {
                tree.push(branch);
              }
              levels[2] = branch;
            }
          }
        }
        lastPos = pos;
      }
    }
    return tree;
  }
}
