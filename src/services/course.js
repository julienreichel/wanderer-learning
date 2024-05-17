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
    this.selectionSet = ['id', 'title', 'owner', 'lectures.*', 'lectures.steps.*'];
  }

  /**
   * Remove deleted content
   * @param {object} course the course data
   * @returns {object}
   */
  removeDeletedContent(course) {
    if (!course) return;

    /*
    // remove deleted items
    course.lectures = course.lectures?.filter(lecture => !lecture._deleted) || [];
    course.lectures.forEach(lecture => {
      if (lecture.concepts) {
        lecture.concepts = lecture.concepts.filter(concept => !concept._deleted);
      }
    })
    */
    return course;
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

    return this.removeDeletedContent(course);
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

    return this.removeDeletedContent(course);
  }

  /**
   * List courses
   * @param {object} params options
   *
   * @returns {Promise<object>}
   */
  async list(params = {}) {
    params.selectionSet = ['id', 'title', 'owner'];
    let course = await super.list(params)

    return this.removeDeletedContent(course);
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
