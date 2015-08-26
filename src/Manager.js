import ValidationPropertyError from './ValidationPropertyError';
import ValidationError from './ValidationError';

/**
 * Manage Vo items, sending and getting them to the Storage
 */
export default class Manager {

  constructor(storage) {
    /** @type {Storage} - an instance storage*/
    this.storage = storage;
  }

  /**
   * Make sure an object has the current Manager Vo class
   *
   * @param {Vo} vo
   * @throw {Error}
   */
  assumeIsOwnVoClass(vo) {
    if (vo.constructor.name !== this.constructor.voClass.name) {
      throw new Error('Manager.assumeIsOwnVoClass() error: ' + this.constructor.voClass.name + ' expected class instace');
    }
  }

  /**
   * Get a new Vo, and fill it with data if any
   *
   * @param {?object} data
   * @return {Vo}
   */
  getNewVo(data={}) {
    return new this.constructor.voClass(data);
  }

  /**
   * Get a list of Vo
   *
   * @param {Object} criteria - mongodb-like criteria style
   * @param {Object} options - mongodb-like options style
   * @return {Promise<Vo[], Error>}
   * @access public
   */
  get(criteria={}, options={}) {
    return this.storage.get(criteria, options)
      .then( items => {
        let res = [];
        if (items.constructor===Array) {
          items.map( item => {
            res.push(this.getNewVo(item));
          });
        }
        return res;
      });
  }


  /**
   * Save a vo in storage, update if exists, or insert
   * @param {Vo} vo
   * @return {Promise<Vo[], Error>}
   * @access public
   */
  saveOne(vo) {
    return vo.id ? this.updateOne(vo) : this.insertOne(vo);
  }

