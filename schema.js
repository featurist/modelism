var Property = require('./property');

function Schema(definition) {
  this.name = definition.name;
  this.defineProperties(definition.properties);
}

Schema.prototype.validate = function(model) {
  var errors = [];
  var property = null;
  for (var i = 0; i < this.properties.length; ++i) {
    property = this.properties[i];
    errors = errors.concat(property.validate(model[property.name]));
  }
  return new ValidationResult(errors);
};

Schema.prototype.defineProperties = function(properties) {
  this.properties = [];
  for (var name in properties) {
    this.properties.push(new Property(name, properties[name]));
  }
};

function ValidationResult(errors) {
  this.errors = [];
  for (var i = 0; i < errors.length; ++i) {
    this.errors.push(errors[i]);
  }
}

ValidationResult.prototype.isValid = function() {
  return this.errors.length == 0;
}

ValidationResult.prototype.property = function(path) {
  var propertyErrors = [];
  for (var i = 0; i < this.errors.length; ++i) {
    if (this.errors[i].property == path) {
      propertyErrors.push(this.errors[i].message);
    }
  }
  return propertyErrors;
}

module.exports = Schema;
