import ServicePrototype from "./service-prototype";

/**
 * Provide service to get and store reporting
 *
 * @example
 * import StepReportingService from 'src/services/repoting-step';
 * ...
 * const stepReporting = new StepReportingService();
 */
export default class StepReportingService extends ServicePrototype {
  constructor() {
    super();

    this.model = this.client.models.StepReporting;
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

    // Remove deleted items from the list
    /*
    params.filter = params.filter || {
      _deleted: { attributeExists: false }
    };
    */

    if (params.owner) {
      // Somehow the graphQL owner has this weird format
      params.owner = `${params.owner}::${params.owner}`;
    } else if (params.userId && params.username) {
      params.owner = `${params.userId}::${params.username}`;
    }
    let query = null;
    if (params.lectureId) {
      query = this.model.listStepReportingByLectureIdAndOwner;
      if (params.owner) {
        params.owner = { eq: params.owner };
      }
    } else if (params.lectureStepId) {
      query = this.model.listStepReportingByLectureStepIdAndOwner;
      if (params.owner) {
        params.owner = { eq: params.owner };
      }
    } else if (params.owner) {
      query = this.model.listStepReportingByOwnerAndCreatedAt;
      if (!params.sortDirection) {
        params.sortDirection = "DESC";
      }
    } else {
      query = this.model.listStepReportings;
    }

    const { data } = await query(params);

    return data;
  }

  /**
   * Update a reporting
   *
   * @param {object} input the reporting data
   * @returns {Promise<object>}
   */
  async update(input) {
    let payload = { ...input };
    delete payload.lectureStep;
    return super.update(payload);
  }

  /**
   * Create user time reporting based on a set of reports, this is the total amount of time spents by each user
   * @param {Array} reports
   * @returns {Array} userTimeReportings
   */
  computeUserTimeReportings(reports) {
    const buckets = [60 * 5, 60 * 10, 60 * 15, "more"];

    const stats = reports.reduce(
      (acc, stepReport) => {
        const stepTimeSpent = stepReport.reportings.reduce(
          (acc, partReport) => (acc += partReport.time),
          0,
        );
        const bucket = buckets.findIndex(
          (bucket) => stepTimeSpent < bucket || bucket === "more",
        );
        acc[bucket] += 1;
        return acc;
      },
      buckets.map(() => 0),
    );

    return stats;
  }
  /**
   * Compute the average rating
   * @param {Array} reports
   * @returns {Array} userTimeReportings
   */
  computeRatings(reports) {
    const stats = reports.reduce((accStep, stepReport) => {
      return stepReport.reportings.reduce((accPart, partReport) => {
        if (!partReport.responses) return accPart;
        return partReport.responses.reduce((acc, response) => {
          if (!response.feedbackType) return acc;
          if (!acc[response.feedbackType]) {
            acc[response.feedbackType] = { total: 0, divisor: 0, texts: [] };
          }
          if (response.feedbackType === "text") {
            acc[response.feedbackType].texts.push(response.response);
          } else {
            acc[response.feedbackType].total += Number(response.response);
          }
          acc[response.feedbackType].divisor += 1;
          return acc;
        }, accPart);
      }, accStep);
    }, {});
    Object.keys(stats).forEach(
      (key) =>
        (stats[key] = stats[key].texts.length
          ? stats[key].texts
          : Math.round((stats[key].total / stats[key].divisor) * 10) / 10),
    );
    return stats;
  }

  /**
   * Create timestamp historgam based on a set of reports
   * @param {Array} reports
   * @param {'day'|'month'} [granularity] granularity of the histogram, can be 'day' or 'month'
   * @returns {Array} timestampDistribution
   */
  computeTimestampDistribution(reports, granularity = "day") {
    const timestampDistribution = reports
      .map((stepReport) => stepReport.createdAt)
      .reduce((acc, timestamp) => {
        const date = new Date(timestamp);
        const key =
          granularity === "day"
            ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
            : `${date.getFullYear()}-${date.getMonth()}}`;
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key]++;
        return acc;
      }, {});

    return Object.entries(timestampDistribution)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  /**
   * Compute the average points per step
   * @param {Array} steps
   * @param {Array} stepsSummary
   * @returns {Array} pointsPerStep
   */
  computePointsPerStep(step, stepsSummary) {
    const stepSummary = stepsSummary.find(
      (item) => item.lectureStepId === step.id,
    );
    if (!stepSummary || !stepSummary.reportings?.length)
      return { averagePoints: 0 };

    const parts = stepSummary.reportings.map((part) => {
      if (!part.responses?.length) return {};
      const totalPoints = part.responses.reduce(
        (acc, response) => acc + response.points,
        0,
      );
      const averagePoints = totalPoints / part.responses.length;

      return { totalPoints, averagePoints, divisor: part.responses.length };
    });
    const totalPoints = parts.reduce(
      (acc, part) => acc + (part.totalPoints || 0),
      0,
    );
    const averageSumPoints = parts.reduce(
      (acc, part) => acc + (part.averagePoints || 0),
      0,
    );
    const divisor = parts.reduce(
      (acc, part) => acc + (part.divisor ? 1 : 0),
      0,
    );
    const averagePoints = divisor ? averageSumPoints / divisor : 1;

    return { totalPoints, averagePoints, divisor };
  }

  /**
   * Get the last reports for each step
   *
   * @param {Array} reports
   * @returns {Array} lastReports
   */
  getLastReports(reports) {
    // keep only the latest report for each step
    const stepReports = reports.reduce((acc, report) => {
      if (
        !acc[report.lectureStepId] ||
        acc[report.lectureStepId].createdAt < report.createdAt
      ) {
        acc[report.lectureStepId] = report;
      }
      return acc;
    }, {});
    return Object.values(stepReports);
  }
}
