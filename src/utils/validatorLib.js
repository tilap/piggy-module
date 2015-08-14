import validator from 'validator';

/**
 * Add required validator checking a value is set (not null nor empty)
 */
validator.extend('required', function (value) {
    return (
        null === value ||
        (String === value.constructor && value === '') ||
        (Array === value.constructor && value.length === 0)
    ) ? false : true;
});

export default validator;
