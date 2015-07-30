'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Errors = require('./Errors');

var Manager = (function () {
  function Manager() {
    _classCallCheck(this, Manager);
  }

  _createClass(Manager, null, [{
    key: 'assumeIsOwnVoClass',
    value: function assumeIsOwnVoClass(vo) {
      if (vo.constructor.name !== this.voClass.name) {
        throw new _Errors.ManagerError('Require a ' + this.voClass.name + ' class');
      }
    }
  }, {
    key: 'get',
    value: function get(criteria) {
      var _this = this;

      return this.storage.get(criteria).then(function (items) {
        var res = [];
        items.map(function (item) {
          res.push(new _this.voClass(item));
        });
        return res;
      });
    }
  }, {
    key: 'saveOne',
    value: function saveOne(vo) {
      return vo.id ? this.updateOne(vo) : this.insertOne(vo);
    }
  }, {
    key: 'insertOne',
    value: function insertOne(vo) {
      var _this2 = this;

      this.assumeIsOwnVoClass(vo);
      return new Promise(function (resolve, reject) {
        _this2.getAllVoErrors(vo).then(function (errors) {
          if (Object.keys(errors).length > 0) {
            return reject(errors);
          }

          _this2.storage.insert(vo.data).then(function (newItemData) {
            resolve(new _this2.voClass(newItemData));
          })['catch'](function (err) {
            reject(new _Errors.ManagerError(err.message));
          });
        });
      });
    }
  }, {
    key: 'updateOne',
    value: function updateOne(vo) {
      var _this3 = this;

      this.assumeIsOwnVoClass(vo);
      return new Promise(function (resolve, reject) {
        _this3.getAllVoErrors(vo).then(function (errors) {
          if (Object.keys(errors).length > 0) {
            return reject(errors);
          }
          var criteria = { _id: vo.id };
          _this3.storage.update(criteria, vo.data).then(function () {
            return _this3.get(criteria);
          }).then(function (items) {
            resolve(items[0]);
          });
        });
      });
    }
  }, {
    key: 'delete',
    value: function _delete(vosArr) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var ids = [];
        vosArr.forEach(function (vo) {
          ids.push(vo.id);
        });

        var criteria = { _id: { $in: ids } };
        _this4.storage['delete'](criteria).then(function (deletedItemCount) {
          resolve(deletedItemCount);
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'deleteOne',
    value: function deleteOne(vo) {
      var _this5 = this;

      this.assumeIsOwnVoClass(vo);
      return new Promise(function (resolve, reject) {
        var criteria = { _id: vo.id };
        _this5.storage['delete'](criteria).then(function (deletedItemCount) {
          resolve(deletedItemCount === 1);
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'getByUniqueProperty',
    value: function getByUniqueProperty(property, value) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        if (!_this6.validatorClass.isPropertyUnique(property)) {
          return reject(new Error('The property "' + property + '" is not unique'));
        }

        // @todo add cast to value
        // value = this.voClass.castVoPropertyValue(property, value);

        var criteria = {};
        criteria[property] = value;

        _this6.get(criteria).then(function (result) {
          switch (result.length) {
            case 0:
              resolve(null);
              break;
            case 1:
              resolve(result[0]);
              break;
            default:
              reject(new Error('Got multiple object and must only get one'));
          }
        }, function (err) {
          reject(err);
        });
      });
    }

    // Get objects having a unique property in the values array
  }, {
    key: 'getByUniquePropertyM',
    value: function getByUniquePropertyM(property, values) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        if (!_this7.validatorClass.isPropertyUnique(property)) {
          return reject(new Error('The property "' + property + '" is not unique'));
        }

        if (values.constructor !== Array) {
          return reject(new Error('Values must be an array'));
        }

        var criteria = {};
        criteria[property] = { $in: values };
        _this7.get(criteria).then(function (results) {
          resolve(results);
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'getAllVoErrors',
    value: function getAllVoErrors(vo) {
      var _this8 = this;

      var skipProperties = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      this.assumeIsOwnVoClass(vo);
      return new Promise(function (resolve, reject) {
        Promise.all([_this8.getVoFormatErrors(vo), _this8.getVoUniqueErrors(vo), _this8.getVoBusinessErrors(vo)]).then(function (errorsArrays) {
          var errors = {};
          errorsArrays.map(function (errorType) {
            Object.keys(errorType).map(function (field) {
              if (!errors[field] && skipProperties.indexOf(field) < 0) {
                errors[field] = errorType[field];
              }
            });
          });
          resolve(errors);
        }, function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: 'getVoFormatErrors',
    value: function getVoFormatErrors(vo) {
      var _this9 = this;

      this.assumeIsOwnVoClass(vo);
      return new Promise(function (resolve) {
        var errors = {};
        var validator = new _this9.validatorClass(vo);
        validator.validateVo();
        if (validator.hasError()) {
          errors = validator.errors;
        }
        resolve(errors);
      });
    }
  }, {
    key: 'getVoUniqueErrors',
    value: function getVoUniqueErrors(vo) {
      var _this10 = this;

      this.assumeIsOwnVoClass(vo);
      var result = {};
      var promises = [];

      this.validatorClass.uniques.forEach(function (property) {
        var value = vo[property];

        // Skip if empty and not required
        if (_this10.validatorClass.needToCheckProperty(property, value)) {
          var p = _this10.getByUniqueProperty(property, value).then(function (foundVo) {
            if (foundVo == null) {
              return null;
            }
            if (!vo.id) {
              return property;
            }
            if (String(vo.id) === String(foundVo.id)) {
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

      return Promise.all(promises).then(function (propertiesWithError) {

        propertiesWithError.forEach(function (property) {
          if (property) {
            result[property] = 'unique';
          }
        });
        return result;
      });
    }

    // To extend to run business check on the VO
  }, {
    key: 'getVoBusinessErrors',
    value: function getVoBusinessErrors(vo) {
      this.assumeIsOwnVoClass(vo);
      return new Promise(function (resolve) {
        return resolve({});
      });
    }
  }]);

  return Manager;
})();

exports['default'] = Manager;

Manager.init = function (ManagerChild, VoClass, ValidatorClass, StorageInstance) {

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

  VoClass.getPropertiesNames().forEach(function (property) {
    if (ValidatorClass.isPropertyUnique(property)) {
      var cleanProperty = property.replace(/([^a-z])/ig, '');
      var methodName = 'getBy' + cleanProperty.charAt(0).toUpperCase() + cleanProperty.substr(1).toLowerCase();
      Object.defineProperty(ManagerChild, methodName, {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function value(_value) {
          return ManagerChild.getByUniqueProperty(property, _value);
        }
      });
    }
  });
};
module.exports = exports['default'];
//# sourceMappingURL=Manager.js.map