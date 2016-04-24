# modelism

A DSL for defining self-validating JavaScript models.

## Example

### Defining models

Use compact schema definitions to define validation rules:

```JavaScript
var model = require('modelism');

var Company = model({
  name: 'Company',
  properties: {
    name: {
      presence: true,
      format: {
        pattern: '^[A-Za-z0-9\s]+$',
        message: 'Alphanumeric characters'
      }
    },
    email: {
      email: true
    }
  }
});
```

### Creating models

Simple models can be instantiated with property values:

```JavaScript
var leftorium = new Company({
  name: 'The Leftorium',
  email: 'ned@leftorium.com'
});
```

### Validating models

Models have schemas, so they can validate themselves and group the resulting
validation errors by property:

```JavaScript
leftorium.schema                        // -> { name: 'Company', properties: [...] }

leftorium.isValid()                     // -> true
leftorium.name = '';
leftorium.isValid()                     // -> false

var validation = leftorium.validate();  // -> { errors: [...] }
leftorium.errors;                       // -> [{ property: ..., message: ... }, ...]
leftorium.errorsOn('name')              // -> ['is required']
```

### Relationships between models

Schema properties can refer to other schemas by name. Use a factory to create
objects with different schemas and relationships between them:

```JavaScript

var Contact = model({
  name: 'Contact',
  properties: {
    firstName: { type: 'string'},
    company: { schema: 'Company' }
  }
});

var data = {
  firstName: 'Homer',
  company: {
    name: 'Nuclear power plant'
  }
}
var factory = model.factory(Company, Contact);
var contact = factory.create('Contact', data);
contact.company.validate() // -> { errors: [...] }
```

### Validating related models

Validating a model will validate any related models:

```JavaScript
var ned = factory.create('Contact', {
  company: { name: '' }
})
ned.validate().errorsOn('company.name') // -> ['is required']
```

## Property schema language

The property schema language provides a compact syntax for assigning validations 
to model properties. For example, here's how you could add the built in
`presence` validator to your model's `brand` property:

```JavaScript
var Television = model({
  properties: {
    brand: {
      presence: true
    }
  }
});
```

Just like `presence`, you can register your own domain-specific validators and
extend the property validator language:

``` JavaScript
model.validators.onlySweet = function(property, enabled) {
  if (enabled) {
    property.addValidator({
      validate: function(taste) {
        return taste == 'sweet' ? [] : [{ message: 'must be sweet' }];
      }
    });
  }
}
var Cake = model({
  name: 'Cake',
  properties: {
    taste: { onlySweet: true },
    aftertaste: { onlySweet: false }
  }
});
new Cake({ taste: 'sweet', aftertaste: 'sweet' }).isValid()   // -> true
new Cake({ taste: 'savory', aftertaste: 'sweet' }).isValid()  // -> false
new Cake({ taste: 'sweet', aftertaste: 'savory' }).isValid()  // -> true
```

## License

MIT
