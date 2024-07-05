import EventEmitter from 'events';

class MarketEventsManager extends EventEmitter {
    constructor({ marketsAMQPManger, MarketEventHandlers = [] }) {
        super();

        this.marketsAMQPManger = marketsAMQPManger;

        this.MarketEventHandlers = MarketEventHandlers;
        this.marketEventHandlersMap = new Map();
    }

    async init() {
        const eventHandlersInitiationPromises = this.MarketEventHandlers.map(
            async (MarketEventHandler) => {
                const marketEventHandler = new MarketEventHandler({
                    marketsAMQPManger: this.marketsAMQPManger,
                });

                await marketEventHandler.init();

                this.marketEventHandlersMap.set(
                    marketEventHandler.getEventName(),
                    marketEventHandler,
                );
                this.on(
                    marketEventHandler.getEventName(),
                    marketEventHandler.getHandler(),
                );
            },
        );

        return Promise.all(eventHandlersInitiationPromises);
    }

    async close() {
        const handlersList = Array.from(this.marketEventHandlersMap.entries());

        const eventHandlersClosePromises = handlersList.map(
            async ([eventName, marketEventHandler]) => {
                this.removeListener(eventName, marketEventHandler.getHandler());

                await marketEventHandler.close();
            },
        );

        this.marketEventHandlersMap.clear();

        return Promise.all(eventHandlersClosePromises);
    }

    async emitAsync(type, ...args) {
        const handler = this._events?.[type];

        if (!handler) return false;

        if (typeof handler === 'function') {
            await handler.apply(this, args);
        } else {
            await Promise.all(
                handler.map((listener) => listener.apply(this, args)),
            );
        }

        return true;
    }
}

export default MarketEventsManager;
