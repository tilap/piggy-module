'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Abstract = require('./Abstract');

var _Abstract2 = _interopRequireDefault(_Abstract);

var _Errors = require('./../Errors');

var Storage = (function (_AbstractStorage) {
  _inherits(Storage, _AbstractStorage);

  function Storage(collection, name) {
    _classCallCheck(this, Storage);

    _get(Object.getPrototypeOf(Storage.prototype), 'constructor', this).call(this, collection, name);
  }

  _createClass(Storage, [{
    key: 'get',
    value: function get() {
      var _this = this;

      var criteria = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new Promise(function (resolve, reject) {
        return _this.collection.find(criteria, function (err, items) {
          if (err) {
            reject(err);
          }
          resolve(items);
        });
      });
    }
  }, {
    key: 'insert',
    value: function insert(voData) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.collection.insert(voData, function (err, newItem) {
          if (err) {
            reject(err);
          } else if (!newItem) {
            reject(new _Errors.StorageError('Error while inserting (no new item)'));
          } else {
            resolve(newItem);
          }
        });
      });
    }
  }, {
    key: 'update',
    value: function update(criteria, newVoData) {
      var _this3 = this;

      return this.collection.update(criteria, newVoData, function (err) {
        if (err) {
          return Promise.reject(err);
        }
        return _this3.get(criteria);
      });
    }
  }, {
    key: 'delete',
    value: function _delete(criteria) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4.collection.remove(criteria, function (err, deleteRowCount) {
          if (err) {
            reject(err);
          }
          resolve(deleteRowCount);
        });
      });
    }
  }]);

  return Storage;
})(_Abstract2['default']);

exports['default'] = Storage;
module.exports = exports['default'];
//# sourceMappingURL=../Storage/Db.js.map