import ServicePrototype from "./service-prototype";
import StorageService from "./storage";

/**
 * Provide service to get and store lecture contents
 *
 * @example
 * import LectureStepService from 'src/services/lecture-step';
 * ...
 * const lectureStepService = new LectureStepService();
 */
export default class LectureStepService extends ServicePrototype {
  constructor(cacheData) {
    super(cacheData);

    this.model = this.client.models.LectureStep;
    this.storageService = new StorageService();

    this.selectionSet = [
      "id",
      "title",
      "type",
      "order",
      "owner",
      "identityId",
      "lecture.*",
      "lecture.course.*",
      "concept.*",
      "parts.*",
    ];
  }

  /**
   * Cleanup data from parts before sending the payload
   *
   * @param {Object} parts the parts
   * @returns {Object}
   */
  cleanParts(parts) {
    if (!parts) return;

    parts.forEach((part) => {
      delete part.url;
    });
  }

  convertOptionsToObj(parts) {
    parts.forEach((part) => {
      if (!part.options) {
        part.options = {};
        return;
      }
      if (Array.isArray(part.options)) {
        part.options = part.options.reduce((acc, option) => {
          acc[option.name] = option.value;
          return acc;
        }, {});
      }
      part.questions?.forEach((question) => {
        if (!question.options) {
          question.options = {};
          return;
        }
        if (!Array.isArray(question.options)) return; // already converted
        question.options = question.options.reduce((acc, option) => {
          acc[option.name] = option.value;
          return acc;
        }, {});
      });
    });
  }

  convertOptionsToArr(parts) {
    parts.forEach((part) => {
      if (!part.options) {
        part.options = [];
        return;
      }
      if (!Array.isArray(part.options)) {
        part.options = Object.keys(part.options).map((key) => {
          return { name: key, value: part.options[key] };
        });
      }
      part.questions?.forEach((question) => {
        if (!question.options) {
          question.options = [];
          return;
        }
        if (Array.isArray(question.options)) return; // already converted
        question.options = Object.keys(question.options).map((key) => {
          return { name: key, value: question.options[key] };
        });
      });
    });
  }

  async resolveUrl(parts) {
    for (const part of parts) {
      if (
        (part.type === "img" || part.type === "text") &&
        part.src &&
        part.src !== ""
      ) {
        if (part.src.startsWith("http")) {
          part.url = part.src;
          continue;
        }
        part.url = await this.storageService.resolveUrl(part.src);
      }
    }
  }

  /**
   * Create a lectureStep
   *
   * @param {object} input the lectureStep data
   * @returns {Promise<object>}
   */
  async create(input) {
    this.cleanParts(input.parts);
    if (input.parts) this.convertOptionsToArr(input.parts);
    return super.create(input);
  }

  /**
   * Update a lectureStep
   *
   * @param {object} input the lectureStep data
   * @returns {Promise<object>}
   */
  async update(input, params = { resolveImg: true }) {
    let payload = { ...input };
    // Update the cache
    if (this.cacheData) {
      this.cacheData.single = { ...input };
    }

    // Cleanup fields that should not be updated
    this.cleanParts(payload.parts);
    delete payload.lecture;
    delete payload.concept;
    delete payload.timestampDistribution;
    delete payload.userTimeReportings;
    delete payload.ratings;

    if (payload.parts) this.convertOptionsToArr(payload.parts);

    const step = super.update(payload, params);
    if (params.resolveImg && step.parts) {
      await this.resolveUrl(step.parts);
    }

    if (step.parts) this.convertOptionsToObj(step.parts);

    return step;
  }

  /**
   * Get a lectureStep
   *
   * @param {string} id the lectureStep id
   * @param {object} params the params
   * @param {boolean} params.resolveImg if true, resolve the url of the images
   * @returns {Promise<object>}
   */
  async get(id, params = { resolveImg: true }) {
    const step = await super.get(id);
    if (!step) return;
    // inject the url of the image
    if (params.resolveImg && step.parts) {
      await this.resolveUrl(step.parts);
    }

    if (step.parts) this.convertOptionsToObj(step.parts);

    return step;
  }

  /**
   * Delete a lectureStep
   *
   * @param {object} input the lectureStep
   * @param {object} params the params
   * @param {boolean} params.clearImg if true, remove the images from the storage
   * @returns {Promise<object>}
   */
  async delete(content, params = { clearImg: false }) {
    if (!content.id) return;

    // get missing data if needed
    if (!content.parts && content.type === "step") {
      const fullLectureStep = await this.get(content.id, { resolveImg: false });
      content._version = fullLectureStep._version;
      content.parts = fullLectureStep.parts;
    }
    // remove all images first, note that the content is
    // actually soft deleted in the backend
    if (content.part && params.clearImg) {
      for (const part of content.parts) {
        if (part.type === "img" && part.src && !part.src.startsWith("http")) {
          this.storageService.removeImg(part.src);
          part.src = null;
        }
      }
    }
    return super.delete(content);
  }
}
