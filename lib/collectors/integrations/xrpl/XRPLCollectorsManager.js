import CollectorsManager from '../../CollectorsManager.js';

class XRPLCollectorsManager extends CollectorsManager {
    constructor({ pair, ...collectorsManagerOptions }) {
        super(collectorsManagerOptions);

        this.pair = pair;
    }

    async start() {
        await this.exchangeAPI.connect();

        await super.start();
    }

    async initCollectors() {
        await super.initCollectors({ pair: this.pair });
    }
}

export default XRPLCollectorsManager;
