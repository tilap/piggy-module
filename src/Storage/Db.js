import AbstractStorage from './Abstract';
import { StorageError } from './../Errors';

export default class Storage extends AbstractStorage{

  constructor(collection) {
    super(collection);
  }

  get(criteria = {}) {
    return new Promise( (resolve, reject) => {
      return this.collection.find(criteria, (err, items) => {
        if(err) {
          reject(err);
        }
        resolve(items);
      });
    });
  }

  insert(voData) {
    return new Promise( (resolve, reject) => {
      this.collection.insert(voData, (err, newItem) => {
        if(err) {
          reject(err);
        }
        else if(!newItem) {
          reject( new StorageError('Error while inserting (no new item)') );
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
          reject(err);
        }
        resolve(deleteRowCount);
      });
    });
  }
}
