import AbstractStorage from './Abstract';
import { ObjectId } from 'mongodb';

export default class Storage extends AbstractStorage{

  constructor(collection) {
    super(collection);
  }

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

  getByPage(criteria, page=1, limit=15, orderby='id', order=1) {
    page = page > 0  || 1;
    let options = {};
    options.limit = limit;
    options.skip = (page-1) * limit;
    options.sort = [[ orderby, order ? 'asc' : 'desc']];
    return this.get(criteria, options);
  }

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

  update(criteria, newValues, options={upsert: false, multi: true}) {
    criteria = this._prepareCriteria(criteria);
    newValues = this._stripIdCriteria(newValues);
    return new Promise( (resolve, reject) => {
      this.collection.update(criteria, { $set: newValues}, options, (err, updateResult) => {
        if(err) {
          throw new Error('Storage error: update() ' + err.message);
        }
        resolve(updateResult.result.n);
      });
    });
  }

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

  _prepareCriteria(criteria) {
    if(criteria._id && criteria._id.constructor === String) {
      criteria._id = ObjectId(criteria._id);
    }
    return criteria;
  }

  _stripIdCriteria(criteria) {
    if(criteria._id) {
      delete criteria._id;
    }
    return criteria;
  }
}
