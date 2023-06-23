const confme = require('confme');

const config = confme(`${__dirname}/../configs/system.config.json`);

module.exports = config;
