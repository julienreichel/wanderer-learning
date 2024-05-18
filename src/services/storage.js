import { getUrl, remove } from 'aws-amplify/storage';

/**
 * Provide service to get and store images
 *
 * @example
 * import StorageService from 'src/services/storage';
 * ...
 * const storageService = new StorageService();
 */
export default class StorageService {
  constructor() {
  }

  /**
   * Gewt the url of an image
   *
   * @param {string} key of the img to remove
   * @returns {Promise<object>}
   */
  async resolveUrl(path) {
    const getUrlResult = await getUrl({
      path: path,
      options: {
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
  async removeImg(path) {
    if (key) {
      await remove({
        path: path,
        options: {
        },
      });
    }
  }

}
