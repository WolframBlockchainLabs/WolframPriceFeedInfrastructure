import CryptoExchangeRepository from '#domain-collectors/infrastructure/repositories/exchange-repositories/CryptoExchangeRepository';
import Exchange from '#domain-model/entities/Exchange.js';

describe('[domain-collectors/repositories/exchange-repositories]: CryptoExchangeRepository Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.externalExchangeId = 'test-exchange-id';
        context.dataSource = 'test-data-source';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getDataSource', () => {
        test('should return the dataSource for the given externalExchangeId', async () => {
            const findOneOrFailSpy = jest
                .spyOn(Exchange, 'findOneOrFail')
                .mockResolvedValue({
                    dataSource: context.dataSource,
                });

            const result = await CryptoExchangeRepository.getDataSource(
                context.externalExchangeId,
            );

            expect(findOneOrFailSpy).toHaveBeenCalledWith({
                where: {
                    externalExchangeId: context.externalExchangeId,
                },
                attributes: ['dataSource'],
            });
            expect(result).toBe(context.dataSource);
        });

        test('should throw an error if the exchange is not found', async () => {
            const error = new Error('Exchange not found');
            const findOneOrFailSpy = jest
                .spyOn(Exchange, 'findOneOrFail')
                .mockRejectedValue(error);

            await expect(
                CryptoExchangeRepository.getDataSource(
                    context.externalExchangeId,
                ),
            ).rejects.toThrow(error);
            expect(findOneOrFailSpy).toHaveBeenCalledWith({
                where: {
                    externalExchangeId: context.externalExchangeId,
                },
                attributes: ['dataSource'],
            });
        });
    });

    describe('getDataSourceGroupMembers', () => {
        test('should return externalExchangeIds for the given dataSource', async () => {
            const groupMembers = [
                { externalExchangeId: 'exchange1' },
                { externalExchangeId: 'exchange2' },
            ];
            const findAllSpy = jest
                .spyOn(Exchange, 'findAll')
                .mockResolvedValue(groupMembers);

            const result =
                await CryptoExchangeRepository.getDataSourceGroupMembers(
                    context.dataSource,
                );

            expect(findAllSpy).toHaveBeenCalledWith({
                where: {
                    dataSource: context.dataSource,
                },
                attributes: ['externalExchangeId'],
            });
            expect(result).toEqual(['exchange1', 'exchange2']);
        });

        test('should return an empty array if no exchanges are found', async () => {
            const findAllSpy = jest
                .spyOn(Exchange, 'findAll')
                .mockResolvedValue([]);

            const result =
                await CryptoExchangeRepository.getDataSourceGroupMembers(
                    context.dataSource,
                );

            expect(findAllSpy).toHaveBeenCalledWith({
                where: {
                    dataSource: context.dataSource,
                },
                attributes: ['externalExchangeId'],
            });
            expect(result).toEqual([]);
        });
    });
});
