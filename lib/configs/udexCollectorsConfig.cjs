require('./utils/registerValidationRules.cjs');
const path = require('path');
const UDEXConfigBundler = require('#infrastructure/config-bundlers/UDEXConfigBundler.cjs');

const baseConfigPath = path.join(__dirname, '../../configs/udex');
const udexConfigBundler = new UDEXConfigBundler(baseConfigPath);

const udexCollectorsConfig = udexConfigBundler.gatherConfigs();

module.exports = udexCollectorsConfig;
