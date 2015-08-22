import caster from './utils/castValue';

let ID_KEY= '_id';

/**
 * Value Object
 */
export default class Vo {

  /**
   * @param {Object} data - the object data
   */
  constructor(data = {}) {
    this.resetData();
    this.setData(data);
    /** @type {String} */
    this._status = this.id ? Vo.STATUS.SAVED : Vo.STATUS.NEW;
  }

  /**
   * Get the id as string
   * @return {String}
   */
  get id() {
    return this.data[ID_KEY] ? this.data[ID_KEY].toString() : null;
  }

  /**
   * Get the cleaned dto
   * @return {Object}
   */
  get dto() {
    return this.data;
  }

  /**
   * Is the object new (not saved) ?
   * @return {Boolean}
   */
  get isNew() {
    return this.status === Vo.STATUS.NEW;
  }

  /**
   * Is the object unsaved (exist in storage but has changed) ?
   * @return {Boolean}
   */
  get isChanged() {
    return this.status === Vo.STATUS.CHANGED;
  }

  /**
   * Is the object saved in storage ?
   * @return {Boolean}
   */
  get isSaved() {
    return this.status === Vo.STATUS.SAVED;
  }

  /**
   * Property getter
   * @param {string} key - the property name
   * @param {?any} defaultValue - the default value if the property is not set
   * @return {any}
   * @throw {Error} - if property does not exist
   * @access public
   */
  get(key, defaultValue=null) {
    this.constructor.assumePropertyExists(key);
    return this.data[key] ? this.data[key] : defaultValue;
  }

  /**
   * Property setter
   * @param {string} key - the property name
   * @param {any} value - the value to assign
   * @return {self}
   * @throw {Error} - if property does not exist
   * @access public
   */
  set(key, value) {
    this.constructor.assumePropertyExists(key);
    value = this.castVoPropertyValue(key, value);
    if (this.data[key] !== value) {
      this.data[key]= value;
      this._updateStatus(Vo.STATUS.CHANGED);
    }
    return this;
  }

  /**
   * Multi property setting
   * @param {Object} data - associated key value object
   * @return {self}
   * @access public
   */
  setData(data={}) {
    Object.keys(data).forEach( property => {
      this.set(property, data[property]);
    });
    return this;
  }

  /**
   * Reset all vo data
   * @return {self}
   * @access public
   */
  resetData() {
    this.data = {};
    return this;
  }

  /**
   * Status (from Vo.STATUS values: 'new', 'changed' or 'saved')
   * @return {String}
   */
  get status() {
    return this._status;
  }

  /**
   * To make sure status cannot be access in public
   * @param {any} value
   * @throw {Error}
   */
  set status(value) {
    throw new Error('Vo Status cannot be changed');
  }

  /**
   * Cast a Vo property and return property well formated
   * @param {String} key - the property name
   * @param {any} value - the property value to cast
   * @return {any} - the cast property
   * @access public
   */
  castVoPropertyValue(key, value) {
    this.constructor.assumePropertyExists(key);
    try {
      return caster(value, this.constructor.getPropertyConfig(key).type);
    }
    catch(err) {
      throw new Error('Cast property failed for property "' + key + '": ' + err.message);
    }
  }

  /**
   * Update the status and trigger status change event
   * @param {String} newStatus - the new status (one of the Vo.STATUS)
   * @return {boolean} - true if the status has changed, else false
   * @access private
   */
  _updateStatus(newStatus) {
    if(this.status === newStatus) {
      return false;
    }
    let previousStatus = this.status;
    this._status = newStatus;
    this.statusChangeTrigger(previousStatus, newStatus);
    return true;
  }

  /**
   * Method triggered when status change. To override by custom one
   * @param {String} previousStatus - the old status (one of the Vo.STATUS)
   * @param {String} newStatus - the new status (one of the Vo.STATUS)
   * @access protected
   */
  statusChangeTrigger(previousStatus, newStatus) {} // jshint ignore:line

  /**
   * Get the primary key name
   * @return {String}
   */
  static get primaryKey() {
    return ID_KEY;
  }

  /**
   * Check if a Vo property exists, else throw an Error
   * @param {String} property - the property name
   * @throw {Error}
   * @access public
   * @static
   */
  static assumePropertyExists(property) {
    if(!this.hasProperty(property)) {
      throw new Error('The property ' + property + ' is not defined in ' + this.constructor.name);
    }
  }

  /**
   * Check if a Vo property exists
   * @param {String} property - the property name
   * @return {boolean}
   * @access public
   * @static
   */
  static hasProperty(property) {
    return this.getPropertiesNames().indexOf(property) > -1;
  }

  /**
   * Get a list of all the properies of the Vo
   * @return {String[]}
   * @access public
   * @static
   */
  static getPropertiesNames() {
    return Object.keys(this._properties);
  }

  /**
   * Get all configuration of a property
   * @param {String} property - the property name
   * @return {Object}
   * @throw {Error} - if property does not exist
   * @access public
   * @static
   */
  static getPropertyConfig(property) {
    this.assumePropertyExists(property);
    return this._properties[property];
  }

  /**
   * Get the type of a property according to config
   * @param {String} property - the property name
   * @return {String}
   * @throw {Error} - if property does not exist
   */
  static getPropertyType(property) {
    this.assumePropertyExists(property);
    return this.getPropertyConfig(property).type || null;
  }

  /**
   * Get the default value of a property according to config
   * @param {String} property - the property name
   * @return {String}
   * @throw {Error} - if property does not exist
   */
  static getPropertyDefault(property) {
    this.assumePropertyExists(property);
    return this.getPropertyConfig(property).default || null;
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
