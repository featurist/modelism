# modelism

A DSL for defining self-validating JavaScript models.

## Example

### Defining models

Define models with compact schema definitions:

```JavaScript
var model = require('modelism');

var Contact = model({
  name: 'Contact',
  properties: {
    firstName: {
      presence: true,
      format: {
        pattern: '^[A-Z][A-Za-z\s]+$',
        message: 'only alphabetic characters, start with a capital'
      }
    },
    lastName: { presence: true },
    email: { presence: true, email: true, label: 'Email Address' },
    company: { schema: 'Company' },
    age: { integer: true }
  }
});

var Company = model({
  name: 'Company',
  properties: {
    name: { presence: true },
    logo: { schema: 'Image' },
    yearIncorporated: { integer: true },
    contacts: { schema: ['Contact'] }
  }
});
```

### Creating models

Now you can instantiate the schemas from data objects:

```JavaScript
var leftorium = new Company({
  name: 'The Leftorium'
});

var ned = new Contact({
  firstName: 'Ned',
  lastName: 'Flanders',
  email: 'ned@leftorium.com',
  company: leftorium
});
```

### Validating models

Models have schemas, so they can validate themselves and group the resulting
validation errors by property:

```JavaScript
ned.schema                        // -> { name: 'Contact', properties: [...] }

ned.isValid()                     // -> true
ned.firstName = '';
ned.isValid()                     // -> false

var validation = ned.validate();  // -> { errors: [...] }
validation.errors;                // -> [{ property: ..., message: ... }, ...]
validation.property('firstName')  // -> ['is required']
```

Validation includes related models:

```JavaScript
leftorium.name = '';
ned.validate().property('company.name')   // -> ['is required']
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

Just like `presence`, you can register your own domain-specific validators as
keywords this language:

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
