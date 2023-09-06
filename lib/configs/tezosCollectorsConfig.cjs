const confme = require('confme');

const tezosCollectorsConfig = confme(
    `${__dirname}/../../configs/tezos/tezos-collectors.config.json`,
    `${__dirname}/../../configs/tezos/tezos-collectors.config-schema.json`,
);

module.exports = tezosCollectorsConfig;
