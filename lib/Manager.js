'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Errors = require('./Errors');

var _Errors2 = _interopRequireDefault(_Errors);

var Manager = (function () {
  function Manager(storage) {
    _classCallCheck(this, Manager);

    this.storage = storage;
  }

  _createClass(Manager, [{
    key: 'assumeIsOwnVoClass',
    value: function assumeIsOwnVoClass(vo) {
      if (vo.constructor.name !== this.constructor.voClass.name) {
        throw new _Errors2['default']('Require a ' + this.constructor.voClass.name + ' class');
      }
    }
  }, {
    key: 'getNewVo',
    value: function getNewVo() {
      var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new this.constructor.voClass(data);
    }
  }, {
    key: 'get',
    value: function get() {
      var _this = this;

      var criteria = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return this.storage.get(criteria, options)['catch'](function (err) {
        throw new _Errors2['default'](err.message);
      }).then(function (items) {
        var res = [];
        items.map(function (item) {
          res.push(_this.getNewVo(item));
        });
        return res;
      })['catch'](function (err) {
        throw new _Errors2['default'](err.message);
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
            resolve(_this2.getNewVo(newItemData));
          });
        })['catch'](function (err) {
          reject(new _Errors2['default'](err.message));
        });
      });
    }
  }, {
    key: 'updateOne',
    value: function updateOne(vo) {
      var _this3 = this;

      this.assumeIsOwnVoClass(vo);
      return new Promise(function (resolve, reject) {
        return _this3.getAllVoErrors(vo).then(function (errors) {
          if (Object.keys(errors).length > 0) {
            return reject(errors);
          }
          var criteria = { _id: vo.id };
          _this3.storage.update(criteria, vo.data).then(function () {
            return _this3.get(criteria);
          }).then(function (items) {
            resolve(items[0]);
          });
        })['catch'](function (err) {
          reject(new _Errors2['default'](err.message));
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
        // Check property is a unique one
        if (!_this6.constructor.validatorClass.isPropertyUnique(property)) {
          return reject(new Error('The property "' + property + '" is not unique'));
        }

        // @todo add cast to value
        // value = this.constructor.voClass.castVoPropertyValue(property, value);

        var criteria = {};
        criteria[property] = value;

        _this6.get(criteria).then(function (result) {
          console.log(criteria, result);
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
        if (!_this7.constructor.validatorClass.isPropertyUnique(property)) {
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
        var validator = new _this9.constructor.validatorClass(vo);
        validator.validateVo();
        resolve(validator.hasError() ? validator.errors : {});
      });
    }
  }, {
    key: 'getVoUniqueErrors',
    value: function getVoUniqueErrors(vo) {
      var _this10 = this;

      this.assumeIsOwnVoClass(vo);
      var result = {};
      var promises = [];

      this.constructor.validatorClass.uniques.forEach(function (property) {
        var value = vo[property];

        // Skip if empty and not required
        if (_this10.constructor.validatorClass.needToCheckProperty(property, value)) {
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

    // Expose a list of available method of the instance
    // @todo: will maybe need to be recursive
  }, {
    key: 'availableMethods',
    get: function get() {
      var OwnMethods = Object.getOwnPropertyNames(Manager.prototype);
      var childMethods = Object.getOwnPropertyNames(this.__proto__);

      var methods = childMethods;
      OwnMethods.forEach(function (method) {
        if (methods.indexOf(method) < 0) {
          methods.push(method);
        }
      });
      return methods;
    }
  }]);

  return Manager;
})();

exports['default'] = Manager;

Manager.init = function (ManagerChild, VoClass, ValidatorClass) {

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

  VoClass.getPropertiesNames().forEach(function (property) {
    if (ValidatorClass.isPropertyUnique(property)) {
      var cleanProperty = property.replace(/([^a-z0-9])/ig, '');
      var methodName = 'getOneBy' + cleanProperty.charAt(0).toUpperCase() + cleanProperty.substr(1).toLowerCase();
      Object.defineProperty(ManagerChild.prototype, methodName, {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function value(_value) {
          return this.getByUniqueProperty(property, _value);
        }
      });
    }
  });
};
module.exports = exports['default'];
//# sourceMappingURL=Manager.js.map