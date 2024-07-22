import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import BaseException from '../BaseException.js';

class ChannelClosedException extends BaseException {
    constructor() {
        super({
            code: EXCEPTION_CODES.RABBIT_CHANNEL_IS_CLOSED,
        });
    }
}

export default ChannelClosedException;