  /**
   * Insert a vo in storage
   * @param {Vo} vo
   * @return {Promise<Vo[], Error>}
   * @access public
   */
  insertOne(vo) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve, reject) => {
      this.getAllVoErrors(vo)
        .then( validation => {
          if (validation.hasError()) {
            return reject(validation);
          }

          const data = vo.data;
          this.storage.insertOne(data)
            .catch(err => {
              throw new Error('Manager.insertOne() error: ' + err.message);
            })
            .then(newItemsData => resolve(this.getNewVo(newItemsData)) );
        })
        .catch(err => reject( err ));
    });
  }

  /**
   * Update a vo in storage
   * @param {Vo} vo
   * @return {Promise<Vo[], Error>}
   * @access public
   */
  updateOne(vo) {
    this.assumeIsOwnVoClass(vo);

    return new Promise( (resolve, reject) => {
      this.getAllVoErrors(vo)
        .then( validation => {
          if (validation.hasError()) {
            return reject(validation);
          }
          let criteria = { _id: vo.id };
          this.storage.updateOne(criteria, vo.data)
            .catch( err => reject(new Error('Manager.updateOne() error: ' + err.message)) )
            .then( updatedVoData => resolve(this.getNewVo(updatedVoData)) );
        })
        .catch(err => reject( err ));
    });
  }

  /**
   * Delete a list of Vo in storage
   * @param {Vo[]} Vo to delete
   * @return {Promise<boolean, Error>} number of deleted item
   * @access public
   */
  delete(vosArr) {
    let idsToDelete=[];
    vosArr.forEach( vo => {
      try {
        this.assumeIsOwnVoClass(vo);
        if(vo.id) {
          idsToDelete.push(vo.id);
        }
      }
      catch(err) {
        return null;
      }
    });
    let criteria = { _id: { $in: idsToDelete}};
    return new Promise( (resolve, reject) => {
      this.storage.delete(criteria)
        .then(result => {
          resolve(result.deletedCount);
        })
        .catch(err => reject(err));
    });
  }

  /**
   * Get a Vo from a unique property value
   * @param {string} property
   * @param {any} value - the unique property value to look for
   * @return {Promise<Vo, Error>}
   * @access public
   */
  getByUniqueProperty(property, value) {
    return new Promise( (resolve, reject) => {
      // Check property is a unique one
      if (!this.constructor.validatorClass.isPropertyUnique(property)) {
        return reject(new Error('The property "' + property + '" is not unique'));
      }

      // @todo add cast to value
      // value = this.constructor.voClass.castVoPropertyValue(property, value);

      let criteria = {};
      criteria[property] = value;

      this.get(criteria)
        .then( result => {
          switch(result.length) {
            case 0:
              resolve(null);
              break;
            case 1:
              resolve(result[0]);
              break;
            default:
              reject(new Error('Got multiple object and must only get one'));
          }
        }, err => {
          reject(err);
        });
    });
  }

  /**
   * Get a list of Vo from a unique property and many values
   * @param {string} property
   * @param {any[]} values - the unique property value to look for
   * @return {Promise<Vo[], Error>}
   * @access public
   */
  getByUniquePropertyM(property, values) {
    return new Promise( (resolve, reject) => {
      if (!this.constructor.validatorClass.isPropertyUnique(property)) {
        return reject(new Error('The property "' + property + '" is not unique'));
      }

      if (values.constructor!==Array) {
        return reject(new Error('Values must be an array'));
      }

      let criteria = {};
      criteria[property] = { $in: values};
      this.get(criteria)
        .then( results => {
          resolve(results);
        }, err => {
          reject(err);
        });
    });
  }

  /**
   * Get a list of all error of a Vo
   * @param {Vo} vo - the Vo to check
   * @param {string[]} skipProperties - a list of properties not to check
   * @return {Promise<object, Error>} - {validationError}
   * @access public
   */
  getAllVoErrors(vo, skipProperties= []) {
    this.assumeIsOwnVoClass(vo);
    let validationError = new ValidationError();
    return new Promise( (resolve, reject) => {
      Promise.all( [this.getVoFormatErrors(vo), this.getVoUniqueErrors(vo), this.getVoBusinessErrors(vo)] )
        .then( errorsArrays => {
          errorsArrays.map( errorsByType => {
            Object.keys(errorsByType).map( field => {
              if (!validationError.hasPropertyError(field) && skipProperties.indexOf(field) < 0) {
                validationError.setPropertyError(field, errorsByType[field]);
              }
            });
          });
          return resolve(validationError);
        },
        err => {
          reject(err);
        }
      );
    });

  }

  /**
   * Get a list of the properties format error of a Vo
   * @param {Vo} vo - the Vo to check
   * @return {Promise<object, Error>} - list of message errors (key: property, value: message)
   * @access public
   */
  getVoFormatErrors(vo) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve) => {
      let validator = new this.constructor.validatorClass(vo);
      validator.validateVo();
      resolve(validator.hasError() ? validator.errors : {});
    });
  }

  /**
   * Get a list of the unique properties error of a Vo
   * @param {Vo} vo - the Vo to check
   * @return {Promise<object, Error>} - list of message errors (key: property, value: message)
   * @access public
   */
  getVoUniqueErrors(vo) {
    this.assumeIsOwnVoClass(vo);
    let result = {};
    let promises = [];

    this.constructor.validatorClass.uniques.forEach( property => {
      let value = vo[property];

      // Skip if empty and not required
      if (this.constructor.validatorClass.needToCheckProperty(property, value)) {
        let p = this.getByUniqueProperty(property, value)
          .then ( foundVo => {
            if (foundVo == null) {
              return null;
            }
            if (!vo.id) {
              return property;
            }
            if (String(vo.id)===String(foundVo.id)) {
              return null;
            }
            return property;
          });
        promises.push(p);
      }
    });

    if (promises.length === 0) {
      return Promise.resolve({});
    }

    return Promise.all(promises)
      .then( uniquePromiseResults => {
        uniquePromiseResults.forEach( property => {
          if(property) {
            result[property] = new ValidationPropertyError(property, 'unique');
          }
        });
        return result;
      });
  }

  /**
   * Get a list of the  properties business errors of a Vo. To be override by business specific needs
   * @param {Vo} vo - the Vo to check
   * @return {Promise<object, Error>} - list of message errors (key: property, value: message)
   * @access public
   */
  getVoBusinessErrors(vo) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve) => {
      return resolve({});
    });
  }

  /**
   * Get the list of Class available methods
   *
   * @return {String[]} - the list of the callable methods
   * @access public
   */
  get availableMethods() {
    let OwnMethods = Object.getOwnPropertyNames(Manager.prototype);
    let childMethods = Object.getOwnPropertyNames(this.__proto__);

    let methods = childMethods;
    OwnMethods.forEach( method => {
      if (methods.indexOf(method) < 0) {
        methods.push(method);
      }
    });
    return methods;
  }
}


Manager.init = function(ManagerChild, VoClass, ValidatorClass) {

  Object.defineProperty(ManagerChild, 'voClass', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: VoClass
  });

  Object.defineProperty(ManagerChild, 'validatorClass', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: ValidatorClass
  });

  VoClass.getPropertiesNames().forEach( property => {
    if (ValidatorClass.isPropertyUnique(property)) {
      let cleanProperty = property.replace(/([^a-z0-9])/ig, '');
      let methodName = 'getOneBy' + cleanProperty.charAt(0).toUpperCase() + cleanProperty.substr(1).toLowerCase();
      Object.defineProperty(ManagerChild.prototype, methodName, {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function(value) {
          return this.getByUniqueProperty(property, value);
        }
      });
    }
  });
};
