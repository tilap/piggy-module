import { ManagerError } from './Errors';

export default class Manager {

  constructor() {
  }

  static assumeIsOwnVoClass(vo) {
    if(vo.constructor.name !== this.voClass.name) {
      throw new ManagerError('Require a ' + this.voClass.name + ' class');
    }
  }

  static get(criteria) {
    return this.storage.get(criteria)
      .then( items => {
        let res = [];
        items.map( item => {
          res.push(new this.voClass(item) );
        });
        return res;
      });
  }

  static saveOne(vo) {
    return vo.id ? this.updateOne(vo) : this.insertOne(vo);
  }

  static insertOne(vo) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve, reject) => {
      this.getAllVoErrors(vo)
        .then( errors => {
          if(Object.keys(errors).length>0) {
            return reject(errors);
          }

          this.storage.insert(vo.data)
            .then(newItemData => {
              resolve(new this.voClass(newItemData));
            })
            .catch(err => {
              reject( new ManagerError(err.message) );
            });
        });
    });
  }

  static updateOne(vo) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve, reject) => {
      this.getAllVoErrors(vo)
        .then( errors => {
          if(Object.keys(errors).length > 0) {
            return reject(errors);
          }
          let criteria = {_id: vo.id};
            this.storage.update(criteria, vo.data)
              .then( () => this.get(criteria) )
              .then(items => {
                resolve(items[0]);
              });
        });
    });
  }

  static delete(vosArr) {
    return new Promise( (resolve, reject) => {
      let ids = [];
      vosArr.forEach( vo => {
        ids.push(vo.id);
      });

      let criteria = { _id: { $in: ids}};
      this.storage.delete(criteria)
        .then(
          deletedItemCount => {
            resolve(deletedItemCount);
          },
          err => {
            reject(err);
          }
        );
    });
  }

  static deleteOne(vo) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve, reject) => {
      let criteria = { _id: vo.id };
      this.storage.delete(criteria)
        .then(
          deletedItemCount => {
            resolve(deletedItemCount===1);
          },
          err => {
            reject(err);
          }
        );
    });
  }

  static getByUniqueProperty(property, value) {

    return new Promise( (resolve, reject) => {
      if(!this.validatorClass.isPropertyUnique(property)) {
        return reject(new Error('The property "' + property + '" is not unique'));
      }

      // @todo add cast to value
      // value = this.voClass.castVoPropertyValue(property, value);

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

  // Get objects having a unique property in the values array
  static getByUniquePropertyM(property, values) {
    return new Promise( (resolve, reject) => {
      if(!this.validatorClass.isPropertyUnique(property)) {
        return reject(new Error('The property "' + property + '" is not unique'));
      }

      if(values.constructor!==Array) {
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

  static getAllVoErrors(vo, skipProperties= []) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve, reject) => {
      Promise.all( [this.getVoFormatErrors(vo), this.getVoUniqueErrors(vo), this.getVoBusinessErrors(vo)] )
        .then(
          errorsArrays => {
            let errors = {};
            errorsArrays.map( errorType => {
              Object.keys(errorType).map( field => {
                if(!errors[field] && skipProperties.indexOf(field) < 0) {
                  errors[field] = errorType[field];
                }
              });
            });
            resolve(errors);
          },
          err => {
            reject(err);
          }
        );
    });

  }

  static getVoFormatErrors(vo) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve) => {
      let errors = {};
      let validator = new this.validatorClass(vo);
      validator.validateVo();
      if(validator.hasError()) {
        errors = validator.errors;
      }
      resolve(errors);
    });
  }

  static getVoUniqueErrors(vo) {
    this.assumeIsOwnVoClass(vo);
    let result = {};
    let promises = [];

    this.validatorClass.uniques.forEach( property => {
      let value = vo[property];

      // Skip if empty and not required
      if(this.validatorClass.needToCheckProperty(property, value)) {
        let p = this.getByUniqueProperty(property, value)
          .then ( foundVo => {
            if(foundVo==null) {
              return null;
            }
            if(!vo.id) {
              return property;
            }
            if(String(vo.id)===String(foundVo.id)) {
              return null;
            }
            return property;
          });
        promises.push(p);
      }
    });

    if(promises.length === 0) {
      return Promise.resolve({});
    }

    return Promise.all(promises)
      .then( propertiesWithError => {

        propertiesWithError.forEach( property => {
          if(property) {
            result[property] = 'unique';
          }
        });
        return result;
      });
  }

  // To extend to run business check on the VO
  static getVoBusinessErrors(vo) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve) => {
      return resolve({});
    });
  }
}


Manager.init = function(ManagerChild, VoClass, ValidatorClass, StorageInstance) {

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

  Object.defineProperty(ManagerChild, 'storage', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: StorageInstance
  });

  VoClass.getPropertiesNames().forEach( property => {
    if(ValidatorClass.isPropertyUnique(property)) {
      let cleanProperty = property.replace(/([^a-z])/ig, '');
      let methodName = 'getBy' + cleanProperty.charAt(0).toUpperCase() + cleanProperty.substr(1).toLowerCase();
      Object.defineProperty(ManagerChild, methodName, {
        enumerable: false,
        writable: false,
        configurable: false,
        value: (value) => {
          return ManagerChild.getByUniqueProperty(property, value);
        }
      });
    }
  });
};
