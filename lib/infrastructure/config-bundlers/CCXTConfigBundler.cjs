const fs = require('fs');
const path = require('path');
const confme = require('confme');

class CCXTConfigBundler {
    static BASE_CONFIG_NAME = 'ccxt-collectors.config.json';
    static EXCHANGE_SCHEMA_NAME = 'ccxt-exchange.config-schema.json';
    static COLLECTORS_SCHEMA_NAME = 'ccxt-collectors.config-schema.json';
    static REALTIME_DIR_NAME = 'realtime';
    static HISTORICAL_DIR_NAME = 'historical';
    static SCHEMA_DIR_NAME = '_schemas';

    constructor(baseConfigPath) {
        this.baseConfigPath = baseConfigPath;
        this.exchangeSchemaPath = path.join(
            this.baseConfigPath,
            CCXTConfigBundler.SCHEMA_DIR_NAME,
            CCXTConfigBundler.EXCHANGE_SCHEMA_NAME,
        );
        this.collectorsSchemaPath = path.join(
            this.baseConfigPath,
            CCXTConfigBundler.SCHEMA_DIR_NAME,
            CCXTConfigBundler.COLLECTORS_SCHEMA_NAME,
        );
    }

    loadConfig(directory) {
        const files = fs.readdirSync(directory);
        const exchanges = [];

        for (const file of files) {
            const filePath = path.join(directory, file);
            try {
                const validatedConfig = confme(
                    filePath,
                    this.exchangeSchemaPath,
                );
                exchanges.push(validatedConfig);
            } catch (error) {
                console.error(`Error validating config for ${file}:`, error);
            }
        }

        return exchanges;
    }

    gatherConfigs() {
        try {
            const baseConfig = confme(
                path.join(
                    this.baseConfigPath,
                    CCXTConfigBundler.BASE_CONFIG_NAME,
                ),
                this.collectorsSchemaPath,
            );

            const realtimeConfigs = this.loadConfig(
                path.join(
                    this.baseConfigPath,
                    CCXTConfigBundler.REALTIME_DIR_NAME,
                ),
            );
            const historicalConfigs = this.loadConfig(
                path.join(
                    this.baseConfigPath,
                    CCXTConfigBundler.HISTORICAL_DIR_NAME,
                ),
            );

            return {
                realtime: {
                    ...baseConfig,
                    exchanges: realtimeConfigs,
                },
                historical: {
                    ...baseConfig,
                    exchanges: historicalConfigs,
                },
            };
        } catch (error) {
            console.error('Error gathering configs:', error);

            throw error;
        }
    }
}

module.exports = CCXTConfigBundler;
