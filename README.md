# modelism

A schema language for validating JavaScript objects

## Example

### Defining validation models

Use compact schema definitions to define model constructors:

```JavaScript
var model = require('modelism');

var Company = model({
  name: 'Company',
  properties: {
    name: {
      presence: {
        message: 'Name is required'
      },
      format: {
        pattern: /^[A-Za-z0-9\s]*$/,
        message: 'Letters, numbers and whitespace only'
      }
    },
    registered: {
      type: 'boolean'
    },
    registrationNumber: {
      type: 'number',
      presence: {
        message: 'Registered companies must have registration numbers',
        enabled: function(company) {
          return company.registered;
        }
      }
    }
  }
});
```

### Creating models

Models can be instantiated with property values:

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
validation.errors;                      // -> [{ property: ..., message: ... }, ...]
validation.errorsOn('name')             // -> ['is required']
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
