import winston from 'winston';

const winstonClsFormatter = winston.format((info, options) => {
    if (!options.cls) return info;

    const key = options.contextKey || 'context';
    const metadata = options.cls.get(key);

    if (!metadata) return info;

    return {
        [key]: metadata,
        ...info,
    };
});

export default winstonClsFormatter;
