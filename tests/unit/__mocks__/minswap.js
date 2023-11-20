class MockBlockfrostAdapter {
    constructor(options) {
        this.options = options;
    }

    async getPoolById({ id }) {
        return {
            reserveA: '1000',
            reserveB: '2000',
            assetA: 'lovelace',
            id: id,
        };
    }
}

export const BlockfrostAdapter = MockBlockfrostAdapter;
