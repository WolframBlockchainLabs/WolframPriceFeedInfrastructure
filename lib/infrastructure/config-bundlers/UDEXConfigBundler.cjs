const fs = require('fs');
const path = require('path');
const confme = require('confme');

class UDEXConfigBundler {
    static COLLECTORS_CONFIG_NAME = 'collectors.config.json';
    static COLLECTORS_SCHEMA_NAME = 'udex-collectors.config-schema.json';
    static EXCHANGE_CONFIG_SCHEMA_NAME = 'udex-exchange.config-schema.json';
    static EXCHANGES_DIR_NAME = 'exchanges';

    constructor(udexBasePath) {
        this.udexBasePath = udexBasePath;
        this.collectorsSchemaPath = path.join(
            udexBasePath,
            UDEXConfigBundler.COLLECTORS_SCHEMA_NAME,
        );
        this.exchangeSchemaPath = path.join(
            udexBasePath,
            UDEXConfigBundler.EXCHANGE_CONFIG_SCHEMA_NAME,
        );
    }

    gatherConfigs() {
        const bundledConfigs = {};
        const groupFolders = this.readDirectoryContents(this.udexBasePath);

        for (const groupFolder of groupFolders) {
            const groupFolderPath = path.join(this.udexBasePath, groupFolder);
            if (!this.isDirectory(groupFolderPath)) {
                continue;
            }

            const groupConfig = this.gatherGroupConfig(groupFolderPath);
            if (groupConfig) {
                bundledConfigs[groupConfig.groupName] = groupConfig;
            }
        }

        return bundledConfigs;
    }

    gatherGroupConfig(groupFolderPath) {
        const groupConfig = this.loadCollectorsConfig(groupFolderPath);
        if (!groupConfig) {
            return null;
        }

        const exchangesPath = path.join(
            groupFolderPath,
            UDEXConfigBundler.EXCHANGES_DIR_NAME,
        );
        if (this.isDirectory(exchangesPath)) {
            groupConfig.exchanges = this.loadExchangesConfig(exchangesPath);
        }

        return groupConfig;
    }

    loadCollectorsConfig(groupFolderPath) {
        const collectorsConfigPath = path.join(
            groupFolderPath,
            UDEXConfigBundler.COLLECTORS_CONFIG_NAME,
        );
        try {
            return confme(collectorsConfigPath, this.collectorsSchemaPath);
        } catch (error) {
            console.error(
                `Error loading collectors config from ${collectorsConfigPath}:`,
                error,
            );
            return null;
        }
    }

    loadExchangesConfig(exchangesPath) {
        return this.readDirectoryContents(exchangesPath)
            .map((fileName) =>
                this.loadExchangeConfig(path.join(exchangesPath, fileName)),
            )
            .filter(Boolean);
    }

    readDirectoryContents(directoryPath) {
        return fs.readdirSync(directoryPath);
    }

    isDirectory(directoryPath) {
        return (
            fs.existsSync(directoryPath) &&
            fs.statSync(directoryPath).isDirectory()
        );
    }

    loadExchangeConfig(filePath) {
        try {
            return confme(filePath, this.exchangeSchemaPath);
        } catch (error) {
            console.error(
                `Error loading exchange config from ${filePath}:`,
                error,
            );
            return null;
        }
    }
}

module.exports = UDEXConfigBundler;
