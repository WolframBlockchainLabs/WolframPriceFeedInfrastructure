import Exception from './Exception.js';

class ChannelClosedException extends Exception {
    constructor() {
        super({
            code: 'RABBIT_CHANNEL_IS_CLOSED',
        });
    }
}

export default ChannelClosedException;
