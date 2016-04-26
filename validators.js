var validators = {
  presence: function(property, spec) {
    property.presenceValidator = new PresenceValidator(spec, property);
  },
  format: function(property, spec) {
    property.addValidator(new FormatValidator(spec));
  },
  email: function(property, spec) {
    property.addValidator(new EmailValidator(spec));
  },
  integer: function(property, spec) {
    property.addValidator(new IntegerValidator(spec));
  },
  number: function(property, spec) {
    property.addValidator(new NumberValidator(spec));
  },
  schema: function(property, spec) {
    try {
      property.addValidator(new RelationValidator(property.name, spec));
      property.schema = spec;
    }
    catch (e) {
      throw new Error(property.name + '.schema is invalid');
    }
  },
  string: function(property, spec) {
  },
  boolean: function(property, spec) {
    property.addValidator(new BooleanValidator(spec));
  },
  type: function(property, spec) {
    property.typeValidator = validators[spec];
    if (!property.typeValidator) {
      throw new Error("Property type '" + spec + "' is not supported");
    }
    property.type = spec;
  },
  label: function(property, spec) {
    property.label = spec;
  },
  message: function(property, spec) {
    property.message = spec;
  }
}

function BaseValidator(validator, spec) {
  validator.enabled = spec.enabled;
}

function PresenceValidator(specification, property) {
  BaseValidator(this, specification);
  this.message = specification.message ||
                 (property.label || property.name) + ' is required';
}

PresenceValidator.prototype.validate = function(value) {
  if (value == null || value == '') {
    return [{ message: this.message }];
  }
  return [];
}

function FormatValidator(specification) {
  BaseValidator(this, specification);
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

function EmailValidator(specification) {
  this.message = specification.message || 'Invalid email address';
}

EmailValidator.prototype.validate = function(value) {
  if (value != null && value.indexOf('@') == -1) {
    return [{ message: this.message }];
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

function BooleanValidator() {}

BooleanValidator.prototype.validate = function(value) {
  if (value != null && typeof(value) !== 'boolean') {
    return [{ message: 'Value must be a boolean' }];
  }
  return [];
}

function NumberValidator() {}

NumberValidator.prototype.validate = function(value) {
  if (value != null && typeof(value) !== 'number') {
    return [{ message: 'Value must be a number' }];
  }
  return [];
}

function RelationValidator(propertyName, schemaSpec) {
  this.propertyName = propertyName;
  if (isValidSchemaName(schemaSpec)) {
    this.schemaName = schemaSpec;
  } else if (schemaSpec.length == 1 && isValidSchemaName(schemaSpec[0])) {
    this.schemaName = schemaSpec[0];
    this.isCollection = true;
  } else {
    throw new Error('Invalid schema spec ' + JSON.stringify(schemaSpec));
  }
}

function isValidSchemaName(name) {
  return typeof(name) == 'string' && !/^\s*$/.test(name);
}

RelationValidator.prototype.validate = function(value) {
  if (value) {
    if (this.isCollection) {
      return this.validateCollection(value);
    }
    if (value.schema && value.schema.name == this.schemaName &&
        typeof(value.validate) == 'function') {
      return value.validate(value[this.propertyName]).errors;
    }
    return [{ message: 'is not a valid ' + this.schemaName }];
  }
  return [];
}

RelationValidator.prototype.validateCollection = function(value) {
  var errors = [];
  for (var i = 0; i < value.length; ++i) {
    var indexErrors = this.validateCollectionAtIndex(value, i);
    for (var j = 0; j < indexErrors.length; ++j) {
      if (typeof(indexErrors[j].property) == 'undefined') {
        indexErrors[j].property = i.toString();
      } else {
        indexErrors[j].property = i + '.' + indexErrors[j].property;
      }
    }
    errors = errors.concat(indexErrors);
  }
  return errors;
}

RelationValidator.prototype.validateCollectionAtIndex = function(value, index) {
  if (value[index] == null) {
    return [{ message: 'is not a ' + this.schemaName }]
  } else if (typeof(value[index].schema) == 'object' && value[index].schema.name != this.schemaName) {
    return [{ message: 'is a ' + value[index].schema.name + ', not a ' + this.schemaName }]
  }
  return new RelationValidator(this.propertyName,
                               this.schemaName).validate(value[index]);
}

module.exports = validators;
