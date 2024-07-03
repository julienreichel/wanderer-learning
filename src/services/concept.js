import ServicePrototype from "./service-prototype";

import LectureConceptService from "./lecture-concept";

/**
 * Provide service to get and store concepts
 *
 * @example
 * import ConceptService from 'src/services/concept';
 * ...
 * const quizService = new ConceptService();
 */
export default class ConceptService extends ServicePrototype {
  constructor(cacheData) {
    super(cacheData);

    this.model = this.client.models.Concept;
    this.lectureConceptService = new LectureConceptService();

    this.selectionSet = [
      "id",
      "title",
      "description",
      "lectures.id",
      "lectures.lecture.*",
      "lectures.lecture.steps.*",
      "lectures.lecture.concepts.concept.*",
      "steps.*",
    ];
  }

  /**
   * Create a concept
   *
   * @param {object} input the model data
   * @param {object} options the options
   * @returns {Promise<object>}
   */
  async create(input, options = {}) {
    const concept = super.create(input, options);

    // we could be smarter and update the cache with the new concept, but this is good enough for now
    this.clearCachedData("concepts");

    return concept;
  }

  /**
   * Get a concept
   *
   * @param {string} id the concept id
   * @param {object} params the options
   * @returns {Promise<object>}
   */
  async get(id, params) {
    let concept = await super.get(id);
    if (!concept) return;

    // remove empty lectures
    concept.lectures = concept.lectures.filter(({ lecture }) =>
      Boolean(lecture),
    );

    // for now, we do a client side filtering
    if (params.locale) {
      concept.lectures = concept.lectures.filter(
        ({ lecture }) => !lecture.locale || lecture.locale === params.locale,
      );
    }

    concept.lectures?.forEach(({ lecture }) => {
      if (!lecture?.steps) return;
      lecture.steps = lecture.steps?.sort(
        (a, b) => Number(a.order) - Number(b.order),
      );
    });

    return concept;
  }

  /**
   * Update a concept
   *
   * @param {object} input the concept data
   * @returns {Promise<object>}
   */
  async update(input) {
    let payload = { ...input };
    delete payload.lectures;
    return super.update(payload);
  }

  /**
   * List concept
   * @param {object} params options
   *
   * @returns {Promise<object>}
   */
  async list(params = {}) {
    let concepts = this.getCachedData("concepts");
    if (Boolean(concepts)) {
      return concepts;
    }
    params.selectionSet = ["id", "title", "description"];
    concepts = await super.list(params);

    this.setCacheData("concepts", concepts);
    return concepts;
  }

  /**
   * Delete a conept
   *
   * @param {object} input the concept data
   * @returns {Promise<object>}
   */
  async delete(input) {
    if (!input.id) return;

    // get missing data if needed
    if (!input.lectures) {
      const fullConcept = await this.get(input.id);
      input.lectures = fullConcept.lectures;
    }
    // remove all items from the concept
    if (input.lectures) {
      await Promise.all(
        input.lectures.map(async (item) => {
          await this.lectureConceptService.delete(item);
        }),
      );
    }
    this.clearCachedData("concepts");
    return super.delete(input);
  }
}
