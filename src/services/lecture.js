import ServicePrototype from "./service-prototype";

import LectureConceptService from "./lecture-concept";
import LectureStepService from "./lecture-step";

/**
 * Provide service to get and store lectures
 *
 * @example
 * import LectureService from 'src/services/lecture';
 * ...
 * const quizService = new LectureService();
 */
export default class LectureService extends ServicePrototype {
  constructor(cacheData) {
    super(cacheData);

    this.model = this.client.models.Lecture;
    this.lectureConceptService = new LectureConceptService();
    this.lectureStepService = new LectureStepService();

    this.selectionSet = [
      "id",
      "title",
      "order",
      "owner",
      "description",
      "locale",
      "course.*",
      "steps.*",
      "concepts.id",
      "concepts.concept.*",
    ];
  }

  sort(lectures) {
    return lectures.sort((a, b) => Number(a.order) - Number(b.order));
  }

  /**
   * Remove deleted content
   * @param {object} lecture the lecture data
   * @returns {object}
   */
  removeDeletedContent(lecture) {
    if (!lecture) return;
    /*
    lecture.steps = lecture.steps?.filter(step => !step._deleted);
    lecture.concepts = lecture.concepts?.filter(concept => !concept._deleted);
    */
    return lecture;
  }

  /**
   * Get a lecture
   *
   * @param {string} id the lectureSegment id
   * @returns {Promise<object>}
   */
  async get(id) {
    let lecture = await super.get(id);
    if (!lecture) return;

    lecture.steps = this.sort(lecture.steps);
    return this.removeDeletedContent(lecture);
  }

  /**
   * Create a lecture
   *
   * @param {object} input the lecture data
   * @returns {Promise<object>}
   */
  async create(input, params) {
    let lecture = await super.create(input, params);

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

    // Update the cache
    if (this.cacheData) {
      this.cacheData.single = { ...input };
    }

    delete payload.concepts;
    delete payload.steps;
    delete payload.course;
    delete payload.userTimeReportings;
    delete payload.ratings;

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
    if (!input.concepts || !input.steps) {
      const fullLecture = await this.get(input.id);
      input.concepts = fullLecture.concepts;
      input.steps = fullLecture.steps;
    }
    // remove all associated concepts
    if (input.concepts) {
      await Promise.all(
        input.concepts.map(async (item) => {
          await this.lectureConceptService.delete(item);
        }),
      );
    }
    // remove all content
    if (input.steps) {
      await Promise.all(
        input.steps.map(async (item) => {
          await this.lectureStepService.delete(item);
        }),
      );
    }

    return super.delete(input);
  }
}
