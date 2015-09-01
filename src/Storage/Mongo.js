import AbstractStorage from './Abstract';
import { ObjectId } from 'mongodb';

/**
 * Manage data from a mongodb collection.
 */
export default class MongoStorage extends AbstractStorage{

  /**
   * @param {Object} collection - A mongodb collection
   */
  constructor(connector, collection) {
    super(connector, collection);
  }

  getCollection() {
    return new Promise( (resolve, reject) => {
      this._connector.getCollection(this._collection)
        .then( collection => resolve( collection ) )
        .catch( error => {
          console.error('MongoStorage getCollection error', error);
          reject(error);
        });
    });
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
      this.getCollection()
        .then( collection => {
          collection
            .find(criteria, options)
            .toArray( (err, items) => {
              if(err) {
                return reject( new Error('Storage error in get()'));
              }
              resolve(items);
            });
        })
        .catch( error => {
          console.error('MongoStorage error', error);
          reject(error);
        });
    });
  }

  /**
   * Insert one Object in database
   *
   * @param {Object[]} dataArray - a list of data Object
   * @return {Promise<Object[], Error>} - inserted data Object list
   * @access public
   * @override
   */
  insertOne(data={}) {
    return new Promise( (resolve, reject) => {
      this.getCollection()
        .then( collection => {
          collection.insert(data, (err, insertResult) => {
            if(err) {
              return reject( new Error ('Storage error: insert() ' + err.message) );
            }
            if(!insertResult.ops || insertResult.ops.length!==1) {
              return reject( new Error ('Storage error: non unique result') );
            }
            let insertedDatas = insertResult.ops[0];
            resolve(insertedDatas);
          });
        })
        .catch( error => reject(error));
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
   * @return {Promise<Boolean, Error>} - true if updated, else false
   * @access public
   * @override
   */
  updateOne(criteria, newData) {
    let options= { upsert: false, multi: false };
    criteria = this._prepareCriteria(criteria);
    newData = this._stripIdCriteria(newData);
    return new Promise( (resolve, reject) => {
      this.getCollection()
        .then( collection => {
            collection.update(criteria, { $set: newData}, options, (err, updateResult) => {
            if (err) {
              return reject(new Error('Storage error: update() ' + err.message));
            }
            this.get(criteria).then( vos => {
              if(!vos[0]) {
                return reject('Error post update #1');
              }
              let res = vos[0];
              return resolve(res);
            })
            .catch(err => reject('Error post update #2'));
          });
        })
        .catch( error => reject(error));
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
      this.getCollection()
        .then( collection => {
          collection.deleteMany(criteria, (err, deleteResult) => {
            if(err) {
              return reject( new Error('Storage error: delete() ' + err.message) );
            }
            let deletedDocumentsCount = deleteResult.result.n;
            resolve({ 'deletedCount' : deletedDocumentsCount});
          });
        })
        .catch( error => reject(error));
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
    if (criteria._id) {
      if (criteria._id.constructor === String) {
        criteria._id = new ObjectId(criteria._id);
      }
      if (criteria._id.$in) {
        criteria._id.$in = criteria._id.$in.map( idStr => {
          return new ObjectId(idStr);
        });
      }
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
