import { StorageError } from './../Errors';

/**
 * Abstract storage for Vo.
 * Any method here must be implemented. If not, will throw a StorageError
 */
export default class AbstractStorage {
  /**
   * @param {?Object|Array|String} collection - the sotorage collection
   */
  constructor(collection=null) {
    /**
     * @type {?Object|Array|String}
     * @private
     */
    this._collection = collection;
  }

  /** @type {?Object|Array|String} */
  get collection() {
    return this._collection;
  }

  /**
   * Get a list of data Object from criteria and options
   *
   * @param {Object} criteria - mongodb criteria style
   * @param {Object} options - mongodb options style
   * @return {Promise<Object[], Error>}
   * @access public
   * @abstract
   */
  get(criteria, options) {
    throw new StorageError('Method not set up');
  }

  /**
   * Insert many data Object in storage
   *
   * @param [Object[]] dataArray - a list of data Object
   * @return {Promise<Object[], Error>} - inserted data Object list
   * @access public
   * @abstract
   */
  insert(voData) {
    throw new StorageError('Method not set up');
  }

  /**
   * Update collection from criteria
   *
   * @param {Object} criteria - MongoDb criteria Object
   * @param {Object} newValues - key-value Object with new data
   * @param {Object} options - Storage option
   * @return {Promise<integer, Error>} - number of updated items
   * @access public
   * @abstract
   */
  update(criteria={}, newValues={}, options={}) {
    throw new StorageError('Method not set up');
  }

  /**
   * Delete collection Object from criteria
   *
   * @param {Object} criteria - MongoDb criteria Object
   * @return {Promise<integer, Error>} - number of deleted items
   * @access public
   * @abstract
   */
  delete(criteria) {
    throw new StorageError('Method not set up');
  }
}
