import CollectorsManager from '../../CollectorsManager.js';

class XRPLCollectorsManager extends CollectorsManager {
    async start() {
        await this.exchangeAPI.connect();

        await super.start();
    }
}

export default XRPLCollectorsManager;
