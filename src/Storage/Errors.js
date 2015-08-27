class StorageErrorBase {
  constructor (message='') {
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

export class UnreachableStorage extends StorageErrorBase {}
