export default class ModuleError {
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

  get name () {
    return this.constructor.name;
  }
}

export class ServiceError extends ModuleError {}
export class ManagerError extends ModuleError {}
export class StorageError extends ModuleError {}
export class ValidatorError extends ModuleError {}
export class VoError extends ModuleError {}
