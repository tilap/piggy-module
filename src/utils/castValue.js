import sanitizer from 'validator';

/**
 * Cast a value to match a given type
 * @param {any} value - the value to cast
 * @param {any} type - type of the object: Array, String, Object, ...
 * @return {any} - the value casted
 * @throw {Error} - if cast failed
 */
let castValue = module.exports = function(value, type) {

  if (value == null) {
    return value;
  }

  switch(type.constructor) {
    case Array:
      if (value.constructor !== Array) {
        throw new Error('Invalid array');
      }
      let arrayType = type[0];
      value.forEach((arrayValue, index) => {
        value[index] = castValue(arrayValue, arrayType);
      });
      return value;

    case Object:
      if (value.constructor !== Object) {
          throw new Error('Invalid object');
      }
      Object.keys(type).forEach((key) => {
        value[key] = castValue(type[key], value[key]);
      });
      return value;

    case Function:
      switch(type.name) {
        case 'Date':
          return value.constructor === Date ? value : sanitizer.toDate(value);
        case 'String':
          return value.constructor === String ? value : String(value);
        case 'Number':
          let v = value.constructor === Number ? value : Number(value);
          if(Number.isNaN( v )) {
            throw new Error('Invalid number');
          }
          return v;
        case 'Object':
          // Sorry for that fucking workaround.
          // Cannot forec cast coz require ObjectID AND don't want to put hard deendency here. Gonna find another way.
          // Maybe the validator depends on the storage?
          if(value.constructor === Object || value.constructor.name === 'ObjectID') {
            return value;
          }
          break;
        case 'Boolean':
          return value.constructor!==Boolean ? Boolean(value) : (value===true || value ===1 || value==='1');
        default:
          return (type.name===value.constructor.name) ? value : value.constructor.name(value);
      }
  }

  if (value.constructor && value.constructor.name && value.constructor.name !== type) {
    throw new Error('Invalid object ' + type.constructor.name + ', ' + type);
  }

  return value;
};
