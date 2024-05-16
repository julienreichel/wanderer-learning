import ServicePrototype from './service-prototype';

import LectureConceptService from './lecture-concept';
import LectureStepService from './lecture-step';

/**
 * Provide service to get and store lectures
 *
 * @example
 * import LectureService from 'src/services/lecture';
 * ...
 * const quizService = new LectureService();
 */
export default class LectureService extends ServicePrototype {
  constructor() {
    super();

    this.model = this.client.models.Course;
    this.lectureConceptService = new LectureConceptService();
    this.lectureStepService = new LectureStepService();
  }

  /**
   * Remove deleted content
   * @param {object} lecture the lecture data
   * @returns {object}
   */
  removeDeletedContent(lecture) {
    if (!lecture) return;

    lecture.steps.items = lecture.steps.items.filter(step => !step._deleted);
    lecture.concepts.items = lecture.concepts.items.filter(concept => !concept._deleted);
    return lecture;
  }

  /**
   * Get a lecture
   *
   * @param {string} id the lectureSegment id
   * @returns {Promise<object>}
   */
  async get(id) {
    let lecture = await super.get(id)

    return this.removeDeletedContent(lecture);
  }

  /**
   * Create a lecture
   *
   * @param {object} input the lecture data
   * @returns {Promise<object>}
   */
  async create(input) {
    let lecture = await super.create(input);

    return this.removeDeletedContent(lecture);
  }

  /**
   * Update a lecture
   *
   * @param {object} input the lecture data
   * @returns {Promise<object>}
   */
  async update(input) {
    let payload = { ...input };
    delete payload.concepts;
    delete payload.steps;
    delete payload.course;

    let lecture = await super.update(payload);

    return this.removeDeletedContent(lecture);
  }

  /**
   * Delete a lecture
   *
   * @param {object} input the lecture data
   * @returns {Promise<object>}
   */
  async delete(input) {
    if (!input.id) return;

    // get missing data if needed
    if (!input._version || !input.concepts?.items || !input.steps?.items) {
      const fullLecture = await this.get(input.id);
      input._version = fullLecture._version;
      input.concepts = fullLecture.concepts;
      input.steps = fullLecture.steps;
    }
    // remove all associated concepts
    if (input.concepts?.items) {
      await Promise.all(input.concepts.items.map(async item => {
        await this.lectureConceptService.delete(item);
      }));
    }
    // remove all content
    if (input.steps?.items) {
      await Promise.all(input.steps.items.map(async item => {
        await this.lectureStepService.delete(item);
      }));
    }

    return super.delete(input);
  }

}

