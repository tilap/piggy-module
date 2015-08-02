import ManagerError from './Errors';

export default class Manager {

  constructor(storage) {
    this.storage = storage;
  }

  assumeIsOwnVoClass(vo) {
    if(vo.constructor.name !== this.constructor.voClass.name) {
      throw new ManagerError('Require a ' + this.constructor.voClass.name + ' class');
    }
  }

  getNewVo(data={}) {
    return new this.constructor.voClass(data);
  }

  get(criteria={}, options={}) {
    return this.storage.get(criteria, options)
      .catch( err => {
        throw new ManagerError(err.message);
      })
      .then( items => {
        let res = [];
        items.map( item => {
          res.push(this.getNewVo(item));
        });
        return res;
      })
      .catch( err => {
        throw new ManagerError(err.message);
      });
  }

  saveOne(vo) {
    return vo.id ? this.updateOne(vo) : this.insertOne(vo);
  }

  insertOne(vo) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve, reject) => {
      this.getAllVoErrors(vo)
        .then( errors => {
          if(Object.keys(errors).length>0) {
            return reject(errors);
          }

          this.storage.insert(vo.data)
            .then(newItemData => {
              resolve(this.getNewVo(newItemData));
            })
        })
        .catch(err => {
          reject( new ManagerError(err.message) );
        });
    });
  }

  updateOne(vo) {
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
        })
        .catch(err => {
          reject( new ManagerError(err.message) );
        });
    });
  }

  delete(vosArr) {
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

  deleteOne(vo) {
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

  getByUniqueProperty(property, value) {
    return new Promise( (resolve, reject) => {
      if(!this.constructor.validatorClass.isPropertyUnique(property)) {
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

  // Get objects having a unique property in the values array
  getByUniquePropertyM(property, values) {
    return new Promise( (resolve, reject) => {
      if(!this.constructor.validatorClass.isPropertyUnique(property)) {
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

  getAllVoErrors(vo, skipProperties= []) {
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

  getVoFormatErrors(vo) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve) => {
      let errors = {};
      let validator = new this.constructor.validatorClass(vo);
      validator.validateVo();
      if(validator.hasError()) {
        errors = validator.errors;
      }
      resolve(errors);
    });
  }

  getVoUniqueErrors(vo) {
    this.assumeIsOwnVoClass(vo);
    let result = {};
    let promises = [];

    this.constructor.validatorClass.uniques.forEach( property => {
      let value = vo[property];

      // Skip if empty and not required
      if(this.constructor.validatorClass.needToCheckProperty(property, value)) {
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
  getVoBusinessErrors(vo) {
    this.assumeIsOwnVoClass(vo);
    return new Promise( (resolve) => {
      return resolve({});
    });
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
    if(ValidatorClass.isPropertyUnique(property)) {
      let cleanProperty = property.replace(/([^a-z])/ig, '');
      let methodName = 'getBy' + cleanProperty.charAt(0).toUpperCase() + cleanProperty.substr(1).toLowerCase();
      // ManagerChild.prototype[methodName] = (value) => {
      //   return this.getByUniqueProperty(property, value);
      // }
      ManagerChild.prototype[methodName] = (value) => {
        return this.getByUniqueProperty(property, value);
      }
      // Object.defineProperty(ManagerChild, methodName, {
      //   enumerable: false,
      //   writable: false,
      //   configurable: false,
      //   value: (value) => {
      //     return ManagerChild.getByUniqueProperty(property, value);
      //   }
      // });
    }
  });
};
