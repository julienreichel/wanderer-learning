import ServicePrototype from './service-prototype';

import LectureService from './lecture';

/**
 * Provide service to get and store courses
 *
 * @example
 * import CourseService from 'src/services/course';
 * ...
 * const quizService = new CourseService();
 */
export default class CourseService extends ServicePrototype {
  constructor() {
    super();

    this.model = this.client.models.Course;
    this.lectureService = new LectureService();
    this.selectionSet = ['id', 'title', 'owner', 'lectures.*', 'lectures.steps.*', , 'lectures.concepts.concept.*'];
  }

  /**
   * Update a course
   *
   * @param {object} payload the lectureSegment data
   * @returns {Promise<object>}
   */
  async update(payload, options = {}) {
    let input = { ...payload };
    delete input.lectures;
    let course = await super.update(input, options);

    return course;
  }

  /**
   * Get a course
   *
   * @param {string} id the lectureSegment id
   * @returns {Promise<object>}
   */
  async get(id) {
    let course = await super.get(id)

    course.lectures = course.lectures.sort((a, b) => Number(a.order) - Number(b.order));

    return course;
  }

  /**
   * List courses
   * @param {object} params options
   *
   * @returns {Promise<object>}
   */
  async list(params = {}) {
    params.selectionSet = ['id', 'title', 'owner'];
    let courses = await super.list(params)

    return courses;
  }

  /**
   * Delete a course
   *
   * @param {object} input the course data
   * @returns {Promise<object>}
   */
  async delete(input) {
    if (!input.id) return;

    // get missing data if needed
    if (!input.lectures) {
      const fullCourse = await this.get(input.id);
      input.lectures = fullCourse.lectures;
    }
    // remove all items from the lectures
    if (input.lectures) {
      await Promise.all(input.lectures.map(async item => {
        await this.lectureService.delete(item);
      }));
    }
    return super.delete(input);
  }

}
