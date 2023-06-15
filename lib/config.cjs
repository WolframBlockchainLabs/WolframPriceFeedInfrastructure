/* eslint-disable import/no-commonjs */
const confme = require('confme');

const config = confme(`${__dirname}/../configs/config.json`);

module.exports = config;
