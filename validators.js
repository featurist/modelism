var validators = {
  presence: function(property, value) {
    property.addValidator(new PresenceValidator(value));
  },
  format: function(property, value) {
    property.addValidator(new FormatValidator(value));
  },
  email: function(property, value) {
    property.addValidator(new EmailValidator(value));
  },
  integer: function(property, value) {
    property.addValidator(new IntegerValidator(value));
  },
  schema: function(property, value) {
    if (value == null ||
        (typeof(value) == 'string' && value.length == 0) ||
        (value.constructor == Array && value.length != 1)) {
      throw new Error(property.name + '.schema is invalid');
    }
    property.schema = value;
    property.addValidator(new RelationValidator(property.name, value));
  },
  type: function(property, value) {
    property.type = value;
    var typeValidator = validators[value];
    if (typeValidator) {
      typeValidator(property, true);
    }
  },
  label: function(property, value) {
    property.label = value;
  }
}

function PresenceValidator() {}

PresenceValidator.prototype.validate = function(value) {
  if (value == null || value == '') {
    return [{ message: 'is required' }];
  }
  return [];
}

function FormatValidator(specification) {
  this.specification = specification;
  this.regexp = new RegExp(this.specification.pattern);
}

FormatValidator.prototype.validate = function(value) {
  if (typeof(value) != 'undefined' && value != null) {
    var string = value.toString();
    if (string.length > 0 && this.regexp.test(string) == false) {
      return [{ message: this.specification.message }];
    }
  }
  return [];
}

function EmailValidator() {}

EmailValidator.prototype.validate = function(value) {
  if (value != null && value.indexOf('@') == -1) {
    return [{ message: 'is not a valid email address' }];
  }
  return [];
}

function IntegerValidator() {}

IntegerValidator.prototype.validate = function(value) {
  if (value != null && /\D/.test(value.toString())) {
    return [{ message: 'is not an integer' }];
  }
  return [];
}

function RelationValidator(propertyName, schemaSpec) {
  this.propertyName = propertyName;
  if (typeof(schemaSpec) == 'string') {
    this.schemaName = schemaSpec;
  } else if (schemaSpec.length == 1) {
    this.schemaName = schemaSpec[0];
    this.isCollection = true;
  } else {
    throw new Error('Invalid schema spec ' + JSON.stringify(schemaSpec));
  }
}

RelationValidator.prototype.validate = function(value) {
  if (value) {
    if (this.isCollection) {
      return this.validateCollection(value);
    }
    if (value.schema && value.schema.name == this.schemaName &&
        typeof(value.validate) == 'function') {
      return value.validate(value[this.propertyName]);
    }
    return [{ message: 'is not a valid ' + this.schemaName }];
  }
  return [];
}

RelationValidator.prototype.validateCollection = function(value) {
  if (value.constructor == Array) {
    var errors = [];
    for (var i = 0; i < value.length; ++i) {
      var indexErrors = this.validateCollectionAtIndex(value, i);
      for (var j = 0; j < indexErrors.length; ++j) {
        indexErrors[j].property = i + '.' + indexErrors[j].property;
      }
      errors = errors.concat(indexErrors);
    }
    return errors;
  }
  return [{ message: 'is not a valid ' + this.schemaName + ' collection' }];
}

RelationValidator.prototype.validateCollectionAtIndex = function(value, index) {
  return new RelationValidator(this.propertyName,
                               this.schemaName).validate(value[index]);
}

module.exports = validators;
