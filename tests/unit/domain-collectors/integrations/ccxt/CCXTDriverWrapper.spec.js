import CCXTDriverWrapper from '#domain-collectors/integrations/ccxt/CCXTDriverWrapper.js';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';
import ccxt, {
    RateLimitExceeded as CCXTRateLimitExceeded,
    NetworkError,
} from 'ccxt';

describe('[domain-collectors/integrations/ccxt]: CCXTDriverWrapper Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.exchangeId = 'testExchange';
        context.ccxtExchangeAPIStub = {
            loadMarkets: jest.fn(),
            fetchOHLCV: jest.fn(),
            fetchOrderBook: jest.fn(),
            fetchTicker: jest.fn(),
            fetchTrades: jest.fn(),
            timeframes: {
                '1m': '1m',
            },
        };

        ccxt[context.exchangeId] = jest.fn(() => context.ccxtExchangeAPIStub);
        context.ccxtDriverWrapper = new CCXTDriverWrapper({
            exchangeId: context.exchangeId,
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "timeframes" getter should get timeframes from exchangeAPI', async () => {
        const timeframes = context.ccxtDriverWrapper.timeframes;

        expect(timeframes).toEqual(context.ccxtExchangeAPIStub.timeframes);
    });

    test('the "loadMarkets" method should call loadMarkets on exchangeAPI', async () => {
        await context.ccxtDriverWrapper.loadMarkets();

        expect(context.ccxtExchangeAPIStub.loadMarkets).toHaveBeenCalledTimes(
            1,
        );
    });

    test('the "fetchOHLCV" method should call fetchOHLCV on exchangeAPI', async () => {
        await context.ccxtDriverWrapper.fetchOHLCV();

        expect(context.ccxtExchangeAPIStub.fetchOHLCV).toHaveBeenCalledTimes(1);
    });

    test('the "fetchOrderBook" method should call fetchOrderBook on exchangeAPI', async () => {
        await context.ccxtDriverWrapper.fetchOrderBook();

        expect(
            context.ccxtExchangeAPIStub.fetchOrderBook,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "fetchTicker" method should call fetchTicker on exchangeAPI', async () => {
        await context.ccxtDriverWrapper.fetchTicker();

        expect(context.ccxtExchangeAPIStub.fetchTicker).toHaveBeenCalledTimes(
            1,
        );
    });

    test('the "fetchTrades" method should call fetchTrades on exchangeAPI', async () => {
        await context.ccxtDriverWrapper.fetchTrades();

        expect(context.ccxtExchangeAPIStub.fetchTrades).toHaveBeenCalledTimes(
            1,
        );
    });

    test('the "fetchWithErrorTranslation" should throw RateLimitExceededException when CCXTRateLimitExceeded is thrown', async () => {
        context.ccxtExchangeAPIStub.loadMarkets.mockImplementation(() => {
            throw new CCXTRateLimitExceeded();
        });

        await expect(context.ccxtDriverWrapper.loadMarkets()).rejects.toThrow(
            RateLimitExceededException,
        );
    });

    test('the "fetchWithErrorTranslation" should throw same error when other errors are thrown', async () => {
        context.ccxtExchangeAPIStub.loadMarkets.mockImplementation(() => {
            throw new NetworkError();
        });

        await expect(context.ccxtDriverWrapper.loadMarkets()).rejects.toThrow(
            NetworkError,
        );
    });
});
