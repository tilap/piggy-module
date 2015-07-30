'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Errors = require('./../Errors');

var AbstractStorage = (function () {
  function AbstractStorage(collection, name) {
    _classCallCheck(this, AbstractStorage);

    this._collection = collection || null;
    this._name = name || '';
  }

  _createClass(AbstractStorage, [{
    key: 'get',
    value: function get(criteria, fields) {
      // jshint ignore:line
      throw new _Errors.StorageError('Method not set up');
    }
  }, {
    key: 'insert',
    value: function insert(vo) {
      // jshint ignore:line
      throw new _Errors.StorageError('Method not set up');
    }
  }, {
    key: 'update',
    value: function update(vo) {
      // jshint ignore:line
      throw new _Errors.StorageError('Method not set up');
    }
  }, {
    key: 'delete',
    value: function _delete(vo) {
      // jshint ignore:line
      throw new _Errors.StorageError('Method not set up');
    }
  }, {
    key: 'collection',
    get: function get() {
      return this._collection;
    }
  }]);

  return AbstractStorage;
})();

exports['default'] = AbstractStorage;
module.exports = exports['default'];
//# sourceMappingURL=../Storage/Abstract.js.map