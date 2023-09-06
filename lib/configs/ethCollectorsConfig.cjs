const confme = require('confme');

const ethCollectorsConfig = confme(
    `${__dirname}/../../configs/eth/eth-collectors.config.json`,
    `${__dirname}/../../configs/eth/eth-collectors.config-schema.json`,
);

module.exports = ethCollectorsConfig;
