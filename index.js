var Model = require('./model');
var Schema = require('./schema');

function defineModel(definition) {
  var schema = new Schema(definition, Model.reservedProperties);

  function model(propertyValues) {
    this.schema = schema;
    for (var key in propertyValues) {
      this[key] = propertyValues[key];
    }
  }
  model.prototype = new Model();
  model.create = function(data) { return new model(data); }
  return model;
}

defineModel.validators = require('./validators');
defineModel.reservedProperties = Model.reservedProperties;

module.exports = defineModel;
