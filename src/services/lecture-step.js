import ServicePrototype from './service-prototype';
import { generateClient } from 'aws-amplify/api';
import { createLectureStep, updateLectureStep, deleteLectureStep } from '../graphql/mutations';
import { getLectureStep, listLectureSteps } from '../graphql/queries';
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

    this.client = generateClient();
    this.storageService = new StorageService();

    this.lastSaved = null;
  }

  getQuery(type) {
    return {
      create: createLectureStep,
      update: updateLectureStep,
      get: getLectureStep,
      delete: deleteLectureStep,
      list: listLectureSteps,
    }[type]
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
        if (part.type === 'img') {
          part.url = await this.storageService.resolveUrl(part.src, step.identityId);
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
    if (!content._version || (!content.parts && content.type === 'step')) {
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

}
