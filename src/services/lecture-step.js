import ServicePrototype from './service-prototype';
import StorageService from './storage'

/**
 * Provide service to get and store lecture contents
 *
 * @example
 * import LectureStepService from 'src/services/lecture-step';
 * ...
 * const lectureStepService = new LectureStepService();
 */
export default class LectureStepService extends ServicePrototype {
  constructor() {
    super();

    this.model = this.client.models.LectureStep;
    this.storageService = new StorageService();

    this.lastSaved = null;

    this.selectionSet = ['id', 'title', 'type', 'order', 'owner', 'identityId', 'lecture.*', 'lecture.course.*', 'concept.*', 'parts.*'];
  }

  sort(steps) {
    return steps.sort((a, b) => Number(a.order) - Number(b.order));
  }

  /**
   * Cleanup data from parts before sending the payload
   *
   * @param {Object} parts the parts
   * @returns {Object}
   */
  cleanParts(parts) {
    if (!parts) return;

    parts.forEach(part => {
      delete part.url;
    })
  }

  /**
   * Create a lectureStep
   *
   * @param {object} input the lectureStep data
   * @returns {Promise<object>}
   */
  async create(input) {
    this.cleanParts(input.parts);
    this.lastSaved = super.create(input);
    return this.lastSaved;
  }

  /**
   * Update a lectureStep
   *
   * @param {object} input the lectureStep data
   * @returns {Promise<object>}
   */
  async update(input) {
    let payload = { ...input };
    // Cleanup fields that should not be updated
    this.cleanParts(payload.parts);
    delete payload.lecture;
    delete payload.concept;
    delete payload.timestampDistribution;
    delete payload.userTimeReportings;
    delete payload.ratings;


    this.lastSaved = await super.update(payload);
    return this.lastSaved;
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
    if (!this.lastSaved || this.lastSaved.id !== id) {
      this.lastSaved = await super.get(id);
    }

    const step = this.lastSaved;
    // inject the url of the image
    if (params.resolveImg && step.parts) {
      for (const part of step.parts) {
        if ((part.type === 'img' || part.type === 'text') && part.src && part.src !== "") {
          if (part.src.startsWith('http')) {
            part.url = part.src;
            continue;
          }
          part.url = await this.storageService.resolveUrl(part.src);
        }
      }
    }

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
    if (!content.parts && content.type === 'step') {
      const fullLectureStep = await this.get(content.id, { resolveImg: false });
      content._version = fullLectureStep._version;
      content.parts = fullLectureStep.parts;
    }
    // remove all images first, note that the content is
    // actually soft deleted in the backend
    if (content.part && params.clearImg) {
      for (const part of content.parts) {
        if (part.type === 'img' && part.src) {
          this.storageService.removeImg(part.src);
          part.src = null;
        }
      }
    }
    return super.delete(content);
  }

  /**
   *
   * @param {object} part
   * @param {string} name
   * @param {any} value
   */
  setOption(part, name, value) {
    if (!part.options) {
      part.options = [];
    }
    let old = part.options.find(option => option.name === name);
    if (old) {
      old.value = value;
    } else {
      part.options.push({ name, value });
    }
  }

  /**
   *
   * @param {string} name
   */
  getOption(part, name) {
    if (!part.options) {
      part.options = [];
    }
    return part.options.find(option => option.name === name)?.value;
  }
}
