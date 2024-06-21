import { generateClient } from "aws-amplify/data";
import concepts from "./prompts/concepts.js";
import toc from "./prompts/toc.js";
import connectQuiz from "./prompts/connectQuiz.js";
import connectText from "./prompts/connectText.js";
import conceptsQuiz from "./prompts/conceptsQuiz.js";
import conceptsText from "./prompts/conceptsText.js";
import conceptsTextHtml from "./prompts/conceptsTextHtml.js";
import conceptsTextHtmlIntro from "./prompts/conceptsTextHtmlIntro.js";
import practiceQuiz from "./prompts/finalQuiz.js";

import { post } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";

export default class ServicePrototype {
  constructor() {
    /**
     * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
     */
    this.client = generateClient();

    this.model = null;
    this.style = `Richard Feldman Style: Engaging and practical teaching style. Focus on practical and Hands-On Learning, simplifying complex concepts, iterative Learning and encouraging exploration and experimentation.`;
    this.audience = `General readership.`;
    this.tone = `Enthusiastic and engaging with a touch of humour.`;
    this.model = "gpt-3.5-turbo";
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
      this.language = { 'en-US': 'English', 'fr-FR': 'French' }[options.locale] || "English";
    }
  }

  async query(query, retryCount = 0) {
    console.log(query.system);
    console.log(query.prompt);

    query.model = query.model || this.model;
    try {
      const authSession = await fetchAuthSession();
      const authToken = authSession.tokens?.idToken;

      const restOperation = post({
        apiName: "aiHttpApi",
        path: "ai-query",
        options: {
          body: query,
          headers: {
            Authorization: authToken
          }
        },
      });

      const { body } = await restOperation.response;
      const response = await body.json();
      console.log(response.model, response.usage);

      const data = response.choices[0].message.content.trim();
      console.log(data);

      if (query.format === "text") {
        return data;
      }
      return JSON.parse(data);
    } catch (error) {
      console.log(error);
      if (retryCount === 0) {
        // let's try again, maybe it was a temporary issue
        return this.query(query, retryCount + 1);
      }
      return {};
    }
  }

  async getConcepts(description, previousConcepts) {
    let system;
    if (previousConcepts && previousConcepts.length > 0) {
      const conceptsStr = previousConcepts.map(({ name }) => name).join(", ");
      system = concepts.systemWithConcepts(
        this.style,
        this.tone,
        this.audience,
        this.prerequisites,
        conceptsStr,
        this.language
      );
    } else {
      system = concepts.system(
        this.style,
        this.tone,
        this.audience,
        this.prerequisites,
        this.language
      );
    }

    const prompt = concepts.prompt(description);

    return this.query({ system, prompt, token: 500 });
  }

  async getTableOfContent(description, concepts, objectives, previousToc) {
    const conceptsList = concepts
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");

    const objectivesList = objectives.join("\n");

    let system;
    if (previousToc && previousToc.length > 0) {
      const tocList = previousToc
        .map(
          ({ name, items }) =>
            name +
            "\n" +
            items
              .map(({ name, description }) => `- ${name}: ${description}`)
              .join("\n"),
        )
        .join("\n");
      system = toc.systemWithToc(
        this.style,
        this.tone,
        this.audience,
        this.prerequisites,
        tocList,
        this.language
      );
    } else {
      system = toc.system(
        this.style,
        this.tone,
        this.audience,
        this.prerequisites,
        this.language
      );
    }

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
      this.language
    );
    const prompt = connectQuiz.prompt(description, conceptsList, nbQuestions);

    return this.query({ system, prompt, token: nbQuestions * 200 });
  }

  async getInitialContent(description, concepts, objectives) {
    const conceptsList = concepts
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");
    const objectivesList = objectives.join("\n");

    const system = connectText.system(this.style, this.tone, this.audience, this.language);
    const prompt = connectText.prompt(
      description,
      conceptsList,
      objectivesList,
    );

    return this.query({ system, prompt, token: 2000 });
  }

  async getConceptQuiz(section, nbQuestions = 10) {
    const sectionName = section.name;
    const sectionItems = section.items
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");

    const system = conceptsQuiz.system(this.style, this.tone, this.audience, this.language);
    const prompt = conceptsQuiz.prompt(sectionName, sectionItems, nbQuestions, this.language);

    return this.query({ system, prompt, token: nbQuestions * 200 });
  }

  async getConceptContent(section, useHtmlQuery = false) {
    if (useHtmlQuery) {
      let pages = [];
      let system = conceptsTextHtmlIntro.system(
        this.style,
        this.tone,
        this.audience,
        this.prerequisites,
        this.language
      );
      let prompt = conceptsTextHtmlIntro.prompt(section);

      let html = await this.query({
        system,
        prompt,
        token: 2000,
        format: "text",
      });
      // remove starting "```html" and ending "```" if present
      html = html.replace(/^```html\n/, "").replace(/\n```$/, "");
      pages.push(html);

      for (let i = 0; i < section.items.length; i++) {
        system = conceptsTextHtml.system(
          this.style,
          this.tone,
          this.audience,
          this.prerequisites,
        );
        prompt = conceptsTextHtml.prompt(section, i);
        let html = await this.query({
          system,
          prompt,
          token: 2000,
          format: "text",
        });
        // remove starting "```html" and ending "```" if present
        html = html.replace(/^```html\n/, "").replace(/\n```$/, "");
        pages.push(html);
      }

      return { pages };
    } else {
      const system = conceptsText.system(
        this.style,
        this.tone,
        this.audience,
        this.prerequisites,
        this.language
      );
      const prompt = conceptsText.prompt(section);

      return this.query({ system, prompt, token: 4000, model: "gpt-4o" });
    }
  }

  async getFinalQuiz(description, concepts, objectives, toc, nbQuestions = 10) {
    const conceptsList = concepts
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");
    const objectivesList = objectives.join("\n");

    const tocList = toc
      .map(
        ({ name, items }) =>
          name +
          "\n" +
          items
            .map(({ name, description }) => `- ${name}: ${description}`)
            .join("\n"),
      )
      .join("\n");

    const system = practiceQuiz.system(this.style, this.tone, this.audience, this.language);
    const prompt = practiceQuiz.prompt(
      description,
      conceptsList,
      objectivesList,
      tocList,
      nbQuestions,
    );

    return this.query({ system, prompt, token: nbQuestions * 200 });
  }
}
