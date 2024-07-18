import ServicePrototype from "./service-prototype";

/**
 * Provide service to get and store reporting
 *
 * @example
 * import CourseReportingService from 'src/services/course-reporting';
 * ...
 * const courseReporting = new CourseReportingService();
 */
export default class CourseReportingService extends ServicePrototype {
  constructor(cacheData) {
    super(cacheData);

    this.model = this.client.models.CourseReporting;
  }

  /**
   * List reportings
   *
   * @param {object} params options
   * @param {string} [params.owner] owner
   * @param {string} [params.lectureStepId] lectureStepId
   * @param {string} [params.lectureId] lectureId
   * @param {string} [params.filter] filter
   * @param {number} [params.limit] limit
   * @param {string} [params.nextToken] nextToken
   * @returns {Promise<object>}
   */
  async list(params = {}) {
    params.authMode = "userPool";

    if (params.owner) {
      // Somehow the graphQL owner has this weird format
      params.owner = `${params.owner}::${params.owner}`;
    } else if (params.userId && params.username) {
      params.owner = `${params.userId}::${params.username}`;
    }
    let query = null;
    if (params.courseId) {
      query = this.model.listCourseReportingByCourseIdAndOwner;
      if (params.owner) {
        params.owner = { eq: params.owner };
      }
    } else if (params.owner) {
      query = this.model.listCourseReportingByOwnerAndCreatedAt;
      if (!params.sortDirection) {
        params.sortDirection = "DESC";
      }
    } else {
      query = this.model.listCourseReportings;
    }

    const { data } = await query(params);

    return data;
  }

}
