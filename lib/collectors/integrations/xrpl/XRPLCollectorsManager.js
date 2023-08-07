import CollectorsManager from '../../CollectorsManager.js';

class XRPLCollectorsManager extends CollectorsManager {
    constructor({ pair, ...options }) {
        super(...options);

        this.pair = pair;
    }

    async start() {
        await super.start();

        await this.exchangeAPI.connect();
    }

    async initCollectors() {
        await this.initCollectors({ pair: this.pair });
    }
}

export default XRPLCollectorsManager;
