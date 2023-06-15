/* eslint-disable import/no-commonjs */
const confme = require('confme');

const configCollector = confme(`${__dirname}/../configs/collectorConfig.json`);

module.exports = configCollector;
