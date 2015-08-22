export default class ValidationError {

  constructor(errors = {}) {
    this.validation = errors;
  }

  setPropertyError(property, error) {
    this.validation[property] = error;
  }

  hasError() {
    return Object.keys(this.validation).length > 0;
  }

  hasPropertyError(property) {
    return Object.keys(this.validation).indexOf(property) > -1;
  }
}
