import BaseExchangeRepository from '#domain-collectors/infrastructure/repositories/exchange-repositories/BaseExchangeRepository.js';

class TestExchangeRepository extends BaseExchangeRepository {}

describe('[domain-collectors/repositories/exchange-repositories]: BaseExchangeRepository Tests Suite', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getDataSource', () => {
        test('should throw not implemented error', async () => {
            await expect(
                TestExchangeRepository.getDataSource(),
            ).rejects.toThrow(
                `[TestExchangeRepository]: getDataSource method is not implemented`,
            );
        });
    });

    describe('getDataSourceGroupMembers', () => {
        test('should throw not implemented error', async () => {
            await expect(
                TestExchangeRepository.getDataSourceGroupMembers(),
            ).rejects.toThrow(
                `[TestExchangeRepository]: getDataSourceGroupMembers method is not implemented`,
            );
        });
    });
});
