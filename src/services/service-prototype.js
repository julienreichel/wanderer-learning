// Utils
import axios from 'axios';

// Constants

// XHR library global configuration
axios.defaults.withCredentials = false;

/**
 * This is the prototype of any service.
 */
export default class ServicePrototype {

  constructor() {
  }

  getQuery(type) {
    return {
      create: null,
      update: null,
      get: null,
      delete: null,
      list: null,
    }[type]
  }

  /**
   * Create a model
   *
   * @param {object} input the model data
   * @returns {Promise<object>}
   */
  async create(input) {
    const { data } = await this.client.graphql({
      query: this.getQuery('create'),
      variables: {
        input
      },
    });
    //()
    return Object.values(data)[0];
  }

  /**
   * Update a model
   *
   * @param {object} payload the model data
   * @returns {Promise<object>}
   */
  async update(payload) {
    let input = { ...payload };

    // Cleanup fields that should not be updated
    this.cleanGraphQLUpdate(input);

    const { data } = await this.client.graphql({
      query: this.getQuery('update'),
      variables: {
        input
      },
    });
    //()
    return Object.values(data)[0];
  }

  /**
   * Get a model
   *
   * @param {string} id the model id
   * @returns {Promise<object>}
   */
  async get(id) {
    const { data } = await this.client.graphql({
      query: this.getQuery('get'),
      variables: { id }
    });
    //()

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
    const input = { id, _version };
    const { data } = await this.client.graphql({
      query: this.getQuery('delete'),
      variables: {
        input
      }
    });
    //()
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

    const { data } = await this.client.graphql({
      query: this.getQuery('list'),
      variables: params
    });
    //()
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
