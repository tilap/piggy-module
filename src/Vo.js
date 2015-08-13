import { VoError } from './Errors';
import caster from './utils/castValue';

let ID_KEY= '_id';

export default class Vo {

  constructor(data = {}) {
    this.resetData();
    this.setData(data);
    this._status = this.id ? Vo.STATUS.SAVED : Vo.STATUS.NEW;
  }

  get id() {
    return this.data[ID_KEY] ? this.data[ID_KEY].toString() : null;
  }

  get dto() {
    return this.data;
  }

  get isNew() {
    return this.status === Vo.STATUS.NEW;
  }

  get isChanged() {
    return this.status === Vo.STATUS.CHANGED;
  }

  get isSaved() {
    return this.status === Vo.STATUS.SAVED;
  }

  get(key, defaultValue=null) {
    this.constructor.assumePropertyExists(key);
    return this.data[key] ? this.data[key] : defaultValue;
  }

  set(key, value) {
    this.constructor.assumePropertyExists(key);
    value = this.castVoPropertyValue(key, value);
    if (this.data[key] !== value) {
      this.data[key]= value;
      this._updateStatus(Vo.STATUS.CHANGED);
    }
    return this;
  }

  setData(data={}) {
    Object.keys(data).forEach( property => {
      this.set(property, data[property]);
    });
    return this;
  }

  resetData() {
    this.data = {};
    return this;
  }

  get status() {
    return this._status;
  }

  set status(value) {
    throw new Error('Vo Status cannot be changed');
  }

  castVoPropertyValue(key, value) {
    this.constructor.assumePropertyExists(key);
    try {
      return caster(value, this.constructor.getPropertyConfig(key).type);
    }
    catch(err) {
      throw new VoError('Cast property failed for property "' + key + '": ' + err.message);
    }
  }

  _updateStatus(newStatus) {
    if(this.status === newStatus) {
      return false;
    }
    let previousStatus = this.status;
    this._status = newStatus;
    this.statusChangeTrigger(previousStatus, newStatus);
    return true;
  }

  // @todo replace with event emitter
  statusChangeTrigger(previousStatus, newStatus) {} // jshint ignore:line

  static get primaryKey() {
    return ID_KEY;
  }

  static assumePropertyExists(property) {
    if(!this.hasProperty(property)) {
      throw new VoError('The property ' + property + ' is not defined in ' + this.constructor.name);
    }
  }

  static hasProperty(key) {
    return this.getPropertiesNames().indexOf(key) > -1;
  }

  static getPropertiesNames() {
    return Object.keys(this._properties);
  }

  static getPropertyConfig(key) {
    this.assumePropertyExists(key);
    return this._properties[key];
  }

  static getPropertyType(key) {
    this.assumePropertyExists(key);
    return this.getPropertyConfig(key).type || null;
  }

  static getPropertyDefault(key) {
    this.assumePropertyExists(key);
    return this.getPropertyConfig(key).default || null;
  }
}

Object.defineProperty(Vo, 'STATUS', {
  enumerable: false,
  writable: false,
  configurable: false,
  value: Object.freeze({
    NEW: 'new',
    CHANGED: 'changed',
    SAVED: 'saved'
  })
});

Vo.init = function(VoChild, properties) {
  let objectProperties = {};
  Object.keys(properties).forEach((name) => {
    if (VoChild.hasOwnProperty(name)) {
      throw new Error('Property ' + name + ' is a reserved keyname');
    }

    let cleanedProperty = {};
    ['type', 'default'].forEach( elmt => {
      if(properties[name][elmt]) {
        cleanedProperty[elmt] = properties[name][elmt];
      }
    });
    objectProperties[name] = cleanedProperty;

    Object.defineProperty(VoChild.prototype, name, {
      get: function() {
        return this.get(name);
      },
      set: function(value) {
        this.set(name, value);
      }
    });
  });

  Object.defineProperty(VoChild, '_properties', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: objectProperties
  });
};
