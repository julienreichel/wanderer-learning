import ServicePrototype from './service-prototype';

import LectureConceptService from './lecture-concept';

/**
 * Provide service to get and store concepts
 *
 * @example
 * import ConceptService from 'src/services/concept';
 * ...
 * const quizService = new ConceptService();
 */
export default class ConceptService extends ServicePrototype {
  constructor() {
    super();

    this.model = this.client.models.Concept;
    this.lectureConceptService = new LectureConceptService();
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
    return super.update(payload)
  }

  /**
   * Get a concept
   *
   * @param {string} id the concept id
   * @returns {Promise<object>}
   */
  async get(id) {
    let concept = await super.get(id)

    /*
    // remove deleted lectures
    concept.lectures = concept.lectures?.filter(lc => !lc._deleted) || [];
    concept.lectures?.forEach(({ lecture }) => {
      if (lecture.concepts) {
        lecture.concepts = lecture.concepts.filter(concept => !concept._deleted);
      }
    });
    */
    return concept;
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
      input._version = fullConcept._version;
      input.lectures = fullConcept.lectures;
    }
    // remove all items from the concept
    if (input.lectures) {
      await Promise.all(input.lectures.map(async item => {
        await this.lectureConceptService.delete(item);
      }));
    }
    return super.delete(input);
  }
}

