// import redactSecrets from 'redact-secrets';
import winston from 'winston';
import traverse from 'traverse';
import isSecret from 'is-secret';

const MAX_FIELD_LENGTH = 512;
const REPLACE_SECRET = '[SECRET]';
const REPLACE_BUFFER = '[BUFFER]';

function redactSecrets(redacted) {
    return {
        map,
        forEach,
    };

    function map(obj) {
        return traverse(obj).map(function cb(val) {
            // eslint-disable-next-line no-undef
            if (val instanceof Buffer) {
                this.update(REPLACE_BUFFER);

                return undefined;
            }

            if (typeof val === 'string' && val.length > MAX_FIELD_LENGTH) {
                this.update(`${val.substring(0, MAX_FIELD_LENGTH)}...`);

                return undefined;
            }

            if (isSecret.key(this.key) || isSecret.value(val)) {
                this.update(redacted);

                return undefined;
            }

            return undefined;
        });
    }

    function forEach(obj) {
        traverse(obj).forEach(function cb(val) {
            if (isSecret.key(this.key) || isSecret.value(val)) {
                this.update(redacted);
            }
        });
    }
}

const redact = redactSecrets(REPLACE_SECRET);

export default winston.format((info) => {
    let redacted = {};

    try {
        redacted = redact.map(info);
    } catch (e) {
        console.log(e.stack);
    }

    return {
        ...info,
        ...redacted,
    };
});
