import winston from 'winston';
import traverse from 'traverse';
import isSecret from 'is-secret';

export class Redact {
    static REPLACE_SECRET = '[SECRET]';

    static REPLACE_BUFFER = '[BUFFER]';

    static recordFormatter(val) {
        if (val instanceof Buffer) {
            return this.update(Redact.REPLACE_BUFFER);
        }

        if (
            typeof val === 'string' &&
            this.key &&
            (isSecret.key(this.key) || isSecret.value(val))
        ) {
            return this.update(Redact.REPLACE_SECRET);
        }
    }

    map(obj) {
        return traverse(obj).map(Redact.recordFormatter);
    }

    forEach(obj) {
        traverse(obj).forEach(Redact.recordFormatter);
    }
}

const winstonRedactFormatter = winston.format((info) => {
    const redact = new Redact();
    let redacted = {};

    try {
        redacted = redact.map(info);
    } catch (err) {
        console.log(err);
    }

    return {
        ...info,
        ...redacted,
    };
});

export default winstonRedactFormatter;
