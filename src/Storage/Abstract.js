import { StorageError } from './../Errors';

export default class AbstractStorage {
  constructor(collection, name) {
    this._collection = collection || null;
    this._name = name || '';
  }

  get collection() {
    return this._collection;
  }

  get(criteria, fields) { // jshint ignore:line
    throw new StorageError('Method not set up');
  }

  insert(vo) { // jshint ignore:line
    throw new StorageError('Method not set up');
  }

  update(vo) { // jshint ignore:line
    throw new StorageError('Method not set up');
  }

  delete(vo) { // jshint ignore:line
    throw new StorageError('Method not set up');
  }
}
