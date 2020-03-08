var Ajv = require('ajv')

// NOTE! you must update this list when new schema files are added
const schemaNames = [
  'layer',
  'root',
  'source',
  'textLayer'
]

function loadSchemas() {
  let ajv = new Ajv();
  for (const schemaName of schemaNames) {
    const schema = require(`../schema/${schemaName}.json`);
    ajv = ajv.addSchema(schema, schemaName);
  }
  return ajv;
}

function compile(schemaName) {
  return loadSchemas().getSchema(schemaName.toLowerCase());
}

function validate(instance) {
  const validate = compile('root');
  const valid = validate(instance);
  if (!valid) throw validate.errors;
  return valid;
}

exports.compile = compile;
exports.validate = validate;
