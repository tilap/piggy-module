'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ModuleError = (function () {
  function ModuleError(message) {
    _classCallCheck(this, ModuleError);

    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      Object.defineProperty(this, 'stack', {
        value: new Error().stack
      });
    }

    Object.defineProperty(this, 'message', {
      value: message
    });
  }

  _createClass(ModuleError, [{
    key: 'name',
    get: function get() {
      return this.constructor.name;
    }
  }]);

  return ModuleError;
})();

exports['default'] = ModuleError;

var ServiceError = (function (_ModuleError) {
  _inherits(ServiceError, _ModuleError);

  function ServiceError() {
    _classCallCheck(this, ServiceError);

    _get(Object.getPrototypeOf(ServiceError.prototype), 'constructor', this).apply(this, arguments);
  }

  return ServiceError;
})(ModuleError);

exports.ServiceError = ServiceError;

var ManagerError = (function (_ModuleError2) {
  _inherits(ManagerError, _ModuleError2);

  function ManagerError() {
    _classCallCheck(this, ManagerError);

    _get(Object.getPrototypeOf(ManagerError.prototype), 'constructor', this).apply(this, arguments);
  }

  return ManagerError;
})(ModuleError);

exports.ManagerError = ManagerError;

var StorageError = (function (_ModuleError3) {
  _inherits(StorageError, _ModuleError3);

  function StorageError() {
    _classCallCheck(this, StorageError);

    _get(Object.getPrototypeOf(StorageError.prototype), 'constructor', this).apply(this, arguments);
  }

  return StorageError;
})(ModuleError);

exports.StorageError = StorageError;

var ValidatorError = (function (_ModuleError4) {
  _inherits(ValidatorError, _ModuleError4);

  function ValidatorError() {
    _classCallCheck(this, ValidatorError);

    _get(Object.getPrototypeOf(ValidatorError.prototype), 'constructor', this).apply(this, arguments);
  }

  return ValidatorError;
})(ModuleError);

exports.ValidatorError = ValidatorError;

var VoError = (function (_ModuleError5) {
  _inherits(VoError, _ModuleError5);

  function VoError() {
    _classCallCheck(this, VoError);

    _get(Object.getPrototypeOf(VoError.prototype), 'constructor', this).apply(this, arguments);
  }

  return VoError;
})(ModuleError);

exports.VoError = VoError;
//# sourceMappingURL=Errors.js.map