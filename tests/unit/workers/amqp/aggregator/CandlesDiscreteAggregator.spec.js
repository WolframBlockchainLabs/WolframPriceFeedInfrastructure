import AggregationTask from '#domain-model/entities/AggregationTask.js';
import DiscreteAggregationExchange from '#domain-model/entities/DiscreteAggregationExchange.js';
import DiscreteAggregationResult from '#domain-model/entities/DiscreteAggregationResult.js';
import Exchange from '#domain-model/entities/Exchange.js';
import CandlesDiscreteAggregator from '#workers/amqp/aggregator/CandlesDiscreteAggregator.js';

jest.mock(
    '#use-cases/market-records/candle-sticks/DiscreteAggregation.js',
    () =>
        function () {
            return {
                systemCall: jest.fn().mockReturnValue({ data: { pairs: [] } }),
            };
        },
);

describe('[workers/amqp/aggregator]: CandlesDiscreteAggregator Tests Suite', () => {
    const context = {};

    const taskId = 1;

    const params = {
        rangeDateStart: '2024-04-01 08:38:37',
        rangeDateEnd: '2024-04-01 23:38:34',
        symbols: ['BTC/USDT'],
        exchangeNames: ['Binance', 'Bybit', 'OKX'],
        timeframeMinutes: 60,
    };

    beforeEach(() => {
        context.amqpChannelStub = {
            assertQueue: jest.fn(),
            consume: jest.fn(),
            addSetup: jest.fn((func) => func(context.amqpChannelStub)),
            ack: jest.fn(),
        };

        context.amqpClientStub = {
            publish: jest.fn(),
            getChannel: jest.fn().mockReturnValue(context.amqpChannelStub),
        };

        context.taskStub = {
            id: taskId,
            createdAt: new Date(),
            updatedAt: new Date(),
            update: jest.fn().mockImplementation((props) => ({
                ...props,
                ...context.taskStub,
            })),
        };

        context.AggregationTaskStub = {
            findOneOrFail: jest
                .spyOn(AggregationTask, 'findOneOrFail')
                .mockResolvedValue(context.taskStub),
        };

        context.DiscreteAggregationResultStub = {
            bulkCreate: jest
                .spyOn(DiscreteAggregationResult, 'bulkCreate')
                .mockResolvedValue([]),
        };

        context.DiscreteAggregationExchangeStub = {
            bulkCreate: jest
                .spyOn(DiscreteAggregationExchange, 'bulkCreate')
                .mockResolvedValue([]),
        };

        context.loggerStub = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        };

        context.candlesDiscreteAggregator = new CandlesDiscreteAggregator({
            logger: context.loggerStub,
            sequelize: {},
            amqpClient: context.amqpClientStub,
            consumerConfig: {},
            config: {
                amqpWorker: {
                    retryLimit: 3,
                    retryPeriodMs: 3000,
                },
                apiLimits: {
                    aggregations: {
                        asyncMaxDateDiff: 2592000000,
                        asyncStepSize: 1000,
                    },
                },
            },
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('execute', () => {
        test('should execute the task successfully', async () => {
            const initiateTaskStatusSpy = jest
                .spyOn(context.candlesDiscreteAggregator, 'initiateTaskStatus')
                .mockResolvedValue(context.taskStub);

            const executeUseCaseResult = {
                data: { pairs: [] },
            };
            const executeUseCaseSpy = jest
                .spyOn(context.candlesDiscreteAggregator, 'executeUseCase')
                .mockResolvedValue(executeUseCaseResult);

            const saveTaskResultsSpy = jest
                .spyOn(context.candlesDiscreteAggregator, 'saveTaskResults')
                .mockResolvedValue();

            await context.candlesDiscreteAggregator.execute({ taskId, params });

            expect(initiateTaskStatusSpy).toHaveBeenCalledWith(taskId);
            expect(executeUseCaseSpy).toHaveBeenCalledWith(params);
            expect(saveTaskResultsSpy).toHaveBeenCalledWith({
                task: context.taskStub,
                params,
                results: executeUseCaseResult,
            });
            expect(context.taskStub.update).toHaveBeenCalledWith({
                status: AggregationTask.STATUS.COMPLETED,
            });
            expect(context.loggerStub.debug).toHaveBeenCalledWith({
                message: 'Candles discrete aggregator completed successfully',
                context: expect.any(Object),
            });
        });

        test('should handle task execution error', async () => {
            const initiateTaskStatusSpy = jest
                .spyOn(context.candlesDiscreteAggregator, 'initiateTaskStatus')
                .mockResolvedValue(context.taskStub);

            const executeUseCaseError = new Error('Execution error');
            const executeUseCaseSpy = jest
                .spyOn(context.candlesDiscreteAggregator, 'executeUseCase')
                .mockRejectedValue(executeUseCaseError);

            await context.candlesDiscreteAggregator.execute({ taskId, params });

            expect(initiateTaskStatusSpy).toHaveBeenCalledWith(taskId);
            expect(executeUseCaseSpy).toHaveBeenCalledWith(params);
            expect(context.taskStub.update).toHaveBeenCalledWith({
                status: AggregationTask.STATUS.ERROR,
                error: expect.any(Object),
            });
            expect(context.loggerStub.error).toHaveBeenCalledWith({
                message: 'Candles discrete aggregator failed',
                context: expect.any(Object),
            });
        });
    });

    describe('initiateTaskStatus', () => {
        test('should initiate task status successfully', async () => {
            await context.candlesDiscreteAggregator.initiateTaskStatus(taskId);

            expect(
                context.AggregationTaskStub.findOneOrFail,
            ).toHaveBeenCalledWith({
                where: { id: taskId },
            });
            expect(context.taskStub.update).toHaveBeenCalledWith({
                status: AggregationTask.STATUS.PROCESSING,
            });
        });
    });

    describe('executeUseCase', () => {
        test('should execute the use case successfully', async () => {
            const result =
                await context.candlesDiscreteAggregator.executeUseCase(params);

            expect(result).toEqual({ data: { pairs: [] } });
        });
    });

    describe('saveTaskResults', () => {
        test('should save task results successfully', async () => {
            const task = { id: 1 };
            const formattedResults = [
                {
                    symbol: 'BTC/USDT',
                    processedCount: 10,
                    count: 20,
                    candles: [],
                    rangeDateStart: '2024-04-01 08:38:37',
                    rangeDateEnd: '2024-04-01 23:38:34',
                    timeframeMinutes: 60,
                    taskId,
                },
            ];
            const results = {
                data: {
                    pairs: formattedResults.map(
                        ({ symbol, processedCount, count, candles }) => ({
                            symbol,
                            processedCount,
                            count,
                            candles,
                        }),
                    ),
                },
            };

            const setResultsAssociationsSpy = jest
                .spyOn(
                    context.candlesDiscreteAggregator,
                    'setResultsAssociations',
                )
                .mockResolvedValue();

            await context.candlesDiscreteAggregator.saveTaskResults({
                task,
                params,
                results,
            });

            expect(
                context.DiscreteAggregationResultStub.bulkCreate,
            ).toHaveBeenCalledWith(formattedResults, {
                returning: true,
            });
            expect(setResultsAssociationsSpy).toHaveBeenCalledWith(
                [],
                params.exchangeNames,
            );
        });
    });

    describe('setResultsAssociations', () => {
        test('should set associations successfully', async () => {
            const createdResults = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const exchangeNames = ['Binance', 'Bybit'];

            jest.spyOn(Exchange, 'findAll').mockResolvedValue([
                { id: 1, name: 'Binance' },
                { id: 2, name: 'Bybit' },
            ]);

            await context.candlesDiscreteAggregator.setResultsAssociations(
                createdResults,
                exchangeNames,
            );

            expect(Exchange.findAll).toHaveBeenCalled();

            expect(
                context.DiscreteAggregationExchangeStub.bulkCreate,
            ).toHaveBeenCalledWith([
                { discreteAggregationResultId: 1, exchangeId: 1 },
                { discreteAggregationResultId: 2, exchangeId: 1 },
                { discreteAggregationResultId: 3, exchangeId: 1 },
                { discreteAggregationResultId: 1, exchangeId: 2 },
                { discreteAggregationResultId: 2, exchangeId: 2 },
                { discreteAggregationResultId: 3, exchangeId: 2 },
            ]);
        });
    });
});
