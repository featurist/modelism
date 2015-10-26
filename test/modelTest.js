var model = require('../');
var expect = require('chai').expect;

describe('model(schema)', function() {

  var Contact, Company, Image;
  var ned, leftorium;

  beforeEach(function() {

    Contact = model({
      name: 'Contact',
      properties: {
        firstName: {
          type: 'string',
          presence: true,
          format: {
            pattern: '^[A-Z][A-Za-z\s]+$',
            message: 'must contain alphabetic characters and start with capital'
          }
        },
        lastName: { type: 'string', presence: true, label: 'Surname' },
        email: { type: 'email', presence: true },
        company: { schema: 'Company' },
        photos: { schema: ['Image'] },
        age: { type: 'integer' }
      }
    });

    Company = model({
      name: 'Company',
      properties: {
        name: { presence: true },
        logo: { schema: 'Image' },
        yearIncorporated: { integer: true },
        contacts: { schema: ['Contact'] }
      }
    });

    Image = model({
      name: 'Image',
      properties:{
        url: {},
        data: { type: 'file' }
      }
    });

    leftorium = new Company({
      name: 'The Leftorium'
    });

    ned = new Contact({
      firstName: 'Ned',
      lastName: 'Flanders',
      email: 'ned@leftorium.com',
      company: leftorium,
      photo: new Image({ url: 'http://ned.com/doodly.jpg' })
    });

  });

  describe('.schema', function() {

    it('exposes model properties', function() {
      expect(ned.schema.properties[0].name).to.eql('firstName');
    });

    it('generates a label when unspecified', function() {
      expect(ned.schema.properties[0].label).to.eql('First Name');
    });

    it('uses the label when specified', function() {
      expect(ned.schema.properties[1].label).to.eql('Surname');
    });

  });

  describe('.isValid() for properties:', function() {

    describe('with no validation errors', function() {

      it('is true', function() {
        expect(ned.isValid()).to.be.true;
      });

    });

    describe('with { presence: true }', function() {

      it('is false when the value is empty', function() {
        ned.firstName = '';
        expect(ned.isValid()).to.be.false;
      });

      it('is false when the value is null', function() {
        ned.firstName = null;
        expect(ned.isValid()).to.be.false;
      });

    });

    describe('with { integer: true }', function() {

      it('is true when the value is empty', function() {
        ned.age = '';
        expect(ned.isValid()).to.be.true;
      });

      it('is true when the value is null', function() {
        ned.age = null;
        expect(ned.isValid()).to.be.true;
      });

      it('is true when the value is a numeric string', function() {
        ned.age = '123';
        expect(ned.isValid()).to.be.true;
      });

      it('is false when the value includes whitespace', function() {
        ned.age = '12 3';
        expect(ned.isValid()).to.be.false;
      });

      it('is false when the value includes symbols', function() {
        ned.age = '12.3';
        expect(ned.isValid()).to.be.false;
      });

    });

    describe("with { format: { pattern: '.+' } }", function() {

      it('is false when the formatted value does not match', function() {
        ned.firstName = 'A';
        expect(ned.isValid()).to.be.false;
      });

    });

    describe("with { schema: 'Foo' }", function() {

      it('is false when the value is invalid', function() {
        ned.company = { name: null };
        expect(ned.isValid()).to.be.false;
      });

      it('is false the value has a different schema', function() {
        ned.company = new Image({ url: 'http://an-image-not-a-company.com' });
        expect(ned.isValid()).to.be.false;
      });

    });

    describe("with { schema: ['Foo'] }", function() {

      var barney, moe;

      beforeEach(function() {
        barney = new Contact({
          firstName: 'Barney',
          lastName: 'Gumble',
          email: 'barney@gumble.com'
        });

        moe = new Contact({
          firstName: 'Moe',
          lastName: 'Szyslak',
          email: 'moe@moes.com'
        });
      });

      it('is true when the value is a collection of valid values', function() {
        expect(barney.validate()).to.eql([]);
        expect(moe.validate()).to.eql([]);
        leftorium.contacts = [barney, moe];
        expect(leftorium.isValid()).to.be.true;
        moe.email = '123 Fake Street';
        expect(leftorium.validate()).to.eql([{
          property: "contacts.1.email",
          message: "is not a valid email address"
        }]);
      });

    });

    describe("with { type: 'string' }", function() {

      it('sets the property type to string', function() {
        expect(new Contact({}).schema.properties[0].type).to.eql('string');
      });

    });

  });

  describe('.validate()', function() {

    it('returns an array of errors against properties', function() {
      var krusty = new Contact({ firstName: 'Krusty', lastName: 'Krustofski' });
      ned.firstName = '';
      ned.email = 'oops';
      ned.company.name = '';
      ned.company.logo = new Contact({});
      ned.company.contacts = [krusty];
      expect(ned.validate()).to.eql([
        { property: 'firstName', message: 'is required' },
        { property: 'email', message: 'is not a valid email address' },
        { property: 'company.name', message: 'is required' },
        { property: 'company.logo', message: 'is not a valid Image' },
        { property: 'company.contacts.0.email', message: 'is required' }
      ]);
    });

  });

  describe('.toString()', function() {

    it('includes the model schema name', function() {
      expect(ned.toString()).to.contain('Contact');
      expect(leftorium.toString()).to.contain('Company');
    });

  });

});

describe('model(schema)', function() {

  function expectInvalidModel(schemaDefinition, expectedMessage) {
    function defineModel() {
      model(schemaDefinition);
    };
    expect(defineModel).to.throw(Error, expectedMessage);
  }

  it('rejects unrecognised property options', function() {
    expectInvalidModel(
      { name: 'Boom', properties: { foo: { bang: 'pop' } } },
      "Unrecognised option 'bang'"
    );
  });

  it('rejects null schema values', function() {
    expectInvalidModel(
      { name: 'Boom', properties: { foo: { schema: null } } },
      "foo.schema is invalid"
    );
  });

  it('rejects empty schema values', function() {
    expectInvalidModel(
      { name: 'Boom', properties: { foo: { schema: '' } } },
      "foo.schema is invalid"
    );
  });

  it('rejects schema array values with > 1 element', function() {
    expectInvalidModel(
      { name: 'Boom', properties: { foo: { schema: ['a', 'b'] } } },
      "foo.schema is invalid"
    );
  });

  it('rejects schema array values with 0 elements', function() {
    expectInvalidModel(
      { name: 'Boom', properties: { foo: { schema: [] } } },
      "foo.schema is invalid"
    );
  });

  it("rejects a model property named 'schema'", function() {
    expectInvalidModel(
      { name: 'Boom', properties: { schema: {} } },
      "Properties named 'schema' are not allowed"
    );
  });

  it("exposes the validators object to extend the schema DSL", function() {
    model.validators.sweet = function(property) {
      property.addValidator({
        validate: function(value) {
          return value == 'sweet' ? [] : [{ message: 'must be sweet' }];
        }
      });
    }
    var Cake = model({ name: 'Cake', properties: { taste: { sweet: true } } });
    expect(new Cake({ taste: 'sweet' }).isValid()).to.be.true;
    expect(new Cake({ taste: 'savoury' }).isValid()).to.be.false;
  });

});
