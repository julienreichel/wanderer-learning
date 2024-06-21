import { generateClient } from "aws-amplify/data";

/**
 * This is the prototype of any service using GraphQL
 */
export default class ServicePrototype {
  constructor(cacheData) {
    /**
     * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
     */
    this.client = generateClient();

    this.model = null;
    this.selectionSet = undefined;

    // we use a very simple model, were we cache only one item for all type,
    // this makes sure that the cache is only use when switching editing/view for a model
    // as soon as some other modela are saved, the cache is cleared
    this.cacheData = cacheData || { single: {} };
  }

  /**
   * Create a model
   *
   * @param {object} input the model data
   * @param {object} options the options
   * @returns {Promise<object>}
   */
  async create(input, options = {}) {
    options.authMode = "userPool";
    options.selectionSet = options.selectionSet || this.selectionSet;
    const { data } = await this.model.create(input, options);

    if (this.cacheData) {
      this.cacheData.single = { ...data };
    }
    return data;
  }

  /**
   * Update a model
   *
   * @param {object} input the model data
   * @param {object} options the options
   * @returns {Promise<object>}
   */
  async update(input, options = {}) {
    options.authMode = "userPool";
    options.selectionSet = options.selectionSet || this.selectionSet;

    let payload = { ...input };

    // Cleanup fields that should not be updated
    this.cleanGraphQLUpdate(payload);

    const { data } = await this.model.update(payload, options);

    // In case something was modified on the server update the cache with the response
    if (this.cacheData) {
      this.cacheData.single = { ...data };
    }
    return data;
  }

  /**
   * Get a model
   *
   * @param {string} id the model id
   * @param {object} options the options
   * @returns {Promise<object>}
   */
  async get(id, options = {}) {
    options.authMode = "userPool";
    options.selectionSet = options.selectionSet || this.selectionSet;

    const lastSaved = this.cacheData.single;
    if (!lastSaved || lastSaved.id !== id) {
      const { data } = await this.model.get({ id }, options);
      this.cacheData.single = { ...data };
      return data;
    }

    console.log("Getting data from cache", lastSaved);
    return { ...lastSaved };
  }

  /**
   * Delete a model
   *
   * @param {object} model the model
   * @returns {Promise<object>}
   */
  async delete(model, options = {}) {
    options.authMode = "userPool";
    options.selectionSet = options.selectionSet || this.selectionSet;

    if (!model.id) return;

    const { id } = model;
    const payload = { id };
    const { data } = await this.model.delete(payload, options);

    this.cacheData.single = {};
    return data;
  }

  /**
   * List models
   *
   * @param {object} params options
   * @param {string} [params.filter] filter
   * @param {number} [params.limit] limit
   * @param {string} [params.nextToken] nextToken
   * @param {string} [params.sortDirection] sortDirection
   * @param {object} options the options
   *
   * @returns {Promise<object>}
   */
  async list(params = {}) {
    params.authMode = "userPool";
    params.selectionSet = params.selectionSet || this.selectionSet;

    // List all items
    /*
    params.filter = params.filter || {
      _deleted: { attributeExists: false }
    };
    */

    const { data, nextToken } = await this.model.list(params);

    if (nextToken) {
      // do something with it
    }
    return data;
  }

  /**
   * Remove internal graphQL items that should not be sent to to the backend
   *
   * @param {Object} intput
   * @returns {Object}
   */
  cleanGraphQLUpdate(input) {
    if (!input || !input.__typename) return;

    delete input.createdAt;
    delete input.updatedAt;
    delete input.owner;
    delete input.__typename;
    delete input._deleted;
    delete input._lastChangedAt;

    Object.values(input).forEach((attr) => {
      if (Array.isArray(attr)) {
        attr.forEach((a) => this.cleanGraphQLUpdate(a));
      } else if (typeof attr === "object") {
        this.cleanGraphQLUpdate(attr);
      }
    });
    return input;
  }
}
