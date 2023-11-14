import AppE2ETestProvider from '../../AppE2ETestProvider.js';

describe('Test description', () => {
    const app = new AppE2ETestProvider();

    beforeAll(async () => {
        return app.start();
    });

    afterAll(async () => {
        return app.shutdown();
    });

    it('Test', () => {
        console.log('PASS');
    });
});
