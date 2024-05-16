import ServicePrototype from './service-prototype';
import { generateClient } from 'aws-amplify/api';
import { createConcept, updateConcept, deleteConcept } from '../graphql/mutations';
import { getConcept, listConcepts } from '../graphql/queries';
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

    this.client = generateClient();
    this.lectureConceptService = new LectureConceptService();
  }

  getQuery(type) {
    return {
      create: createConcept,
      update: updateConcept,
      get: getConcept,
      delete: deleteConcept,
      list: listConcepts,
    }[type]
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

    // remove deleted lectures
    concept.lectures.items = concept.lectures.items.filter(lc => !lc._deleted);
    concept.lectures.items.forEach(({ lecture }) => {
      if (lecture.concepts?.items) {
        lecture.concepts.items = lecture.concepts.items.filter(concept => !concept._deleted);
      }
    });
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
    if (!input._version || !input.lectures?.items) {
      const fullConcept = await this.get(input.id);
      input._version = fullConcept._version;
      input.lectures = fullConcept.lectures;
    }
    // remove all items from the concept
    if (input.lectures?.items) {
      await Promise.all(input.lectures.items.map(async item => {
        await this.lectureConceptService.delete(item);
      }));
    }
    return super.delete(input);
  }
}

