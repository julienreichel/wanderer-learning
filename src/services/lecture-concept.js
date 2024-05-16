
import ServicePrototype from './service-prototype';
import { generateClient } from 'aws-amplify/api';

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

    this.model = this.client.models.LectureConceptJoinTable;
  }
}

