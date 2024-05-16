import ServicePrototype from './service-prototype';
import { generateClient } from 'aws-amplify/api';
import { createCourse, updateCourse, deleteCourse } from '../graphql/mutations';
import { getCourse, listCourses } from '../graphql/queries';

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

    this.client = generateClient();
    this.lectureService = new LectureService();
  }

  getQuery(type) {
    return {
      create: createCourse,
      update: updateCourse,
      get: getCourse,
      delete: deleteCourse,
      list: listCourses,
    }[type]
  }

  /**
   * Remove deleted content
   * @param {object} course the course data
   * @returns {object}
   */
  removeDeletedContent(course) {
    if (!course) return;

    // remove deleted items
    course.lectures.items = course.lectures.items.filter(lecture => !lecture._deleted);
    course.lectures.items.forEach(lecture => {
      if (lecture.concepts?.items) {
        lecture.concepts.items = lecture.concepts.items.filter(concept => !concept._deleted);
      }
    })
    return course;
  }

  /**
   * Update a course
   *
   * @param {object} payload the lectureSegment data
   * @returns {Promise<object>}
   */
  async update(payload, params = {}) {
    let input = { ...payload };
    delete input.lectures;
    let course = await super.update(input);

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
    if (!input._version || !input.lectures?.items) {
      const fullCourse = await this.get(input.id);
      input._version = fullCourse._version;
      input.lectures = fullCourse.lectures;
    }
    // remove all items from the lectures
    if (input.lectures?.items) {
      await Promise.all(input.lectures.items.map(async item => {
        await this.lectureService.delete(item);
      }));
    }
    return super.delete(input);
  }

}
