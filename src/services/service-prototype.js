import { generateClient } from 'aws-amplify/data';

/**
 * This is the prototype of any service using GraphQL
 */
export default class ServicePrototype {

  constructor() {
    this.client = generateClient();
    this.model = null;
  }

  /**
   * Create a model
   *
   * @param {object} input the model data
   * @returns {Promise<object>}
   */
  async create(input) {
    const { data } = await this.models.create(input);
    return Object.values(data)[0];
  }

  /**
   * Update a model
   *
   * @param {object} input the model data
   * @returns {Promise<object>}
   */
  async update(input) {
    let payload = { ...input };

    // Cleanup fields that should not be updated
    this.cleanGraphQLUpdate(payload);

    const { data } = await this.model.update(payload);

    return Object.values(data)[0];
  }

  /**
   * Get a model
   *
   * @param {string} id the model id
   * @returns {Promise<object>}
   */
  async get(id) {
    const { data } = await this.model.get({ id });
    return Object.values(data)[0];
  }

  /**
   * Delete a model
   *
   * @param {object} model the model
   * @returns {Promise<object>}
   */
  async delete(model) {
    if (!model.id) return;

    if (!model._version) {
      const fullModel = await this.get(model.id);
      model._version = fullModel._version;
    }
    const { id, _version } = model;
    const payload = { id, _version };
    const { data } = await this.model.delete(payload);

    return Object.values(data)[0];
  }

  /**
   * List models
   *
   * @param {object} params options
   * @param {string} [params.filter] filter
   * @param {number} [params.limit] limit
   * @param {string} [params.nextToken] nextToken
   * @returns {Promise<object>}
   */
  async list(params = {}) {

    // List all items
    params.filter = params.filter || {
      _deleted: { attributeExists: false }
    };

    const { data } = await this.model.list(params);

    return Object.values(data)[0];
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

    Object.values(input).forEach(attr => {
      if (Array.isArray(attr)) {
        attr.forEach(a => this.cleanGraphQLUpdate(a))
      } else if (typeof attr === "object") {
        this.cleanGraphQLUpdate(attr)
      }

    })
    return input;
  }
}
