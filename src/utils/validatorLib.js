import validator from 'validator';

validator.extend('required', function (value) {
    return (null===value || (String === value.constructor && value==='')) ? false : true;
});

export default validator;
