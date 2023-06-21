/* eslint-disable import/no-commonjs */
const confme = require('confme');

const configCollector = confme(`${__dirname}/../../configs/collectors.config.json`);

module.exports = configCollector;
