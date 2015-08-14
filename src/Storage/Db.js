import AbstractStorage from './Abstract';
import { ObjectId } from 'mongodb';

/**
 * Manage data from a mongodb collection.
 */
export default class Storage extends AbstractStorage{

  /**
   * @param {Object} collection - A mongodb collection
   */
  constructor(collection) {
    super(collection);
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
    criteria = this._prepareCriteria(criteria);
    return new Promise( (resolve, reject) => {
      this.collection
        .find(criteria, options)
        .toArray( (err, items) => {
          if(err) {
            return reject( new Error('Storage error in get()'));
          }
          resolve(items);
        });
    });
  }

  /**
   * Get a paginated list of data Object
   *
   * @param {Object} criteria - mongodb criteria style
   * @param {integer} page - the page to retrieve
   * @param {integer} limit - number of item per page
   * @param {string} orderby - a mongodb collection property to order the list result
   * @param {string} order - 'asc' or 'desc'
   * @return {Promise<Object[], Error>}
   * @access public
   */
  getByPage(criteria, page=1, limit=15, orderby='id', order='asc') {
    page = page > 0  || 1;
    let options = {};
    options.limit = limit;
    options.skip = (page-1) * limit;
    options.sort = [[ orderby, order ? 'asc' : 'desc']];
    return this.get(criteria, options);
  }

  /**
   * Insert many data Object in database
   *
   * @param {Object[]} dataArray - a list of data Object
   * @return {Promise<Object[], Error>} - inserted data Object list
   * @access public
   * @override
   */
  insert(dataArray) {
    if(dataArray.constructor !== Array ) {
      throw new Error('DB insert: Expected array');
    }

    return new Promise( (resolve, reject) => {
      this.collection.insert(dataArray, (err, insertResult) => {
        if(err) {
          return reject( new Error ('Storage error: insert() ' + err.message) );
        }
        let insertedDatas = insertResult.ops;
        resolve(insertedDatas);
      });
    });
  }

  /**
   * Update collection from criteria
   *
   * @param {Object} criteria - MongoDb criteria Object
   * @param {Object} newValues - key-value Object with new data
   * @param {Object} options - MongoDb options
   * @param {boolean} options.upsert - insert if not exists
   * @param {boolean} options.multi - update multi Object enabled
   * @return {Promise<integer, Error>} - number of updated items
   * @access public
   * @override
   */
  update(criteria, newValues, options={upsert: false, multi: true}) {
    criteria = this._prepareCriteria(criteria);
    newValues = this._stripIdCriteria(newValues);
    return new Promise( (resolve, reject) => {
      this.collection.update(criteria, { $set: newValues}, options, (err, updateResult) => {
        if(err) {
          return reject(new Error('Storage error: update() ' + err.message));
        }
        resolve(updateResult.result.n);
      });
    });
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
    criteria = this._prepareCriteria(criteria);
    return new Promise( (resolve, reject) => {
      this.collection.remove(criteria, (err, deleteResult) => {
        if(err) {
          return reject( new Error('Storage error: delete() ' + err.message) );
        }
        let affetctedRows = deleteResult.result.n;
        resolve(affetctedRows);
      });
    });
  }

  /**
   * Prepare criteria Object
   *
   * @param {Object} criteria - MongoDb criteria Object
   * @return {Object} criteria - MongoDb criteria Object with first level id string replaced by ObjectId
   * @access private
   *
   * @todo: manage multi level, array, recursive replacement
   */
  _prepareCriteria(criteria) {
    if(criteria._id && criteria._id.constructor === String) {
      criteria._id = ObjectId(criteria._id);
    }
    return criteria;
  }

  /**
   * Remove id criteria if any
   *
   * @param {Object} criteria - MongoDb criteria Object
   * @return {Object} criteria - MongoDb criteria Object without first level id criteria
   * @access private
   */
  _stripIdCriteria(criteria) {
    if(criteria._id) {
      delete criteria._id;
    }
    return criteria;
  }
}
