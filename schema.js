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
  return errors;
};

Schema.prototype.defineProperties = function(properties) {
  this.properties = [];
  for (var name in properties) {
    this.properties.push(new Property(name, properties[name]))
  }
};

module.exports = Schema;
