const confme = require('confme');

const cardanoCollectorsConfig = confme(
    `${__dirname}/../../configs/cardano/cardano-collectors.config.json`,
    `${__dirname}/../../configs/cardano/cardano-collectors.config-schema.json`,
);

module.exports = cardanoCollectorsConfig;
