function Model() {}

Model.prototype.isValid = function() {
  return this.validate().isValid();
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

Model.prototype.toJSON = function() {
  var obj = {};
  for (var i = 0; i < this.schema.properties.length; ++i) {
    var name = this.schema.properties[i].name;
    if (typeof(this[name]) != 'undefined') {
      if (typeof(this[name].toJSON) == 'function') {
        obj[name] = this[name].toJSON();
      } else {
        obj[name] = this[name];
      }
    }
  }
  return obj;
}

Model.reservedProperties = Object.keys(Model.prototype);

module.exports = Model;
