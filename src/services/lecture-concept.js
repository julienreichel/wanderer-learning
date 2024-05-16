
import ServicePrototype from './service-prototype';
import { generateClient } from 'aws-amplify/api';
import { createLectureConcepts, updateLectureConcepts, deleteLectureConcepts } from '../graphql/mutations';
import { getLectureConcepts, listLectureConcepts, lectureConceptsByLectureId, lectureConceptsByConceptId } from '../graphql/queries';

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
  }

  getQuery(type) {
    return {
      create: createLectureConcepts,
      update: updateLectureConcepts,
      get: getLectureConcepts,
      delete: deleteLectureConcepts,
      list: listLectureConcepts,
    }[type]
  }


  /**
   * Get a model from the lecture id
   *
   * @param {string} id the lecture id
   * @returns {Promise<object>}
   */
  async getFromLecture(id) {
    const { data } = await this.client.graphql({
      query: lectureConceptsByLectureId,
      variables: { id }
    });
    //()

    return Object.values(data)[0];
  }

  /**
   * Get a model from the concept id
   *
   * @param {string} id the concept id
   * @returns {Promise<object>}
   */
  async getFromConcept(id) {
    const { data } = await this.client.graphql({
      query: lectureConceptsByConceptId,
      variables: { id }
    });
    //()

    return Object.values(data)[0];
  }
}

