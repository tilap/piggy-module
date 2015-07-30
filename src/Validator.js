import { ValidatorError } from './Errors';
import validatorLib from './utils/validatorLib';

export default class Validator {

  constructor(vo=null) {
    this._vo = vo;
    this.errors = {};
  }

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

  hasError() {
    return Object.keys(this.errors).length > 0;
  }

  static isPropertyUnique(property) {
    return this.uniques.indexOf(property) > -1;
  }

  static isPropertyRequired(property) {
    return this.required.indexOf(property) > -1;
  }

  static hasRulesFor(key) {
    return this.rules[key] ? true : false;
  }

  // Get a property validation rules
  static getRulesFor(key) {
    return this.rules[key] ? this.rules[key] : [];
  }

  static needToCheckProperty(property, value) {
    let skipIfEmpty = !this.isPropertyRequired(property);
    let isEmpty = !Validator.validate('required', value);

    return (isEmpty && skipIfEmpty) ? false : true;
  }

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

  // Run a validator rules and get the result
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
