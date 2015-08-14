import { ValidatorError } from './Errors';
import validatorLib from './utils/validatorLib';

/**
 * Class to validate properties of a Vo
 */
export default class Validator {

  /**
   * @param {?Vo} vo - a Vo to validate
   */
  constructor(vo=null) {
    /** @type {Vo} */
    this._vo = vo;
    /** @type {Object} - associated key-val as property name / array of errors*/
    this.errors = {};
  }

  /**
   * Validate all the properties of the current Vo
   * @return {Validator}
   * @throw {ValidatorError}
   * @access public
   */
  validateVo() {
    let properties = this._vo.constructor.getPropertiesNames();
    this.errors = {};
    properties.forEach( property => {
      try {
        this.constructor.checkProperty(property, this._vo[property]);
      }
      catch(err) {
        this.errors[property] = err.message;
      }
    });
    return this;
  }

  /**
   * To know if the validation failed
   * @return {Boolean}
   * @access public
   */
  hasError() {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Is a property unique?
   * @param {String} property - the property name
   * @return {Boolean}
   * @access public
   */
  static isPropertyUnique(property) {
    return this.uniques.indexOf(property) > -1;
  }

  /**
   * Is a property required?
   * @param {String} property - the property name
   * @return {Boolean}
   * @access public
   */
  static isPropertyRequired(property) {
    return this.required.indexOf(property) > -1;
  }

  /**
   * Is there any validation rule for a given property
   * @param {String} property - the property name
   * @return {Boolean}
   * @access public
   */
  static hasRulesFor(property) {
    return this.rules[property] ? true : false;
  }

  /**
   * Get the list of validation rules
   * @param {String} property - the property name
   * @return {Array}
   * @access public
   */
  static getRulesFor(property) {
    return this.rules[property] ? this.rules[property] : [];
  }

  /**
   * Does a property need to be checked?
   * @param {String} property - the property name
   * @param {any} value - the property value
   * @return {Array}
   * @access public
   */
  static needToCheckProperty(property, value) {
    let skipIfEmpty = !this.isPropertyRequired(property);
    let isEmpty = !Validator.validate('required', value);

    return (isEmpty && skipIfEmpty) ? false : true;
  }

  /**
   * Check a property value
   * @param {String} property - the property name
   * @param {any} value - the property value
   * @return {true}
   * @throw {ValidatorError}
   * @access public
   */
  static checkProperty(property, value) {
    if(this.needToCheckProperty(property, value)) {
      this.getRulesFor(property).forEach( validator => {
        let args = validator.args || [];
        let skipIfEmpty = !this.isPropertyRequired(property);

        if(args.constructor!==Array) {
          args = [args];
        }
        if(!this.validate(validator.fct, value, args, skipIfEmpty)) {
          throw new ValidatorError(validator.msg);
        }
      });
    }
    return true;
  }

  /**
   * Run a validator rules and get the result
   * @param {any} fct - the validation function or validator string name
   * @param {any} value - the property value
   * @param {Array} args - the validation rule options
   * @param {Boolean} skipIfEmpty - skip to check if the property is empty
   * @return {Boolean}
   * @throw {ValidatorError}
   * @access public
   */
  static validate(fct, value, args=[], skipIfEmpty=false) {
    // @tocheck if really usefull...
    if(skipIfEmpty && !value) {
      return true;
    }

    let funcArgs = [value].concat(args);
    if(fct.constructor === Function) {
      return fct.apply(null, funcArgs);
    }
    if(fct.constructor === String) {
      return validatorLib[fct].apply(null, funcArgs);
    }
    throw new ValidatorError('Wrong validator function');
  }
}

Validator.initFromVoClass = function(ValidatorChild, properties) {
  let ruleset = {};
  let requiredProperties = [];
  let uniqueProperties = [];

  Object.keys(properties).forEach((name) => {
    let isRequired = properties[name].required && true===properties[name].required;
    let isUnique = properties[name].unique && true===properties[name].unique;
    let validators = properties[name].validators || [];
    ruleset[name] = [];

    if(isUnique) {
      uniqueProperties.push(name);
    }
    if(isRequired) {
      requiredProperties.push(name);
    }

    validators.forEach( itemCfg => {
      if(!itemCfg.fct) {
        throw new Error('Configuration error: validator need a fct');
      }
      ruleset[name].push({
        fct: itemCfg.fct,
        msg: itemCfg.msg || '',
        args: itemCfg.args || [],
        skipIfEmpty: !isRequired
      });
    });
  });

  Object.defineProperty(ValidatorChild, 'rules', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: ruleset
  });

  Object.defineProperty(ValidatorChild, 'required', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: requiredProperties
  });

  Object.defineProperty(ValidatorChild, 'uniques', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: uniqueProperties
  });
};
