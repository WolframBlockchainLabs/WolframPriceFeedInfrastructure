import winston from 'winston';

const CONTEXT_KEY_DEFAULT = 'context';

export default winston.format((info, options) => {
    if (!options.cls) {
        return info;
    }

    const key = options.contextKey || CONTEXT_KEY_DEFAULT;
    const metadata = options.cls.get(key);

    return {
        [key]: metadata,
        ...info,
    };
});
