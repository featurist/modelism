function Model() {}

Model.prototype.isValid = function() {
  return this.validate().length == 0;
};

Model.prototype.validate = function() {
  return this.schema.validate(this);
};

Model.prototype.updateProperties = function(propertyValues) {
  for (var name in propertyValues) {
    this.updateProperty(name, propertyValues[name]);
  }
};

Model.prototype.updateProperty = function(name, value) {
  this[name] = value;
};

Model.prototype.toString = function() {
  return '#<' + this.schema.name + '>';
};

module.exports = Model;
