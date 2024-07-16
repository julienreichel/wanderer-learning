import ServicePrototype from "./service-prototype";

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

    this.model = this.client.models.LectureConceptJoinTable;

    this.selectionSet = ["id", "lecture.*", "concept.*"];
  }
}
