class BaseUDEXDriver {
    constructor({ apiSecret, meta }) {
        this.apiSecret = apiSecret;
        this.meta = meta;
    }

    /* istanbul ignore next */
    async getReserves() {
        throw new Error('getReserves method is not implemented');
    }
}

export default BaseUDEXDriver;
