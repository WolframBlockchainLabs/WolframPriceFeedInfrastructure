import winston from 'winston';
import isSecret from 'is-secret';
import traverseObject from '#utils/traverse.js';

function recordFormatter({ key, value }) {
    if (value instanceof Buffer) {
        return '[BUFFER]';
    }

    if (
        typeof value === 'string' &&
        key &&
        (isSecret.key(key) || isSecret.value(value))
    ) {
        return '[SECRET]';
    }
}

const winstonRedactFormatter = winston.format((info) => {
    let redacted = {};

    try {
        redacted = traverseObject(info, recordFormatter);
    } catch (err) {
        console.log(err);
    }

    return {
        ...info,
        ...redacted,
    };
});

export default winstonRedactFormatter;
