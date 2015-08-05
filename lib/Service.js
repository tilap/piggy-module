'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Service = (function () {
  function Service(manager) {
    _classCallCheck(this, Service);

    this._manager = manager;
  }

  _createClass(Service, [{
    key: 'createOneFromData',
    value: function createOneFromData(data) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var vo = _this._manager.getNewVo(data);
        return _this._manager.saveOne(vo)['catch'](function (err) {
          return reject(err);
        }).then(function (user) {
          resolve(user);
        });
      });
    }
  }, {
    key: 'get',
    value: function get() {
      var criteria = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return this._manager.get(criteria, options);
    }
  }, {
    key: 'getByPage',
    value: function getByPage() {
      var page = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
      var npp = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];
      var orderby = arguments.length <= 2 || arguments[2] === undefined ? 'username' : arguments[2];
      var order = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

      var criteria = {};
      var options = {};
      return this.get(criteria, options);
    }
  }, {
    key: 'getOneById',
    value: function getOneById(id) {
      return this._manager.getByUniqueProperty('_id', id);
    }
  }, {
    key: 'updateOneFromData',
    value: function updateOneFromData(data, id) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        return _this2.getOneById(id).then(function (vo) {
          if (null === vo) {
            return reject('not found');
          }
          vo.setData(data);
          return resolve(vo);
        }).then(function (vo) {
          return _this2._manager.saveOne(vo).then(function (vo) {
            return resolve(vo);
          });
        });
      });
    }
  }, {
    key: 'deleteOneById',
    value: function deleteOneById(id) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.getOneById(id).then(function (vo) {
          if (null === vo) {
            return resolve(null);
          }
          _this3._manager.deleteOne(vo).then(function (success) {
            return resolve(success === true);
          });
        });
      });
    }
  }, {
    key: 'availableMethods',
    get: function get() {
      var childMethods = Object.getOwnPropertyNames(this.__proto__);
      var OwnMethods = Object.getOwnPropertyNames(Service.prototype);

      var methods = childMethods;
      OwnMethods.forEach(function (method) {
        if (methods.indexOf(method) < 0) {
          methods.push(method);
        }
      });
      return methods;
    }
  }]);

  return Service;
})();

exports['default'] = Service;
module.exports = exports['default'];
//# sourceMappingURL=Service.js.map