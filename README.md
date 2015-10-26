# modelism

A DSL for defining self-validating JavaScript models.

## Example

```JavaScript
var model = require('modelism');

var Contact = model({
  name: 'Contact',
  properties: {
    firstName: {
      presence: true,
      format: {
        pattern: '^[A-Z][A-Za-z\s]+$',
        message: 'must contain alphabetic characters and start with a capital'
      }
    },
    lastName: { presence: true },
    email: { presence: true, email: true },
    company: { schema: 'Company' },
    photos: { schema: ['Image'] },
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

var leftorium = new Company({
  name: 'The Leftorium'
});

var ned = new Contact({
  firstName: 'Ned',
  lastName: 'Flanders',
  email: 'ned@leftorium.com',
  company: leftorium
});

ned.firstName = ''
ned.isValid()       // -> false
ned.validate()      // -> [{ property: 'firstName', message: 'is required' }]
ned.schema          // -> { name: 'Contact', properties: [...] }

```

## Extending the validation DSL

``` JavaScript

model.validators.sweet = function(property) {
  property.addValidator({
    validate: function(value) {
      return value == 'sweet' ? [] : [{ message: 'must be sweet' }];
    }
  });
}
var Cake = model({ name: 'Cake', properties: { taste: { sweet: true } } });
new Cake({ taste: 'sweet' }).isValid()   // -> true
new Cake({ taste: 'savoury' }).isValid() // -> false;

```

## License

MIT
