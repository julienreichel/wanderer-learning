import ServicePrototype from "./service-prototype";

/**
 * Provide service to get and store reporting
 *
 * @example
 * import LectureReportingService from 'src/services/lecture-reporting';
 * ...
 * const lectureReporting = new LectureReportingService();
 */
export default class LectureReportingService extends ServicePrototype {
  constructor(cacheData) {
    super(cacheData);

    this.model = this.client.models.LectureReporting;
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
    if (params.lectureId) {
      query = this.model.listLectureReportingByLectureIdAndOwner;
      if (params.owner) {
        params.owner = { eq: params.owner };
      }
    } else if (params.owner) {
      query = this.model.listLectureReportingByOwnerAndCreatedAt;
      if (!params.sortDirection) {
        params.sortDirection = "DESC";
      }
    } else {
      query = this.model.listLectureReportings;
    }

    const { data } = await query(params);

    return data;
  }

  /**
   * check all the questions, and compute the sucess rate per level
   * the level if the user, is the one that has a sucess rate of 80% or more
   * @param {object} reporting
   * @returns String
   */
  getLevel(reporting) {
    if (reporting.responses.length === 0)
      return {
        level: "in_progress",
        ratio: reporting.ratio,
      };

    const levels = ["novice", "beginner", "intermediate", "advanced", "expert"];

    // compute the suces rate per level
    let acc = [0, 1, 2, 3, 4].map(() => ({ total: 0, valid: 0 }));
    let difficulties = reporting.responses.reduce((acc, response) => {
      const difficulty = levels.indexOf(response.level);
      acc[difficulty].total++;
      if (response.valid) acc[difficulty].valid++;
      return acc;
    }, acc);

    // acculate the lover levels
    for (let i = 0; i < 4; i++) {
      difficulties[i + 1].total += difficulties[i].total;
      difficulties[i + 1].valid += difficulties[i].valid;
    }

    console.log(difficulties);

    // find the level with 80% or more valid
    let level = null;
    let ratio = 0;
    for (let i = 0; i < 5; i++) {
      if (!difficulties[i].total) continue;
      if (!level) {
        level = levels[i];
        ratio = difficulties[i].valid / difficulties[i].total;
      }
      if (
        i > 0 &&
        difficulties[i].total === difficulties[i - 1].total &&
        (i === 4 || difficulties[i].total === difficulties[i + 1].total)
      ) {
        // this level was not tested, keeping previous results
        break;
      }
      if (difficulties[i].valid / difficulties[i].total >= 0.6666) {
        level = levels[i];
        ratio = difficulties[i].valid / difficulties[i].total;
      }
    }
    return { level, ratio };
  }
}
