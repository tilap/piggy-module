/**
 * Custom error. Works as standard Error with a different name to make difference
 */
export default class ModuleError {
  /**
   * @param {String} message - the error message
   */
  constructor (message) {
    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(this, this.constructor);
    }
    else {
      Object.defineProperty(this, 'stack', {
        value: (new Error()).stack
      });
    }

    Object.defineProperty(this, 'message', {
      value: message
    });
  }

  /**
   * @return - the error constructor name
   */
  get name () {
    return this.constructor.name;
  }
}

export class StorageError extends ModuleError {}
export class ValidatorError extends ModuleError {}
export class VoError extends ModuleError {}
