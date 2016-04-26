var validators = require('./validators');
var inflection = require('./inflection');

function Property(name, definition) {
  this.name = name;
  this.validators = [];
  for (var key in definition) {
    var validator = validators[key];
    var spec = definition[key];
    if (typeof(validator) == 'function') {
      validator(this, spec);
    } else {
      throw new Error("Unrecognised option '" + key + "'");
    }
  }
  if (typeof(this.label) != 'string') {
    this.label = inflection.titleFromCamelCase(name);
  }
}

Property.prototype.addValidator = function(validator) {
  this.validators.push(validator);
};

Property.prototype.validate = function(value, model) {
  var errors = [];
  if (this.presenceValidator) {
    errors = errors.concat(this.applyValidator(this.presenceValidator, value, model));
  }
  if (errors.length == 0) {
    // type validator needs a late-bound message
    if (this.typeValidator) {
      this.typeValidator(this, { message: this.message });
      delete(this.typeValidator);
    }
    for (var i = 0; i < this.validators.length; ++i) {
      errors = errors.concat(this.applyValidator(this.validators[i], value, model));
    }
  }
  return errors;
};

Property.prototype.applyValidator = function(validator, value, model) {
  if (validator.enabled && !validator.enabled(model)) {
    return [];
  }
  var errors = validator.validate(value, model);
  for (var j = 0; j < errors.length; ++j) {
    var chain = errors[j].property;
    errors[j].property = this.name;
    if (typeof(chain) == 'string')
      errors[j].property += '.' + chain;
  }
  return errors;
};

module.exports = Property;
