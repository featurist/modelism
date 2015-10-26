var validators = require('./validators');
var inflection = require('./inflection');

function Property(name, definition) {
  this.name = name;
  this.verifyNameIsAllowed();
  this.validators = [];
  for (var key in definition) {
    buildProperty(this, key, definition[key]);
  }
  if (typeof(this.label) != 'string') {
    this.label = inflection.titleFromCamelCase(name);
  }
}

Property.prototype.addValidator = function(validator) {
  this.validators.push(validator)
};

Property.prototype.validate = function(value) {
  var errors = [];
  for (var i = 0; i < this.validators.length; ++i) {
    errors = errors.concat(this.applyValidator(this.validators[i], value));
  }
  return errors;
};

Property.prototype.applyValidator = function(validator, value) {
  var errors = validator.validate(value);
  for (var j = 0; j < errors.length; ++j) {
    var chain = errors[j].property;
    errors[j].property = this.name;
    if (typeof(chain) == 'string')
      errors[j].property += '.' + chain;
  }
  return errors;
};

Property.prototype.verifyNameIsAllowed = function() {
  if (this.name == 'schema') {
    throw new Error("Properties named 'schema' are not allowed")
  }
}

function buildProperty(property, key, value) {
  var validator = validators[key];
  if (typeof(validator) == 'function') {
    validator(property, value);
  } else {
    throw new Error("Unrecognised option '" + key + "'");
  }
}

module.exports = Property;
