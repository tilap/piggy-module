import AbstractStorage from './Abstract';
import { StorageError } from './../Errors';
import { ObjectId } from 'mongodb';

export default class Storage extends AbstractStorage{

  constructor(collection) {
    super(collection);
  }

  get(criteria = {}, options= {}) {
    if(criteria._id) {
      criteria._id = ObjectId(criteria._id);
    }
    return new Promise( (resolve, reject) => {
      this.collection
        .find(criteria, options)
        .toArray( (err, items) => {
          if(err) {
            return reject(err);
          }
          resolve(items);
        });
    });
  }

  insert(voData) {
    return new Promise( (resolve, reject) => {
      this.collection.insert(voData, (err, newItem) => {
        if(err) {
          return reject(err);
        }
        else if(!newItem) {
          return reject( new StorageError('Error while inserting (no new item)') );
        }
        else {
          resolve(newItem);
        }
      });
    });
  }

  update(criteria, newVoData) {
    return this.collection.update(criteria, newVoData, (err) => {
      if(err) {
        return Promise.reject(err);
      }
      return this.get(criteria);
    });
  }

  delete(criteria) {
    return new Promise( (resolve, reject) => {
      this.collection.remove(criteria, (err, deleteRowCount) => {
        if(err) {
          return reject(err);
        }
        resolve(deleteRowCount);
      });
    });
  }
}
