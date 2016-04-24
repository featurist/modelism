var Model = require('./model');
var Schema = require('./schema');

function Factory(models) {
  this.models = {};
  for (var i = 0; i < models.length; ++i) {
    this.models[models[i].schema.name] = models[i];
  }
}

Factory.prototype.create = function(schemaName, properties) {
  var modelClass = this.models[schemaName];
  var model = new modelClass(properties);
  for (var i = 0; i < model.schema.properties.length; ++i) {
    var prop = model.schema.properties[i];
    if (typeof(prop.schema) == 'string') {
      model[prop.name] = this.create(prop.schema, model[prop.name]);
    }
  }
  return model;
}

function defineModel(definition) {
  if (typeof(definition) == 'function') {
    return new Factory([].slice.apply(arguments));
  }
  var schema = new Schema(definition, Model.reservedProperties);

  function model(propertyValues) {
    this.schema = schema;
    for (var key in propertyValues) {
      this[key] = propertyValues[key];
    }
  }
  model.prototype = new Model();
  model.create = function(data) { return new model(data); }
  model.schema = schema;
  return model;
}

defineModel.validators = require('./validators');
defineModel.reservedProperties = Model.reservedProperties;

module.exports = defineModel;
