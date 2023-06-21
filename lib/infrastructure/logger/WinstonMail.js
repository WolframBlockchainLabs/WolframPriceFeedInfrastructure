import Transport from 'winston-transport';

const DELAY = 10000;

export default class WinstonMail extends Transport {
    static emailSender = null;

    static setSender(sender) {
        this.emailSender = debounce(sender, DELAY);
    }

    constructor(options) {
        super(options);

        this.to = options.to;
    }

    async log(info, callback) {
        if (this.silent) {
            return callback(null, true);
        }

        if (this.constructor.emailSender) {
            this.constructor.emailSender(info);
        }

        this.emit('logged');
        callback(null, true);
    }
}

function debounce(f, ms) {
    let isCooldown = false;

    return function wrap() {
        if (isCooldown) {
            return;
        }

        f.apply(this, arguments);

        isCooldown = true;

        setTimeout(() => (isCooldown = false), ms);
    };
}
