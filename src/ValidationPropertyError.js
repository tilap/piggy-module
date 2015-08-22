/**
 * A property error
 * Allow to attach it to a property, with message and simple error type:
 * 'REQUIRED', 'UNIQUE', 'FORMAT', 'BUSINESS',
 */
export default class ValidationPropertyError {

  /**
   * @param {String} property - the failed validation property name
   * @param {String} type - One of the error type: REQUIRED, UNIQUE, FORMAT, BUSINESS
   * @param {String} message - the error message for the user
   */
  constructor (property, type, message = '') {
    Object.defineProperty(this, 'message', {
      value: message,
      enumerable: true,
      writable: false,
      configurable: false,
    });

    Object.defineProperty(this, 'property', {
      value: property,
      enumerable: true,
      writable: false,
      configurable: false,
    });

    type = type.toUpperCase();
    if(!ValidationPropertyError.typeExists(type)) {
      throw new Error('ValidationError: unknown type ' + type);
    }
    Object.defineProperty(this, 'type', {
      value: type,
      enumerable: true,
      writable: false,
      configurable: false,
    });
  }

  /**
   * Check if the error type exists
   * @param {String} type - the type to check
   * @return {Boolean}
   */
  static typeExists(type) {
    return Object.keys(ValidationPropertyError.TYPES).indexOf(type) > -1;
  }
}


Object.defineProperty(ValidationPropertyError, 'TYPES', {
  enumerable: false,
  writable: false,
  configurable: false,
  value: {
    'REQUIRED': 'REQUIRED',
    'UNIQUE': 'UNIQUE',
    'FORMAT': 'FORMAT',
    'BUSINESS': 'BUSINESS',
  }
});

