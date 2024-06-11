import { generateClient } from "aws-amplify/data";
import concepts from "./prompts/concepts.js";
import toc from "./prompts/toc.js";
import connectQuiz from "./prompts/connectQuiz.js";
import connectText from "./prompts/connectText.js";
import conceptsQuiz from "./prompts/conceptsQuiz.js";
import conceptsText from "./prompts/conceptsText.js";
import practiceQuiz from "./prompts/finalQuiz.js";

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
  }

  setOptions(options = {}) {
    if (options.style && options.style !== "") this.style = options.style;
    if (options.model && options.model !== "") this.model = options.model;
    if (options.audience && options.audience !== "") this.audience = options.audience;
    if (options.tone) this.tone = options.tone;
  }

  async query(query) {
    console.log(query.system);
    console.log(query.prompt);

    query.model = query.model || this.model;
    try {
      const { data, errors } = await this.client.queries.AIQuery(query, {
        authMode: "userPool",
      });
      if (errors) {
        console.error(errors);
        return {};
      }
      console.log(data);
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
      return {};
    }
  }

  async getConcepts(description) {
    const system = concepts.system(this.style, this.tone, this.audience);
    const prompt = concepts.prompt(description);

    return this.query({ system, prompt, token: 500 });
  }

  async getTableOfContent(description, concepts, objectives) {
    const conceptsList = concepts
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");
    const objectivesList = objectives.join("\n");

    const system = toc.system(this.style, this.tone, this.audience);
    const prompt = toc.prompt(description, conceptsList, objectivesList);

    return this.query({ system, prompt, token: 1000 });
  }

  async getInitialQuiz(description, concepts, nbQuestions = 10) {
    const conceptsList = concepts
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");

    const system = connectQuiz.system(this.style, this.tone, this.audience);
    const prompt = connectQuiz.prompt(description, conceptsList, nbQuestions);

    return this.query({ system, prompt, token: nbQuestions * 200 });
  }

  async getInitialContent(description, concepts, objectives) {
    const conceptsList = concepts
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");
    const objectivesList = objectives.join("\n");

    const system = connectText.system(this.style, this.tone, this.audience);
    const prompt = connectText.prompt(
      description,
      conceptsList,
      objectivesList,
    );

    return this.query({ system, prompt, token: 2000 });
  }

  async getConceptQuiz(description, section, nbQuestions = 10) {
    const sectionName = section.name;
    const sectionItems = section.items
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");

    const system = conceptsQuiz.system(this.style, this.tone, this.audience);
    const prompt = conceptsQuiz.prompt(
      description,
      sectionName,
      sectionItems,
      nbQuestions,
    );

    return this.query({ system, prompt, token: nbQuestions * 200 });
  }

  async getConceptContent(description, section) {
    const system = conceptsText.system(this.style, this.tone, this.audience);
    const prompt = conceptsText.prompt(description, section);

    return this.query({ system, prompt, token: 3000, model: "gpt-4o" });
  }

  async getConceptContentAsHtml(description, section) {
    const system = conceptsText.system(this.style, this.tone, this.audience);
    const prompt = conceptsText.prompt(description, section);

    return this.query({ system, prompt, token: 3000, model: "gpt-4o" });
  }

  async getFinalQuiz(description, concepts, objectives, toc, nbQuestions = 10) {
    const conceptsList = concepts
      .map(({ name, description }) => `${name}: ${description}`)
      .join("\n");
    const objectivesList = objectives.join("\n");
    const tocList = toc
      .map(
        ({ name, items }) =>
          `${name}
  ${items.map(({ name, description }) => `- ${name}: ${description}`).join("\n")}
  `,
      )
      .join("\n");

    const system = practiceQuiz.system(this.style, this.tone, this.audience);
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
