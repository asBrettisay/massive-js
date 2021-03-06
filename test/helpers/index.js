'use strict';

const path = require('path');
const connectionString = 'postgres://postgres@localhost/massive';

require('co-mocha');

global._ = require('lodash');
global.assert = require('chai').use(require('chai-as-promised')).assert;
global.massive = require('../../index');
global.connectionString = connectionString;

global.resetDb = function (schema) {
  schema = schema || 'default';

  return massive(connectionString, {
    enhancedFunctions: true,
    scripts: path.join(__dirname, 'scripts', schema)
  }, {
    noWarnings: true
  }).then(db => {
    return db.run("select schema_name from information_schema.schemata where catalog_name = 'massive' and schema_name not like 'pg_%' and schema_name not like 'information_schema'").then(schemata =>
      Promise.all(schemata.map(schema => db.run(`drop schema ${schema.schema_name} cascade`)))
    ).then(() =>
      db.schema()
    ).then(() =>
      db.reload()
    );
  });
};

