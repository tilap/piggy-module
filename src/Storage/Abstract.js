/**
 * Abstract storage for Vo.
 * Any method here must be implemented. If not, will throw an Error
 */
export default class AbstractStorage {
  /**
   * @param {any} connector - storage connector
   * @param {String} collection - the collection to query on
   */
  constructor(connector, collection) {
    /**
     * @type {any}
     * @private
     */
    this._connector = connector;
    /**
     * @type {String}
     * @private
     */
    this._collection = collection;
  }

  /**
   * Get a list of data Object from criteria and options
   *
   * @param {Object} criteria - mongodb criteria style
   * @param {Object} options - mongodb options style
   * @return {Promise<Object[], Error>}
   * @access public
   * @override
   */
  get(criteria = {}, options= {}) {
    throw new Error('AbstractStorage: Method not set up');
  }

  /**
   * Insert one Object in database
   *
   * @param {Object[]} dataArray - a list of data Object
   * @return {Promise<Object, Error>} - inserted data Object
   * @access public
   * @override
   */
  insertOne(data={}) {
    throw new Error('AbstractStorage: Method not set up');
  }

  /**
   * Update collection from criteria
   *
   * @param {Object} criteria - MongoDb criteria Object
   * @param {Object} newValues - key-value Object with new data
   * @param {Object} options - MongoDb options
   * @param {boolean} options.upsert - insert if not exists
   * @param {boolean} options.multi - update multi Object enabled
   * @return {Promise<Boolean, Error>} - true if updated, else false
   * @access public
   * @override
   */
  updateOne(criteria, newData) {
    throw new Error('AbstractStorage: Method not set up');
  }

  /**
   * Delete collection Object from criteria
   *
   * @param {Object} criteria - MongoDb criteria Object
   * @return {Promise<integer, Error>} - number of deleted items
   * @access public
   * @override
   */
  delete(criteria) {
    throw new Error('AbstractStorage: Method not set up');
  }
}
