var Model = require('./model');
var Schema = require('./schema');

function defineModel(definition) {
  var schema = new Schema(definition);

  function model(propertyValues) {
    this.schema = schema;
    this.updateProperties(propertyValues);
  }
  model.prototype = new Model();

  return model;
}

defineModel.validators = require('./validators');

module.exports = defineModel
