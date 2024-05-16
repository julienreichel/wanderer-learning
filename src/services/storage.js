import ServicePrototype from './service-prototype';
import { getUrl, remove, uploadData } from 'aws-amplify/storage';

/**
 * Provide service to get and store images
 *
 * @example
 * import StorageService from 'src/services/storage';
 * ...
 * const storageService = new StorageService();
 */
export default class StorageService extends ServicePrototype {
  constructor() {
    super();
  }

  /**
   * Gewt the url of an image
   *
   * @param {string} key of the img to remove
   * @returns {Promise<object>}
   */
  async resolveUrl(key, targetIdentityId) {
    const getUrlResult = await getUrl({
      key: key,
      options: {
        accessLevel: 'protected',
        targetIdentityId
      },
    });
    return getUrlResult.url.toString();
  }

  /**
   * remove an image
   *
   * @param {string} key of the img to remove
   * @returns {Promise<object>}
   */
  async removeImg(key) {
    if (key) {
      await remove({
        key: key,
        options: {
          accessLevel: 'protected',
        },
      });
    }
  }

}
