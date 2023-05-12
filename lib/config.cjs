/* eslint-disable import/no-commonjs */

// is needed for sequelize-cli migrations/seeds

const confme = require('confme');

const config = confme(`${__dirname}/../configs/config.json`);
console.log('config-------', config);
module.exports = config;
