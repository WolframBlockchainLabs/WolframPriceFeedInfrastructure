import AggregateOHLCVEmitter from '#api/ws-api/emitters/AggregateOHLCVEmitter.js';
import BaseUseCase from '#use-cases/BaseUseCase.js';

describe('AggregateOHLCVEmitter Tests', () => {
    BaseUseCase.setConfig({ config: {} });

    const context = {
        config: {
            aggregateOHLCVEmitter: {
                interval: 1000,
                exchanges: [
                    'Binance',
                    'Bitfinex',
                    'Bitget',
                    'Bitstamp',
                    'Bybit',
                    'Gate.io',
                    'Gemini',
                    'Kraken',
                    'KuCoin',
                    'OKX',
                ],
                pairs: [
                    'BTC/EUR',
                    'BTC/USDT',
                    'ETH/USDT',
                    'ETH/EUR',
                    'LTC/BTC',
                ],
            },
        },
    };

    beforeEach(() => {
        jest.useFakeTimers();

        context.amqpClientStub = {};
        context.setIntervalMock = jest.spyOn(global, 'setInterval');
        context.loggerStub = {
            info: jest.fn(),
            error: jest.fn(),
        };
        context.io = {
            emit: jest.fn(),
        };
        context.aggregateCandleSticks = {
            run: jest.fn(),
        };

        context.aggregateOHLCVEmitter = new AggregateOHLCVEmitter({
            logger: context.loggerStub,
            amqpClient: context.amqpClientStub,
            io: context.io,
            config: context.config,
        });

        context.aggregateOHLCVEmitter.aggregateCandleSticks =
            context.aggregateCandleSticks;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    test('run calls super.run() method and schedules emitter', () => {
        const prototypeRunSpy = jest
            .spyOn(
                Object.getPrototypeOf(AggregateOHLCVEmitter.prototype),
                'run',
            )
            .mockImplementation(() => {});

        context.aggregateOHLCVEmitter.run();

        expect(prototypeRunSpy).toHaveBeenCalledTimes(1);
        expect(context.setIntervalMock).toHaveBeenCalledTimes(1);
    });

    test('process calls fetchAggregation method and emits io event', async () => {
        const fetchAggregationSpy = jest.spyOn(
            context.aggregateOHLCVEmitter,
            'fetchAggregation',
        );

        await context.aggregateOHLCVEmitter.process();

        expect(fetchAggregationSpy).toHaveBeenCalledTimes(1);
        expect(context.io.emit).toHaveBeenCalledTimes(1);
    });

    test('fetchAggregation executes aggregateCandleSticks use-case', async () => {
        await context.aggregateOHLCVEmitter.fetchAggregation();

        expect(context.aggregateCandleSticks.run).toHaveBeenCalledTimes(1);
    });
});
