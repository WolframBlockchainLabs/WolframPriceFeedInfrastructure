import BaseCryptoConfigSeeder from '../BaseCryptoConfigSeeder.js';

class UDEXSeeder extends BaseCryptoConfigSeeder {
    async execute(udexCollectorsConfig) {
        for (const groupConfig of Object.values(udexCollectorsConfig)) {
            await this.setupGroup(groupConfig);
        }
    }

    async setupGroup(groupConfig) {
        const groupName = groupConfig.groupName;
        this.logger.info(`Setting up [${groupName}] group`);

        for (const exchangeConfig of groupConfig.exchanges) {
            await this.setupExchange({ groupName, exchangeConfig });
        }
    }
}

export default UDEXSeeder;
