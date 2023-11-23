const path = require('path');
const CCXTConfigBundler = require('../infrastructure/config-bundlers/CCXTConfigBundler.cjs');

const baseConfigPath = path.join(__dirname, '../../configs/ccxt');
const ccxtConfigBundler = new CCXTConfigBundler(baseConfigPath);

const ccxtCollectorsConfig = ccxtConfigBundler.gatherConfigs();

module.exports = ccxtCollectorsConfig;
